import os
import requests
import json
import time
import datetime
import subprocess
import pandas as pd
import yfinance as yf
from pytrends.request import TrendReq
from dotenv import load_dotenv
import logging

# ==========================================
# CONFIGURATION & API KEYS
# ==========================================
load_dotenv() # Load variables from .env if present

FRED_API_KEY = os.getenv("FRED_API_KEY")

OUTPUT_FILE = "frontend/public/history.json"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def normalize_score(value, healthy_baseline, danger_threshold):
    """Converts a raw metric into a 0-100 risk score."""
    if healthy_baseline < danger_threshold:
        if value <= healthy_baseline: return 0
        if value >= danger_threshold: return 100
        return int(((value - healthy_baseline) / (danger_threshold - healthy_baseline)) * 100)
    else:
        if value >= healthy_baseline: return 0
        if value <= danger_threshold: return 100
        return int(((healthy_baseline - value) / (healthy_baseline - danger_threshold)) * 100)

def get_fred_data(series_id):
    """Fetches the latest data point from FRED."""
    if not FRED_API_KEY:
        raise ValueError("FRED_API_KEY is not set.")
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=1"
    response = requests.get(url)
    if response.status_code == 200:
        return float(response.json()['observations'][0]['value'])
    raise Exception(f"Failed to fetch FRED data for {series_id}")

def safe_execute(default_val):
    """Decorator to apply DRY try/except logic to our factor functions."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logging.error(f"Error in {func.__name__}: {e}")
                return default_val
        return wrapper
    return decorator

# ==========================================
# FACTOR 1: GPU SPOT PRICES (Vast.ai Free API)
# ==========================================
@safe_execute(default_val=50)
def get_gpu_risk():
    params = {
        'q': '{"external":{"eq":false},"gpu_name":{"eq":"RTX_4090"}}'
    }
    url = "https://console.vast.ai/api/v0/bundles/" 
    res = requests.get(url, params=params).json()
    if 'offers' not in res:
        logging.error(f"Unexpected API response: {res}")
        return 50
    prices = [offer['dph_base'] for offer in res['offers']]
    avg_price = sum(prices) / len(prices) if prices else 0.50
    return normalize_score(avg_price, healthy_baseline=0.50, danger_threshold=0.20)

# ==========================================
# FACTOR 2 & 8: CREDIT SPREADS & LIQUIDITY (FRED)
# ==========================================
@safe_execute(default_val=(50, 50))
def get_macro_risk():
    credit_spread = get_fred_data("BAMLC0A0CM")
    credit_risk = normalize_score(credit_spread, 3.5, 5.5)

    m2_supply = get_fred_data("WM2NS")
    liquidity_risk = normalize_score(m2_supply, healthy_baseline=21000, danger_threshold=20600)
    
    return credit_risk, liquidity_risk

# ==========================================
# FACTOR 4: DEMAND REALITY (Software vs Hardware)
# ==========================================
@safe_execute(default_val=50)
def get_demand_risk():
    igv = yf.Ticker("IGV").history(period="1mo")['Close'].iloc[-1]
    smh = yf.Ticker("SMH").history(period="1mo")['Close'].iloc[-1]
    ratio = igv / smh 
    return normalize_score(ratio, healthy_baseline=0.45, danger_threshold=0.35)

# ==========================================
# FACTOR 7: BEHAVIORAL EXUBERANCE (Retail FOMO)
# ==========================================
@safe_execute(default_val=50)
def get_fomo_risk():
    # Use a manual retry loop to handle Google's 429 Rate Limit errors
    # (Avoids urllib3 method_whitelist error from TrendReq(retries=3))
    for attempt in range(3):
        try:
            pytrend = TrendReq()
            pytrend.build_payload(kw_list=["Nvidia options", "AI investing"], timeframe='now 7-d')
            trends = pytrend.interest_over_time()
            if trends.empty:
                return 50
            fomo_score = trends['Nvidia options'].iloc[-1] + trends['AI investing'].iloc[-1]
            return normalize_score(fomo_score, healthy_baseline=50, danger_threshold=150)
        except Exception as e:
            if attempt == 2:
                raise e # Handled by @safe_execute
            logging.warning(f"Google Trends request failed, retrying in 20s... (Attempt {attempt+1}/3)")
            time.sleep(20)

# ==========================================
# MAIN ORCHESTRATOR
# ==========================================
def run_weekly_pipeline():
    logging.info("Fetching weekly AI bubble metrics...")
    
    gpu_risk = get_gpu_risk()
    macro_result = get_macro_risk()
    if isinstance(macro_result, tuple) and len(macro_result) == 2:
        credit_risk, liquidity_risk = macro_result
    else:
        credit_risk, liquidity_risk = 50, 50

    demand_risk = get_demand_risk()
    fomo_risk = get_fomo_risk()
    
    energy_risk = 40 
    datawall_risk = 50
    erp_risk = 65

    composite = int(
        (demand_risk * 0.20) + (erp_risk * 0.20) + 
        (fomo_risk * 0.15) + (liquidity_risk * 0.15) + 
        (gpu_risk * 0.10) + (credit_risk * 0.10) + 
        (datawall_risk * 0.05) + (energy_risk * 0.05)
    )

    week_id = f"{datetime.date.today().isocalendar()[0]}-W{datetime.date.today().isocalendar()[1]}"
    timestamp = int(time.time())

    new_entry = {
        "weekId": week_id,
        "timestamp": timestamp,
        "factors": {
            "gpu": gpu_risk,
            "credit": credit_risk,
            "energy": energy_risk,
            "demand": demand_risk,
            "datawall": datawall_risk,
            "valuation": erp_risk,
            "behavioral": fomo_risk,
            "liquidity": liquidity_risk
        },
        "score": composite
    }

    try:
        with open(OUTPUT_FILE, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    if len(data) > 0 and data[-1].get("weekId") == week_id:
        data[-1] = new_entry
        logging.info(f"Updated existing entry for {week_id}")
    else:
        data.append(new_entry)
        logging.info(f"Added new entry for {week_id}")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    logging.info(f"Successfully saved to {OUTPUT_FILE}. Composite Score: {composite}%")

    push_to_github()

def push_to_github():
    """Automatically commits and pushes the updated history.json to GitHub"""
    try:
        logging.info("Pushing latest data to GitHub...")
        subprocess.run(["git", "add", OUTPUT_FILE], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Check if there are changes to commit
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if OUTPUT_FILE in status.stdout or OUTPUT_FILE.replace('\\', '/') in status.stdout:
            subprocess.run(["git", "commit", "-m", "data: automated weekly update of bubble metrics"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            subprocess.run(["git", "push"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logging.info("Successfully pushed to GitHub! Vercel will now deploy the update.")
        else:
            logging.info("No new changes detected in history.json to push.")
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to push to GitHub: {e.stderr.decode('utf-8') if e.stderr else str(e)}")

if __name__ == "__main__":
    run_weekly_pipeline()