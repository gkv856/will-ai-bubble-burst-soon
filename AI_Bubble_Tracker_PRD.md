# AI Bubble Tracker — End-to-End Requirements Document

**Version:** 1.0  
**Date:** 2026-08-09  
**Purpose:** Production-ready specification. An AI coding agent reading this document must be able to build the entire system without any ambiguity.

---

## 1. Executive Summary

The AI Bubble Tracker is a data-driven early-warning system that monitors 9 macroeconomic and narrative signals to assess whether the AI investment cycle is entering bubble territory. It produces a composite risk score between 0 (healthy, sustainable) and 100 (extreme speculative euphoria), along with confidence intervals, historical analog matches, and individual signal diagnostics.

**Key design principles (from Munger inversion):**

1. **Equal-weight priors as default** — all 9 signals start at 11.11% weight. Deviation from equal requires a causal argument, not just statistical fit.
2. **Boom-not-bubble counter-examples** — the system matches current signals against both historical bubbles AND historical booms-that-were-real, preventing perpetual bear bias.
3. **Narrative dominance signal** — tracks "this time is different" reasoning density in earnings calls and investor commentary, a signal that only inversion surfaces.
4. **Honesty under degradation** — confidence intervals widen aggressively when input data is stale or missing. A score of 72 ± 40 is safer than 72 ± 5 built on stale data.

**Tech stack:** Python 3.11+ (FastAPI, pandas, SQLAlchemy), PostgreSQL 15+, Next.js 14 (App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts).

---

## 2. System Architecture

### 2.1 Project Structure

```
root/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint
│   │   ├── config.py                # Env vars, API keys, DB URL
│   │   ├── db/
│   │   │   ├── db.py            # SQLAlchemy ORM models
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── scores.py        # GET /api/scores
│   │   │   │   ├── signals.py       # GET /api/signals/{factor_id}
│   │   │   │   ├── history.py       # GET /api/history
│   │   │   │   ├── analogs.py       # GET /api/analogs
│   │   │   │   └── health.py        # GET /api/health
│   │   │   └── deps.py              # DB session dependency
│   │   └── pipeline/
│   │       ├── orchestrator.py      # Main pipeline entry
│   │       ├── core/
│   │       │   ├── scoring.py       # Normalization + composite
│   │       │   ├── weights.py       # Adaptive weight engine
│   │       │   ├── correlation.py   # Inter-signal correlation
│   │       │   ├── confidence.py    # Confidence interval calc
│   │       │   └── pattern_match.py # Historical analog matching
│   │       └── factors/
│   │           ├── demand_reality.py
│   │           ├── erp_valuation.py
│   │           ├── retail_fomo.py
│   │           ├── m2_liquidity.py
│   │           ├── gpu_spot.py
│   │           ├── credit_spreads.py
│   │           ├── energy_costs.py
│   │           ├── data_wall.py
│   │           └── narrative.py
│   ├── data/
│   │   ├── sql-data.db               # Historical bubble vectors
│   │   └── sql-data.db               # Historical boom vectors
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard home
│   │   └── api/                     # Next.js API routes (proxy)
│   │   └── deails/page.tsx          # Details home
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── ScoreGauge.tsx
│   │   ├── SignalGrid.tsx
│   │   ├── TrendChart.tsx
│   │   ├── AnalogPanel.tsx
│   │   └── ConfidenceBar.tsx
│   ├── lib/
│   │   └── api.ts                   # Fetch helpers
│   └── package.json
└── docker-compose.yml
```

### 2.2 Component Data Flow

```
[Data Sources] → [Factor Modules] → [Scoring Core] → [Orchestrator] → [PostgreSQL]
                                                                        ↓
[Pattern Matcher] ← [Bubble/Boom Libraries]                            [FastAPI]
                                                                        ↓
                                                                  [Next.js Frontend]
```

---

## 3. Signal Definitions & Data Collection

### 3.1 Signal Registry

Each signal has a unique `factor_id` (string), a display `name`, a `category`, and a `noise_profile` that determines whether velocity is safe to compute.

| factor_id        | Name                | Category    | Weight (default) | Noise Profile | Velocity Safe?                  |
| ---------------- | ------------------- | ----------- | ---------------- | ------------- | ------------------------------- |
| `demand_reality` | Demand Reality      | Demand      | 0.1111           | medium        | Yes (with 4wk smoothing)        |
| `erp_valuation`  | ERP Valuation       | Valuation   | 0.1111           | low           | Yes                             |
| `retail_fomo`    | Retail FOMO         | Speculation | 0.1111           | high          | No — level only, or 12wk MA     |
| `m2_liquidity`   | M2 Liquidity        | Monetary    | 0.1111           | low           | Yes                             |
| `gpu_spot`       | GPU Spot Prices     | Supply      | 0.1111           | medium        | Yes (with regime-change detect) |
| `credit_spreads` | Credit Spreads      | Credit      | 0.1111           | low           | Yes                             |
| `energy_costs`   | Energy Costs        | Physical    | 0.1111           | low           | Yes                             |
| `data_wall`      | Data Wall           | Scaling     | 0.1111           | medium        | Yes                             |
| `narrative`      | Narrative Dominance | Sentiment   | 0.1111           | high          | No — level only                 |

### 3.2 Per-Signal Data Collection Specifications

#### 3.2.1 Demand Reality (IGV/SMH Ratio)

- **Source:** Yahoo Finance (`yfinance` Python library)
- **Tickers:** IGV (iShares Expanded Tech-Software Sector ETF), SMH (VanEck Semiconductor ETF)
- **Fetch Logic:**
  1. Call `yfinance.Ticker("IGV").history(period="1y", interval="1wk")`
  2. Call `yfinance.Ticker("SMH").history(period="1y", interval="1wk")`
  3. Compute weekly ratio: `igv_close / smh_close`
  4. Store the latest ratio as `raw_value`
- **Rate Limit:** Yahoo Finance allows ~2000 requests/hour. Cache for 1 hour.
- **Retry:** 3 attempts, exponential backoff (1s, 2s, 4s)
- **Normalization Formula:**
  - Use 5-year rolling percentile rank
  - Low ratio (software lagging hardware) = high risk
  - `score = 100 - percentile_rank(ratio, window=5yr)`
  - Rationale: if IGV/SMH is in the bottom 10th percentile over 5 years, score = 90 (high risk)
- **Velocity:** Compute 4-week and 12-week rate of change of `score`. Apply 4-week exponential smoothing before computing velocity.

#### 3.2.2 ERP Valuation (Equity Risk Premium)

- **Sources:** Yahoo Finance (S&P 500 EPS), FRED (10Y Treasury)
- **Fetch Logic:**
  1. S&P 500 earnings yield: `yfinance.Ticker("^GSPC").info["trailingEps"]` / current SPX price
  2. 10Y Treasury yield: FRED API `series_id = "DGS10"`, `api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`
  3. ERP = earnings_yield - treasury_yield
- **Normalization Formula:**
  - Rolling 5-year percentile rank of ERP
  - Low/negative ERP = high risk
  - `score = 100 - percentile_rank(erp, window=5yr)`
  - Floor: ERP < -2% → score = 100; Ceiling: ERP > 6% → score = 0
- **Velocity:** Yes, safe (low noise). Compute 4wk and 12wk ROC.

#### 3.2.3 Retail FOMO (Google Trends)

- **Source:** SerpApi Google Trends API
- **Search Terms:** `"Nvidia options"`, `"AI investing"`, `"AI stocks buy"`
- **Fetch Logic:**
  1. `GET https://serpapi.com/search?engine=google_trends&q=Nvidia+options,AI+investing,AI+stocks+buy&api_key={SERPAPI_KEY}&date=now+7-d&geo=US`
  2. Average the search interest values across all 3 terms
  3. Store as `raw_value` (0-100 scale from Google)
- **Rate Limit:** 100 searches/month on free tier. Fetch weekly only.
- **Normalization Formula:**
  - Rolling 5-year percentile rank
  - High search interest = high risk
  - `score = percentile_rank(avg_interest, window=5yr)`
- **Velocity:** **NOT SAFE** — Google Trends is spikey (viral tweets cause 300% spikes). Use level only, or 12-week moving average. Do NOT compute 4-week velocity.

#### 3.2.4 M2 Liquidity (Money Supply)

- **Source:** FRED API
- **Series ID:** `WM2NS` (M2 Money Supply, seasonally adjusted)
- **Fetch Logic:**
  1. `GET https://api.stlouisfed.org/fred/series/observations?series_id=WM2NS&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=52` (last 52 weeks)
  2. Store latest value and compute 12-week % change
- **Normalization Formula:**
  - Compute YoY % change of M2
  - Rolling 5-year percentile rank of YoY change
  - Contracting M2 = high risk (drying fuel for risk assets)
  - `score = 100 - percentile_rank(yoy_change, window=5yr)`
- **Velocity:** Yes, safe. M2 is smooth.

#### 3.2.5 GPU Spot Prices (Vast.ai)

- **Source:** Vast.ai API
- **Endpoint:** `GET https://cloud.vast.ai/api/v0/bundles/`
- **Filter:** `gpu_name = "RTX 4090"`, `reliability2 >= 0.9`, `duration >= 1`
- **Fetch Logic:**
  1. Fetch all available RTX 4090 listings
  2. Compute median `cost_per_hour` across listings
  3. Store as `raw_value`
- **Normalization Formula:**
  - Rolling 5-year percentile rank of median price
  - Low GPU price = high risk (supply caught up, demand softening)
  - `score = 100 - percentile_rank(median_price, window=5yr)`
- **Velocity:** Safe with regime-change detection. Use 12-week ROC with a step-function detector (if price drops >20% in 2 weeks, flag as regime change, reset velocity baseline).

#### 3.2.6 Credit Spreads

- **Source:** FRED API
- **Series ID:** `BAMLH0A0HYM2` (ICE BofA US High Yield Index Option-Adjusted Spread)
- **Fetch Logic:**
  1. `GET https://api.stlouisfed.org/fred/series/observations?series_id=BAMLH0A0HYM2&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=52`
  2. Store latest value (in basis points)
- **Normalization Formula:**
  - Rolling 5-year percentile rank
  - Widening spreads = high risk (capital choking off)
  - `score = percentile_rank(spread_bps, window=5yr)`
- **Velocity:** Yes, safe. Credit spreads are autocorrelated.

#### 3.2.7 Energy Costs

- **Source:** FRED API
- **Series ID:** `APUS000072610` (Average retail price of electricity, US city average)
- **Fetch Logic:**
  1. `GET https://api.stlouisfed.org/fred/series/observations?series_id=APUS000072610&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=12`
  2. Store latest value (cents per kWh)
- **Normalization Formula:**
  - Rolling 5-year percentile rank
  - High energy cost = high risk (margin compression on AI infra)
  - `score = percentile_rank(price_cents_per_kwh, window=5yr)`
- **Velocity:** Yes, safe. Energy prices are autocorrelated.

#### 3.2.8 Data Wall (Training Compute Growth)

- **Source:** Epoch AI (`https://epochai.org/data/compute`)
- **Fetch Logic:**
  1. Scrape Epoch AI's compute dataset (or use their CSV export if available)
  2. Extract the peak training compute (FLOP) for the largest disclosed model each year
  3. Compute YoY growth rate
- **Normalization Formula:**
  - Rolling 5-year percentile rank of YoY growth rate
  - Low/negative growth = high risk (scaling stalling)
  - `score = 100 - percentile_rank(yoy_growth, window=5yr)`
  - If YoY growth < 0, score = 100
- **Velocity:** Yes, safe (medium noise).

#### 3.2.9 Narrative Dominance (NEW — Inversion Signal)

- **Source:** Seeking Alpha earnings call transcripts + Finnhub sentiment
- **Fetch Logic:**
  1. Collect latest 50 earnings call transcripts from major AI-exposed companies (NVDA, MSFT, GOOGL, AMZN, META, AMD, PLTR, AI, SMCI)
  2. Use regex/NLP to count instances of "this time is different", "new paradigm", "unlike anything before", "can't compare to", "traditional valuation doesn't apply", "supercycle", "exponential growth will continue"
  3. Compute: `narrative_fraction = (transcripts_with_narrative_phrases) / (total_transcripts_analyzed)`
  4. Store as `raw_value` (0.0 to 1.0)
- **Rate Limit:** Seeking Alpha: 10 requests/min. Finnhub: 60 calls/min on free tier.
- **Normalization Formula:**
  - Rolling 5-year percentile rank (or since data begins)
  - High narrative fraction = high risk
  - `score = percentile_rank(narrative_fraction, window=5yr)`
  - **Add a narrative bonus:** If `narrative_fraction > 0.70`, add +10 to score (capped at 100). Every bubble in history had a dominant narrative that was partially true.
- **Velocity:** **NOT SAFE** — narrative data is spikey around earnings season. Use level only.

### 3.3 Common Fetch Requirements

- **Timeout:** 30 seconds per API call
- **Retry:** 3 attempts, exponential backoff (1s, 2s, 4s)
- **User-Agent:** `ai-bubble-tracker/1.0`
- **Staleness Tracking:** Every factor module must return a `fetched_at` timestamp. If `now - fetched_at > 14 days`, flag the data point as `stale=True` in the database.
- **Error Handling:** On fetch failure, return `score=None, raw_value=None, error_message=str(e), stale=True`. Do NOT substitute a default score.

---

## 4. Scoring & Composite Aggregation

### 4.1 Normalization Bounds (All Signals)

Every signal normalizes to an integer score in [0, 100] using rolling 5-year percentile rank with explicit floors and ceilings:

```
percentile_rank(value, window) = (count of values in window <= current) / (total values in window) * 100
```

After percentile rank:

- Clamp to [0, 100]
- Round to integer
- Store both `score` and `raw_value` in the database

### 4.2 Velocity Computation

For signals where `velocity_safe = True`:

```python
def compute_velocity(scores: list[float], weeks: int) -> float:
    """Compute rate of change over N weeks.
    scores is ordered oldest-first. Last element is current."""
    if len(scores) < weeks + 1:
        return None  # insufficient data
    current = scores[-1]
    past = scores[-(weeks + 1)]
    if past == 0:
        return None
    return (current - past) / abs(past) * 100  # percentage change
```

Store two velocity values per signal: `velocity_4wk` and `velocity_12wk`.

### 4.3 Adaptive Weight Engine

**Starting point (inversion principle):** All weights begin at 1/9 = 0.1111.

**Deviation rules** — weights may only deviate from equal with a documented causal argument:

| Condition                                         | Adjustment                                                                       | Causal Argument                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `credit_spreads` score > 75 AND velocity_4wk > 10 | `credit_spreads` weight → 0.20, redistribute 0.0889 from lowest-velocity signals | Widening credit spreads with velocity historically precede risk-off events              |
| `demand_reality` score > 80                       | `demand_reality` weight → 0.18, redistribute 0.0689 from stable signals          | When software massively lags hardware, this signal carries disproportionate information |
| `narrative` score > 70                            | `narrative` weight → 0.16, redistribute from `energy_costs` and `data_wall`      | Narrative dominance at extreme levels overrides physical constraint signals             |
| No conditions met                                 | All weights remain 0.1111                                                        | Maximum ignorance prior — no evidence to favor any signal                               |

**Redistribution logic:** Excess weight is subtracted proportionally from signals with the lowest absolute velocity (they carry the least new information):

```python
def redistribute(weights: dict, signal_id: str, new_weight: float) -> dict:
    excess = weights[signal_id] - new_weight  # negative = gaining weight
    others = {k: v for k, v in weights.items() if k != signal_id}
    # Remove excess proportionally from lowest-velocity signals
    total_other = sum(others.values())
    for k in others:
        others[k] = others[k] - (abs(excess) * others[k] / total_other)
    others[signal_id] = new_weight
    return others
```

After redistribution, verify `sum(weights) == 1.0` (within floating point epsilon). If not, normalize.

### 4.4 Inter-Signal Correlation Penalty

Compute rolling 12-week pairwise Pearson correlation among all 9 signal scores.

```python
import numpy as np

def correlation_penalty(scores_matrix: np.ndarray) -> float:
    """
    scores_matrix: shape (num_weeks, 9) — each column is a signal's weekly scores
    Returns a penalty in [0, 15] to ADD to the composite score.
    """
    corr_matrix = np.corrcoef(scores_matrix.T)  # 9x9 correlation matrix
    # Take upper triangle, exclude diagonal
    upper_tri = corr_matrix[np.triu_indices(9, k=1)]
    avg_correlation = np.mean(np.abs(upper_tri))

    # Baseline: in normal times, avg |correlation| ≈ 0.2-0.3
    # In crisis, converges to 0.7+
    if avg_correlation > 0.5:
        penalty = (avg_correlation - 0.5) * 30  # maps 0.5→0, 1.0→15
        return min(penalty, 15.0)
    return 0.0
```

### 4.5 Composite Score Formula

```python
def compute_composite(scores: dict, weights: dict, corr_penalty: float) -> dict:
    """
    scores: {factor_id: normalized_score_0_100}
    weights: {factor_id: float}  (sum = 1.0)
    corr_penalty: float from correlation_penalty()
    """
    weighted_sum = sum(scores[fid] * weights[fid] for fid in scores if scores[fid] is not None)

    # Adjust for missing signals — renormalize weights
    available = {fid: scores[fid] for fid in scores if scores[fid] is not None}
    if len(available) < len(scores):
        avail_weight_sum = sum(weights[fid] for fid in available)
        weighted_sum = sum(available[fid] * (weights[fid] / avail_weight_sum) for fid in available)

    composite = weighted_sum + corr_penalty
    composite = min(max(composite, 0), 100)  # clamp

    return {
        "composite_score": round(composite, 1),
        "correlation_penalty": round(corr_penalty, 2),
        "weights_used": weights,
        "signals_available": len(available),
        "signals_total": len(scores),
    }
```

### 4.6 Confidence Interval Calculation

**Base variance:** Weighted sum of individual signal variances (each signal's rolling 12-week variance).

**Degradation multipliers:**

| Condition                                             | Multiplier                                               |
| ----------------------------------------------------- | -------------------------------------------------------- |
| Any signal has `stale=True` (data > 14 days old)      | 1.5× per stale signal                                    |
| `signals_available < signals_total` (missing signals) | 2.0× per missing signal                                  |
| Fewer than 12 weeks of history                        | 3.0×                                                     |
| Correlation penalty > 5                               | 1.3× (signals are coupled, less independent information) |

```python
def compute_confidence_interval(
    composite_score: float,
    base_variance: float,
    stale_count: int,
    missing_count: int,
    history_weeks: int,
    corr_penalty: float,
) -> dict:
    multiplier = 1.0
    multiplier *= 1.5 ** stale_count
    multiplier *= 2.0 ** missing_count
    if history_weeks < 12:
        multiplier *= 3.0
    if corr_penalty > 5:
        multiplier *= 1.3

    std_dev = (base_variance ** 0.5) * multiplier
    lower = max(0, composite_score - 1.96 * std_dev)
    upper = min(100, composite_score + 1.96 * std_dev)

    return {
        "lower": round(lower, 1),
        "upper": round(upper, 1),
        "std_dev": round(std_dev, 2),
        "degradation_multiplier": round(multiplier, 2),
        "confidence_level": "95%",
    }
```

---

## 5. Historical Pattern Matching

### 5.1 Bubble Library

File: `backend/data/bubble_library.json`

Structure: an array of historical bubble episodes. Each episode contains a series of weekly signal vectors leading up to and through the bubble peak.

```json
[
  {
    "episode_id": "dotcom_1998_2000",
    "name": "Dot-Com Bubble",
    "sector": "Technology",
    "peak_date": "2000-03-10",
    "episode_start": "1998-01-01",
    "episode_end": "2002-10-01",
    "max_drawdown_pct": -78,
    "weekly_vectors": [
      {
        "week": "1998-01-05",
        "signals": {
          "demand_reality": 72,
          "erp_valuation": 65,
          "retail_fomo": 58,
          "m2_liquidity": 40,
          "gpu_spot": 50,
          "credit_spreads": 30,
          "energy_costs": 25,
          "data_wall": 45,
          "narrative": 80
        }
      }
    ]
  },
  {
    "episode_id": "crypto_2021",
    "name": "Crypto Bubble 2021",
    "sector": "Cryptocurrency",
    "peak_date": "2021-11-10",
    "episode_start": "2020-01-01",
    "episode_end": "2022-12-31",
    "max_drawdown_pct": -77,
    "weekly_vectors": []
  }
]
```

**Pre-loaded episodes:**

1. Dot-Com Bubble (1998-2000)
2. US Housing Bubble (2005-2008)
3. Crypto Bubble 2017
4. Crypto Bubble 2021
5. Biotech Bubble 2015

### 5.2 Boom Library

File: `backend/data/boom_library.json`

Same structure, but for periods that **looked like bubbles but were real booms**:

**Pre-loaded episodes:**

1. Cloud Computing (2012-2015) — massive CapEx, sustained revenue growth
2. SaaS Expansion (2017-2019) — high valuations, revenue caught up
3. AI/ML Wave 1 (2016-2018) — first hype cycle, plateaued but didn't burst

### 5.3 Cosine Similarity Matching

```python
import numpy as np

def match_analogs(
    current_vector: dict,  # {factor_id: score}
    library: list,         # bubble_library or boom_library
    top_k: int = 3,
) -> list:
    """Find top-K closest historical analogs using cosine similarity."""
    current = np.array([current_vector[fid] for fid in sorted(current_vector)])

    results = []
    for episode in library:
        for week_data in episode["weekly_vectors"]:
            historical = np.array([week_data["signals"][fid] for fid in sorted(current_vector)])
            similarity = np.dot(current, historical) / (np.linalg.norm(current) * np.linalg.norm(historical))

            # Compute lead time to peak
            weeks_to_peak = (pd.Timestamp(episode["peak_date"]) - pd.Timestamp(week_data["week"])).days // 7

            results.append({
                "episode_id": episode["episode_id"],
                "episode_name": episode["name"],
                "week_matched": week_data["week"],
                "similarity": round(float(similarity), 3),
                "weeks_to_peak": weeks_to_peak,
                "max_drawdown_pct": episode["max_drawdown_pct"],
            })

    # Sort by similarity descending, take top K
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]
```

### 5.4 Adjusted Risk Output

Run matching against BOTH libraries. Output:

```json
{
  "bubble_analogs": [
    {
      "episode_name": "Dot-Com Bubble",
      "similarity": 0.82,
      "weeks_to_peak": 52,
      "max_drawdown_pct": -78
    }
  ],
  "boom_analogs": [
    {
      "episode_name": "Cloud Computing 2013",
      "similarity": 0.71,
      "weeks_to_peak": null,
      "max_drawdown_pct": null
    }
  ],
  "adjusted_risk": "MODERATE-HIGH",
  "adjustment_reason": "Bubble similarity is high (0.82) but boom similarity is non-trivial (0.71), indicating uncertainty between bubble and sustainable boom"
}
```

**Adjustment logic:**

- If `best_bubble_similarity > 0.80` AND `best_boom_similarity < 0.50` → risk stays as-is (strong bubble signal)
- If `best_bubble_similarity > 0.70` AND `best_boom_similarity > 0.60` → reduce risk level by one tier (boom signal is non-trivial)
- If `best_boom_similarity > best_bubble_similarity` → reduce risk level by two tiers (boom signal dominates)

---

## 6. Pipeline Orchestration

### 6.1 Weekly Pipeline Steps

The pipeline runs every **Sunday at 02:00 UTC** via cron (or APScheduler).

```
Step 1: Fetch raw data for all 9 signals (parallel, with timeout 30s each)
Step 2: Normalize each signal to 0-100 score
Step 3: Compute velocity for velocity-safe signals
Step 4: Compute adaptive weights
Step 5: Compute inter-signal correlation penalty
Step 6: Compute composite score
Step 7: Compute confidence interval
Step 8: Run historical pattern matching (bubble + boom)
Step 9: Store all results in PostgreSQL
Step 10: Update materialized view for API consumption
```

### 6.2 Orchestrator Pseudocode

```python
async def run_weekly_pipeline():
    """Main pipeline entrypoint. Called by scheduler."""
    run_id = generate_uuid()
    run_date = datetime.utcnow()

    # Step 1: Fetch all signals in parallel
    tasks = [fetch_signal(fid) for fid in FACTOR_IDS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Step 2-3: Normalize + velocity
    signal_outputs = {}
    for fid, result in zip(FACTOR_IDS, results):
        if isinstance(result, Exception):
            signal_outputs[fid] = SignalOutput(score=None, error=str(result), stale=True)
        else:
            score = normalize(result.raw_value, fid)
            velocity = compute_velocity_if_safe(score_history, fid)
            signal_outputs[fid] = SignalOutput(score=score, raw_value=result.raw_value,
                                                velocity_4wk=velocity[0], velocity_12wk=velocity[1],
                                                fetched_at=result.fetched_at, stale=False)

    # Step 4: Adaptive weights
    weights = compute_adaptive_weights(signal_outputs)

    # Step 5: Correlation penalty
    scores_matrix = load_last_12_weeks_of_scores()
    corr_penalty = correlation_penalty(scores_matrix)

    # Step 6: Composite score
    composite = compute_composite(
        scores={fid: s.score for fid, s in signal_outputs.items()},
        weights=weights,
        corr_penalty=corr_penalty
    )

    # Step 7: Confidence interval
    confidence = compute_confidence_interval(
        composite_score=composite["composite_score"],
        base_variance=compute_base_variance(signal_outputs),
        stale_count=sum(1 for s in signal_outputs.values() if s.stale),
        missing_count=sum(1 for s in signal_outputs.values() if s.score is None),
        history_weeks=count_history_weeks(),
        corr_penalty=corr_penalty,
    )

    # Step 8: Pattern matching
    current_vector = {fid: s.score for fid, s in signal_outputs.items() if s.score is not None}
    bubble_analogs = match_analogs(current_vector, bubble_library, top_k=3)
    boom_analogs = match_analogs(current_vector, boom_library, top_k=3)
    adjusted_risk = compute_adjusted_risk(bubble_analogs, boom_analogs)

    # Step 9: Store
    store_pipeline_run(run_id, run_date, signal_outputs, composite, confidence,
                       bubble_analogs, boom_analogs, adjusted_risk, weights, corr_penalty)
```

### 6.3 Staleness & Data Quality

After Step 9, the orchestrator logs a quality report:

```json
{
  "run_id": "uuid",
  "run_date": "2026-08-09T02:00:00Z",
  "signals_fresh": 8,
  "signals_stale": 1,
  "signals_missing": 0,
  "oldest_data_age_hours": 168,
  "quality_verdict": "ACCEPTABLE" // GREEN: 0 stale, YELLOW: 1-2 stale, RED: 3+ stale
}
```

If quality_verdict is RED, the pipeline still stores results but flags the run as `low_confidence=True` in the database. The frontend displays a warning banner.

---

## 7. Database Schema

### 7.1 Tables

#### `pipeline_runs`

| Column                | Type         | Constraints                       | Description                          |
| --------------------- | ------------ | --------------------------------- | ------------------------------------ |
| `id`                  | UUID         | PK, default gen_random_uuid()     | Unique run identifier                |
| `run_date`            | TIMESTAMPTZ  | NOT NULL                          | When the pipeline ran                |
| `composite_score`     | NUMERIC(5,1) | CHECK (0-100)                     | Final composite score                |
| `composite_lower`     | NUMERIC(5,1) |                                   | 95% CI lower bound                   |
| `composite_upper`     | NUMERIC(5,1) |                                   | 95% CI upper bound                   |
| `composite_std_dev`   | NUMERIC(5,2) |                                   | Standard deviation after degradation |
| `correlation_penalty` | NUMERIC(4,2) | DEFAULT 0                         | Correlation penalty added            |
| `weights_used`        | JSONB        | NOT NULL                          | Snapshot of weights used             |
| `quality_verdict`     | VARCHAR(10)  | CHECK IN ('GREEN','YELLOW','RED') | Data quality verdict                 |
| `low_confidence`      | BOOLEAN      | DEFAULT FALSE                     | Flag for degraded runs               |
| `created_at`          | TIMESTAMPTZ  | DEFAULT NOW()                     | Row insertion time                   |

```sql
CREATE TABLE pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_date TIMESTAMPTZ NOT NULL,
    composite_score NUMERIC(5,1) CHECK (composite_score >= 0 AND composite_score <= 100),
    composite_lower NUMERIC(5,1),
    composite_upper NUMERIC(5,1),
    composite_std_dev NUMERIC(5,2),
    correlation_penalty NUMERIC(4,2) DEFAULT 0,
    weights_used JSONB NOT NULL,
    quality_verdict VARCHAR(10) CHECK (quality_verdict IN ('GREEN', 'YELLOW', 'RED')),
    low_confidence BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runs_date ON pipeline_runs (run_date DESC);
```

#### `signal_scores`

| Column          | Type          | Constraints                     | Description                    |
| --------------- | ------------- | ------------------------------- | ------------------------------ |
| `id`            | UUID          | PK                              |                                |
| `run_id`        | UUID          | FK → pipeline_runs.id, NOT NULL | Parent run                     |
| `factor_id`     | VARCHAR(30)   | NOT NULL                        | e.g. "demand_reality"          |
| `raw_value`     | NUMERIC(12,4) |                                 | Raw value before normalization |
| `score`         | INTEGER       | CHECK (0-100) or NULL           | Normalized score               |
| `velocity_4wk`  | NUMERIC(6,2)  |                                 | 4-week % change of score       |
| `velocity_12wk` | NUMERIC(6,2)  |                                 | 12-week % change of score      |
| `fetched_at`    | TIMESTAMPTZ   |                                 | When data was fetched          |
| `stale`         | BOOLEAN       | DEFAULT FALSE                   | Is data > 14 days old?         |
| `error_message` | TEXT          |                                 | Error if fetch failed          |
| `created_at`    | TIMESTAMPTZ   | DEFAULT NOW()                   |                                |

```sql
CREATE TABLE signal_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
    factor_id VARCHAR(30) NOT NULL,
    raw_value NUMERIC(12,4),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    velocity_4wk NUMERIC(6,2),
    velocity_12wk NUMERIC(6,2),
    fetched_at TIMESTAMPTZ,
    stale BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_run ON signal_scores (run_id);
CREATE INDEX idx_scores_factor ON signal_scores (factor_id, run_id);
```

#### `analog_matches`

| Column             | Type         | Constraints                | Description                            |
| ------------------ | ------------ | -------------------------- | -------------------------------------- |
| `id`               | UUID         | PK                         |                                        |
| `run_id`           | UUID         | FK → pipeline_runs.id      |                                        |
| `library_type`     | VARCHAR(10)  | CHECK IN ('bubble','boom') | Which library                          |
| `episode_id`       | VARCHAR(50)  |                            | e.g. "dotcom_1998_2000"                |
| `episode_name`     | VARCHAR(100) |                            | Display name                           |
| `week_matched`     | DATE         |                            | Historical week that matched           |
| `similarity`       | NUMERIC(5,3) |                            | Cosine similarity 0-1                  |
| `weeks_to_peak`    | INTEGER      |                            | Weeks from matched week to bubble peak |
| `max_drawdown_pct` | INTEGER      |                            | Maximum drawdown in that episode       |

```sql
CREATE TABLE analog_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
    library_type VARCHAR(10) CHECK (library_type IN ('bubble', 'boom')),
    episode_id VARCHAR(50),
    episode_name VARCHAR(100),
    week_matched DATE,
    similarity NUMERIC(5,3),
    weeks_to_peak INTEGER,
    max_drawdown_pct INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analogs_run ON analog_matches (run_id);
```

#### `signal_history` (materialized for fast API queries)

| Column            | Type         | Description |
| ----------------- | ------------ | ----------- |
| `run_date`        | TIMESTAMPTZ  |             |
| `factor_id`       | VARCHAR(30)  |             |
| `score`           | INTEGER      |             |
| `composite_score` | NUMERIC(5,1) |             |

```sql
CREATE MATERIALIZED VIEW signal_history AS
SELECT
    pr.run_date,
    ss.factor_id,
    ss.score,
    pr.composite_score
FROM pipeline_runs pr
JOIN signal_scores ss ON ss.run_id = pr.id
WITH DATA;

CREATE INDEX idx_history_date ON signal_history (run_date DESC);
```

Refresh after each pipeline run: `REFRESH MATERIALIZED VIEW signal_history;`

---

## 8. API Specifications

### 8.1 Endpoints

All endpoints are under `/api/v1`. Responses use `application/json`.

#### `GET /api/v1/scores/latest`

Returns the most recent composite score with all signal details.

**Response:**

```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "run_date": "2026-08-09T02:00:00Z",
  "composite_score": 62.3,
  "confidence_interval": {
    "lower": 48.1,
    "upper": 76.5,
    "std_dev": 7.2,
    "degradation_multiplier": 1.5,
    "confidence_level": "95%"
  },
  "correlation_penalty": 2.1,
  "quality_verdict": "YELLOW",
  "low_confidence": false,
  "signals": [
    {
      "factor_id": "demand_reality",
      "name": "Demand Reality",
      "score": 71,
      "raw_value": 0.3241,
      "velocity_4wk": 3.2,
      "velocity_12wk": 8.1,
      "stale": false,
      "weight_used": 0.1111
    },
    {
      "factor_id": "retail_fomo",
      "name": "Retail FOMO",
      "score": 85,
      "raw_value": 72.3,
      "velocity_4wk": null,
      "velocity_12wk": null,
      "stale": false,
      "weight_used": 0.1111
    }
  ],
  "analogs": {
    "bubble": [
      {
        "episode_name": "Dot-Com Bubble",
        "similarity": 0.82,
        "weeks_to_peak": 52,
        "max_drawdown_pct": -78
      }
    ],
    "boom": [
      {
        "episode_name": "Cloud Computing 2013",
        "similarity": 0.71,
        "weeks_to_peak": null,
        "max_drawdown_pct": null
      }
    ],
    "adjusted_risk": "MODERATE-HIGH",
    "adjustment_reason": "Bubble similarity is high (0.82) but boom similarity is non-trivial (0.71)"
  }
}
```

#### `GET /api/v1/history?weeks=52`

Returns weekly composite scores and per-signal scores for the requested number of weeks.

**Query Params:**

- `weeks` (integer, default 52, max 260)

**Response:**

```json
{
  "data": [
    {
      "run_date": "2026-08-09",
      "composite_score": 62.3,
      "signals": {
        "demand_reality": 71,
        "erp_valuation": 58,
        "retail_fomo": 85,
        "m2_liquidity": 42,
        "gpu_spot": 55,
        "credit_spreads": 38,
        "energy_costs": 45,
        "data_wall": 30,
        "narrative": 78
      }
    }
  ]
}
```

#### `GET /api/v1/signals/{factor_id}/history?weeks=52`

Returns history for a single signal including raw values and velocity.

**Response:**

```json
{
  "factor_id": "demand_reality",
  "name": "Demand Reality",
  "data": [
    {
      "run_date": "2026-08-09",
      "score": 71,
      "raw_value": 0.3241,
      "velocity_4wk": 3.2,
      "velocity_12wk": 8.1
    }
  ]
}
```

#### `GET /api/v1/analogs`

Returns latest pattern matching results with both bubble and boom analogs.

**Response:**

```json
{
  "run_date": "2026-08-09",
  "bubble_analogs": [
    {
      "episode_name": "Dot-Com Bubble",
      "similarity": 0.82,
      "weeks_to_peak": 52,
      "max_drawdown_pct": -78
    },
    {
      "episode_name": "Crypto 2021",
      "similarity": 0.68,
      "weeks_to_peak": 24,
      "max_drawdown_pct": -77
    }
  ],
  "boom_analogs": [
    {
      "episode_name": "Cloud Computing 2013",
      "similarity": 0.71,
      "weeks_to_peak": null,
      "max_drawdown_pct": null
    }
  ],
  "adjusted_risk": "MODERATE-HIGH",
  "adjustment_reason": "Bubble similarity is high (0.82) but boom similarity is non-trivial (0.71)"
}
```

#### `GET /api/v1/health`

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "last_pipeline_run": "2026-08-09T02:00:00Z",
  "last_run_quality": "YELLOW",
  "stale_signals": ["m2_liquidity"],
  "database_connected": true
}
```

### 8.2 Error Responses

All errors follow this shape:

```json
{
  "error": {
    "code": "SIGNAL_NOT_FOUND",
    "message": "Factor 'invalid_signal' not found in registry",
    "status": 404
  }
}
```

| Code               | Status | When                        |
| ------------------ | ------ | --------------------------- |
| `NO_DATA`          | 503    | No pipeline runs exist yet  |
| `SIGNAL_NOT_FOUND` | 404    | Invalid factor_id           |
| `INVALID_PARAMS`   | 400    | weeks > 260 or negative     |
| `DB_ERROR`         | 500    | Database connection failure |

### 8.3 CORS & Caching

- CORS: Allow `http://localhost:3000` (Next.js dev) and production domain
- Cache: `GET /scores/latest` → cache 1 hour (stale-while-revalidate)
- Cache: `GET /history` → cache 24 hours

---

## 9. Frontend Specifications

### 9.1 Pages & Layout

**Single-page dashboard** at `/` (root). No routing needed.

Layout (responsive, max-width 1440px):

```
┌─────────────────────────────────────────────────┐
│  Header: "AI Bubble Tracker" + last updated      │
├─────────────────────┬───────────────────────────┤
│                     │                           │
│  Score Gauge        │  Confidence Bar           │
│  (large, centered)  │  (horizontal range bar)   │
│                     │                           │
├─────────────────────┴───────────────────────────┤
│                                                 │
│  Signal Grid (3×3 cards)                        │
│  Each card: name, score, velocity arrow,        │
│  sparkline of last 12 weeks, stale indicator    │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Trend Chart (Recharts LineChart)               │
│  Composite score over time + individual signals │
│  as toggleable lines                            │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Analog Panel                                   │
│  Bubble matches (left) vs Boom matches (right)  │
│  Similarity bars, weeks-to-peak, drawdown       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 9.2 Components

#### `ScoreGauge`

- Circular gauge (Recharts PieChart with 1 segment)
- Shows `composite_score` as large number in center
- Color: 0-30 green, 31-50 yellow-green, 51-70 orange, 71-100 red
- Label below: "Risk Level: LOW / MODERATE / HIGH / EXTREME"
- If `low_confidence=True`: overlay a semi-transparent warning stripe with "⚠ Low Confidence"

#### `ConfidenceBar`

- Horizontal bar from 0 to 100
- Filled region: `[composite_lower, composite_upper]` in accent color
- Vertical marker at `composite_score`
- Labels: lower bound, score, upper bound
- If `degradation_multiplier > 1.5`: show "⚠ Degraded data — interval widened" in amber

#### `SignalGrid`

- 3×3 responsive CSS grid
- Each card (`SignalCard`):
  - Title: signal name
  - Large number: score (colored same as gauge gradient)
  - Velocity: arrow icon + 4wk velocity value (or "N/A" if not velocity-safe)
  - Sparkline: 12-week mini line chart (Recharts Line, no axes, no legend)
  - Stale badge: "STALE" in amber if `stale=True`
  - Weight badge: show current weight if ≠ 0.1111

#### `TrendChart`

- Recharts `LineChart` with `ResponsiveContainer`
- X-axis: date (weekly)
- Y-axis: 0-100
- Lines: composite score (thick, primary color) + individual signal scores (thin, toggleable via legend clicks)
- Default: show composite + top 3 signals by score
- Data source: `GET /history?weeks=52`

#### `AnalogPanel`

- Two-column layout
- Left: "Bubble Matches" — top 3 analogs from bubble library
- Right: "Boom Matches" — top 3 analogs from boom library
- Each analog card: episode name, similarity bar (filled to similarity%), weeks to peak, max drawdown
- Center: `adjusted_risk` badge and `adjustment_reason` text

#### `WarningBanner` (conditional)

- Show if `quality_verdict` is YELLOW or RED
- "Data quality: YELLOW — 1 signal has stale data. Results may be less reliable."
- "Data quality: RED — 3+ signals have stale data. Treat scores with caution."

### 9.3 Data Fetching & Refresh

- On page load: fetch `GET /scores/latest` and `GET /history?weeks=52` in parallel
- Polling: re-fetch latest every 5 minutes (stale-while-revalidate via SWR or React Query)
- Loading state: skeleton cards (shadcn/ui Skeleton)
- Error state: error boundary with retry button

### 9.4 Responsive Breakpoints

| Breakpoint          | Layout                                              |
| ------------------- | --------------------------------------------------- |
| < 640px (mobile)    | Single column, SignalGrid 1×9, AnalogPanel stacked  |
| 640-1024px (tablet) | 2 columns, SignalGrid 3×3, AnalogPanel side-by-side |
| > 1024px (desktop)  | Full layout as described above                      |

---

## 10. Appendix: Sample Data Payloads

### 10.1 Full Pipeline Run Output (stored in DB)

```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "run_date": "2026-08-09T02:00:00Z",
  "signals": {
    "demand_reality": {
      "score": 71,
      "raw_value": 0.3241,
      "velocity_4wk": 3.2,
      "velocity_12wk": 8.1,
      "stale": false
    },
    "erp_valuation": {
      "score": 58,
      "raw_value": 0.0234,
      "velocity_4wk": -1.1,
      "velocity_12wk": 2.3,
      "stale": false
    },
    "retail_fomo": {
      "score": 85,
      "raw_value": 72.3,
      "velocity_4wk": null,
      "velocity_12wk": null,
      "stale": false
    },
    "m2_liquidity": {
      "score": 42,
      "raw_value": 21250.0,
      "velocity_4wk": -0.3,
      "velocity_12wk": -1.2,
      "stale": true
    },
    "gpu_spot": {
      "score": 55,
      "raw_value": 0.32,
      "velocity_4wk": -5.2,
      "velocity_12wk": -12.1,
      "stale": false
    },
    "credit_spreads": {
      "score": 38,
      "raw_value": 3.21,
      "velocity_4wk": 0.8,
      "velocity_12wk": 2.1,
      "stale": false
    },
    "energy_costs": {
      "score": 45,
      "raw_value": 16.82,
      "velocity_4wk": 0.5,
      "velocity_12wk": 1.8,
      "stale": false
    },
    "data_wall": {
      "score": 30,
      "raw_value": 4.2,
      "velocity_4wk": -2.1,
      "velocity_12wk": -5.3,
      "stale": false
    },
    "narrative": {
      "score": 78,
      "raw_value": 0.72,
      "velocity_4wk": null,
      "velocity_12wk": null,
      "stale": false
    }
  },
  "composite": {
    "composite_score": 62.3,
    "correlation_penalty": 2.1,
    "weights_used": {
      "demand_reality": 0.1111,
      "erp_valuation": 0.1111,
      "retail_fomo": 0.1111,
      "m2_liquidity": 0.1111,
      "gpu_spot": 0.1111,
      "credit_spreads": 0.1111,
      "energy_costs": 0.1111,
      "data_wall": 0.1111,
      "narrative": 0.1111
    },
    "signals_available": 9,
    "signals_total": 9
  },
  "confidence": {
    "lower": 48.1,
    "upper": 76.5,
    "std_dev": 7.2,
    "degradation_multiplier": 1.5,
    "confidence_level": "95%"
  },
  "analogs": {
    "bubble": [
      {
        "episode_name": "Dot-Com Bubble",
        "similarity": 0.82,
        "weeks_to_peak": 52,
        "max_drawdown_pct": -78
      },
      {
        "episode_name": "Crypto 2021",
        "similarity": 0.68,
        "weeks_to_peak": 24,
        "max_drawdown_pct": -77
      },
      {
        "episode_name": "Housing 2007",
        "similarity": 0.54,
        "weeks_to_peak": 40,
        "max_drawdown_pct": -52
      }
    ],
    "boom": [
      {
        "episode_name": "Cloud Computing 2013",
        "similarity": 0.71,
        "weeks_to_peak": null,
        "max_drawdown_pct": null
      },
      {
        "episode_name": "SaaS 2018",
        "similarity": 0.59,
        "weeks_to_peak": null,
        "max_drawdown_pct": null
      }
    ],
    "adjusted_risk": "MODERATE-HIGH",
    "adjustment_reason": "Bubble similarity is high (0.82) but boom similarity is non-trivial (0.71), indicating uncertainty between bubble and sustainable boom"
  },
  "quality_verdict": "YELLOW",
  "low_confidence": false
}
```

### 10.2 Bubble Library Entry (Full Example)

```json
{
  "episode_id": "dotcom_1998_2000",
  "name": "Dot-Com Bubble",
  "sector": "Technology",
  "peak_date": "2000-03-10",
  "episode_start": "1998-01-01",
  "episode_end": "2002-10-01",
  "max_drawdown_pct": -78,
  "weekly_vectors": [
    {
      "week": "1999-09-06",
      "signals": {
        "demand_reality": 75,
        "erp_valuation": 80,
        "retail_fomo": 85,
        "m2_liquidity": 55,
        "gpu_spot": 60,
        "credit_spreads": 25,
        "energy_costs": 30,
        "data_wall": 40,
        "narrative": 90
      }
    },
    {
      "week": "1999-12-27",
      "signals": {
        "demand_reality": 82,
        "erp_valuation": 88,
        "retail_fomo": 92,
        "m2_liquidity": 50,
        "gpu_spot": 65,
        "credit_spreads": 22,
        "energy_costs": 28,
        "data_wall": 35,
        "narrative": 95
      }
    }
  ]
}
```

### 10.3 Adaptive Weights Scenario (Credit Spreads Widening)

Given:

- `credit_spreads.score = 82` (was 55 last month)
- `credit_spreads.velocity_4wk = 49.1` (massive widening)

Triggered condition: score > 75 AND velocity_4wk > 10

```json
{
  "weights_before": {
    "demand_reality": 0.1111,
    "erp_valuation": 0.1111,
    "retail_fomo": 0.1111,
    "m2_liquidity": 0.1111,
    "gpu_spot": 0.1111,
    "credit_spreads": 0.1111,
    "energy_costs": 0.1111,
    "data_wall": 0.1111,
    "narrative": 0.1111
  },
  "weights_after": {
    "demand_reality": 0.1111,
    "erp_valuation": 0.1111,
    "retail_fomo": 0.1111,
    "m2_liquidity": 0.1111,
    "gpu_spot": 0.1111,
    "credit_spreads": 0.2,
    "energy_costs": 0.0899,
    "data_wall": 0.0899,
    "narrative": 0.0899
  },
  "adjustment_reason": "Credit spreads >75 with velocity >10 — upweighting from 0.1111 to 0.20; redistributing 0.0889 from 3 lowest-velocity signals"
}
```

### 10.4 Frontend API Response Shapes

**`/scores/latest` response (complete):**
(See Section 8.1 — this is the same shape shown there)

**`/history?weeks=4` response:**

```json
{
  "data": [
    {
      "run_date": "2026-07-19",
      "composite_score": 58.1,
      "signals": {
        "demand_reality": 67,
        "erp_valuation": 55,
        "retail_fomo": 82,
        "m2_liquidity": 44,
        "gpu_spot": 58,
        "credit_spreads": 35,
        "energy_costs": 43,
        "data_wall": 28,
        "narrative": 75
      }
    },
    {
      "run_date": "2026-07-26",
      "composite_score": 59.4,
      "signals": {
        "demand_reality": 69,
        "erp_valuation": 56,
        "retail_fomo": 83,
        "m2_liquidity": 43,
        "gpu_spot": 57,
        "credit_spreads": 36,
        "energy_costs": 44,
        "data_wall": 29,
        "narrative": 76
      }
    },
    {
      "run_date": "2026-08-02",
      "composite_score": 60.8,
      "signals": {
        "demand_reality": 70,
        "erp_valuation": 57,
        "retail_fomo": 84,
        "m2_liquidity": 42,
        "gpu_spot": 56,
        "credit_spreads": 37,
        "energy_costs": 44,
        "data_wall": 29,
        "narrative": 77
      }
    },
    {
      "run_date": "2026-08-09",
      "composite_score": 62.3,
      "signals": {
        "demand_reality": 71,
        "erp_valuation": 58,
        "retail_fomo": 85,
        "m2_liquidity": 42,
        "gpu_spot": 55,
        "credit_spreads": 38,
        "energy_costs": 45,
        "data_wall": 30,
        "narrative": 78
      }
    }
  ]
}
```

---

_End of document._
