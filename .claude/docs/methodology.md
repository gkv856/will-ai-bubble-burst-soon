---
title: "AI Bubble Tracker Methodology"
description: "Documentation of the 8 macroeconomic signals and composite risk score calculation used to track the AI investment cycle."
date: "2026-08-08"
version: "1.0"
---

# AI Bubble Tracker Methodology

The AI Bubble Tracker calculates a composite risk score between 0 and 100 to determine if the AI investment cycle is entering bubble territory. The score is entirely data-driven, pulling from public APIs and financial data sources to measure demand, valuation, liquidity, and systemic stress.

A score of **0** indicates a healthy, sustainable investment cycle (no risk), while a score of **100** indicates extreme speculative euphoria and macro fragility (maximum risk).

The overall risk score is a weighted average of **8 core macroeconomic signals**.

## The 8 Macro Signals

### 1. Demand Reality (20%)

- **Source:** Yahoo Finance
- **Metric:** IGV (Software ETF) to SMH (Semiconductor ETF) ratio.
- **Rationale:** This measures if downstream software revenue and demand are keeping pace with upstream hardware speculation. If semiconductor stocks are massively outperforming software stocks, it signals that the market is buying "picks and shovels" without an equivalent boom in end-user applications.

### 2. ERP Valuation (20%)

- **Source:** Yahoo Finance & FRED
- **Metric:** Equity Risk Premium (ERP) calculated as the S&P 500 earnings yield minus the 10-year US Treasury yield.
- **Rationale:** The ERP measures the excess return investors demand for holding stocks over risk-free bonds. A compressed or negative premium signals that markets are pricing in an implausible, flawless future for equities, which is a classic hallmark of a bubble.

### 3. Retail FOMO (15%)

- **Source:** Google Trends (via SerpApi)
- **Metric:** Search interest for speculative terms like "Nvidia options" and "AI investing".
- **Rationale:** Tracks retail investor participation and speculative euphoria. Bubbles typically peak when retail interest and "Fear Of Missing Out" (FOMO) reach their absolute maximums.

### 4. M2 Liquidity (15%)

- **Source:** FRED (Federal Reserve Economic Data)
- **Metric:** US M2 Money Supply.
- **Rationale:** Liquidity is the fuel for risk asset rallies. A growing money supply provides the capital necessary to sustain high valuations. Conversely, contracting liquidity strains risk assets and can be a catalyst for a bubble bursting.

### 5. GPU Spot Prices (10%)

- **Source:** Vast.ai
- **Metric:** Hourly rental cost of RTX 4090 GPUs.
- **Rationale:** GPU spot prices act as a real-time proxy for compute demand versus supply gluts. Dropping spot prices indicate that supply has caught up to or exceeded demand, challenging the narrative of infinite compute scarcity.

### 6. Credit Spreads (10%)

- **Source:** FRED
- **Metric:** US Corporate Bond Spreads (e.g., ICE BofA US High Yield Index Option-Adjusted Spread).
- **Rationale:** Gauges systemic macro stress and lending appetite. Tight spreads mean easy access to capital for expensive AI expenditures (CapEx). Widening spreads indicate fear in credit markets, choking off the capital intensive AI build-out.

### 7. Energy Costs (5%)

- **Source:** FRED
- **Metric:** US Retail Electricity Prices.
- **Rationale:** AI data centers are immensely power-hungry. Rapidly rising energy prices signal that the physical grid is straining to support AI infrastructure, potentially imposing hard physical limits and margin compression on AI profitability.

### 8. Data Wall (5%)

- **Source:** Epoch AI
- **Metric:** Year-over-year growth in the highest disclosed AI training compute.
- **Rationale:** Measures the pace of AI capability scaling. Flat or negative growth in peak training compute signals that scaling laws may have hit a physical, financial, or data wall, invalidating the premise of exponential continuous improvement.

## Scoring Normalization

Each individual factor fetches its respective data and translates it into an independent 0–100 integer score. The normalization process for each metric is defined within its specific module (located under `backend/pipeline/factors/`).

The `backend/pipeline/core/scoring.py` module ensures that all raw metrics are safely bounded and transformed into this standard 0–100 risk scale before being aggregated.

## Composite Aggregation

The final composite risk score is calculated in `backend/pipeline/orchestrator.py` by multiplying each factor's normalized score (0-100) by its designated weight:

```python
Composite Score = (Demand Reality * 0.20) +
                  (ERP Valuation * 0.20) +
                  (Retail FOMO * 0.15) +
                  (M2 Liquidity * 0.15) +
                  (GPU Spot Prices * 0.10) +
                  (Credit Spreads * 0.10) +
                  (Energy Costs * 0.05) +
                  (Data Wall * 0.05)
```

The pipeline runs weekly to generate a new data entry containing both the individual factor scores and the final composite score, which is then passed to the frontend for visualization.
