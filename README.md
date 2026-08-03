# AI Bubble Tracker

[![Weekly Data Update](https://github.com/gkv856/ai-bubble-tracker/actions/workflows/update-data.yml/badge.svg)](https://github.com/gkv856/ai-bubble-tracker/actions/workflows/update-data.yml)

An automated, data-driven dashboard tracking macroeconomic signals to determine if the AI investment cycle is in bubble territory. 

![Dashboard View 1](data/SS1.png)
![Dashboard View 2](data/SS2.png)
![Dashboard View 3](data/SS3.png)

This project pulls data from public APIs to calculate a 0-100 composite risk score based on 8 key factors. It features a zero-cost data collection pipeline and a premium, dark-mode Next.js dashboard.

## 📊 The 8 Macro Signals

The composite risk score is built by weighting the following factors:

1. **Demand Reality (20%)**: IGV/SMH ETF ratio — measures if software demand is keeping pace with hardware speculation.
2. **ERP Valuation (20%)**: Equity Risk Premium — indicates if broader markets are pricing in an implausible future.
3. **Retail FOMO (15%)**: Google Trends for "Nvidia options" + "AI investing" — tracks speculative euphoria.
4. **M2 Liquidity (15%)**: US money supply from FRED — tracks the fuel for risk asset rallies.
5. **GPU Spot Prices (10%)**: RTX 4090 rental cost on Vast.ai — signals real compute demand vs supply gluts.
6. **Credit Spreads (10%)**: Corporate bond spreads — gauges macro stress and lending appetite for capital expenditures.
7. **Energy Permits (5%)**: Proxy for real capital commitment to AI infrastructure buildout.
8. **Data Wall (5%)**: Risk from AI training data exhaustion.

## 🏗️ Architecture

- **Pipeline (`pipeline.py`)**: A Python script that fetches data from Yahoo Finance, FRED, Pytrends, and Vast.ai, normalizes the data into 0-100 risk scores, and outputs `history.json`.
- **Dashboard (`frontend/`)**: A Next.js (React) application styled with Tailwind CSS, utilizing Recharts for data visualization and Lucide-react for iconography.
- **Automation**: Designed to run automatically via GitHub Actions (or local cron jobs) at zero cost.

## 🚀 Setup & Installation

### 1. Data Pipeline Setup (Python)

1. Clone the repository.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Get a free API key from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html).
4. Create a `.env` file in the root directory and add your key: 
   ```
   FRED_API_KEY=your_key_here
   ```
5. Run the pipeline to generate `history.json`:
   ```bash
   python pipeline.py
   ```
   *(Note: Move the generated `history.json` to `frontend/public/` if running locally for the dashboard).*

### 2. Dashboard Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Zero-Cost Automation

You can run this entire stack for free:
- **Data Collection**: GitHub Actions can run `pipeline.py` weekly.
- **Hosting**: GitHub Pages, Vercel, or Netlify can host the Next.js static export.

To automate, set your `FRED_API_KEY` as a GitHub Repository Secret and configure an Actions workflow to run the pipeline, commit `history.json`, and trigger a frontend build.

## ⚠️ Disclaimer

Not financial advice. Educational purposes only. Data sourced from FRED, Yahoo Finance, Vast.ai, and Google Trends.
