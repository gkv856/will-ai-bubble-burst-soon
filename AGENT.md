# AGENT.md — AI Bubble Tracker

Instructions for any AI agent working on this repository.

## What This Project Is

An automated, data-driven dashboard tracking macroeconomic signals to determine if the AI investment cycle is in bubble territory. It calculates a 0–100 composite risk score from 8 weighted factors, refreshed weekly by GitHub Actions, and displayed on a premium dark-mode Next.js dashboard.

**Live:** <https://will-ai-bubble-burst-soon.vercel.app/>

## Project Map

```
backend/
  main.py                       # Entrypoint — parses --no-push, calls orchestrator
  pipeline/
    orchestrator.py             # Composes all 8 factor scores into a weekly history.json entry
    clients/
      fred.py                   # FRED API client (credit, liquidity, energy, valuation)
    core/
      config.py                 # Env vars, OUTPUT_FILE path
      scoring.py                # normalize_score(), safe_execute() decorator
      types.py                  # FactorScores, HistoryEntry TypedDicts
    factors/
      behavioral.py             # Retail FOMO — Google Trends via SerpApi (15%)
      credit.py                 # Credit spreads from FRED (10%)
      datawall.py               # Data wall — Epoch AI training compute (5%)
      demand.py                 # Demand reality — IGV/SMH ratio via yfinance (20%)
      energy.py                 # Energy costs from FRED (5%)
      gpu.py                    # GPU spot prices — Vast.ai (10%)
      liquidity.py              # M2 money supply from FRED (15%)
      valuation.py              # ERP — S&P earnings yield vs 10Y Treasury (20%)
    storage/
      history.py                # load/save/upsert history.json
      publisher.py              # git commit + push history.json

frontend/                       # Next.js (React) + Tailwind CSS + Recharts + Lucide
  app/                          # Next.js app router pages
  components/                   # Dashboard UI components
  lib/                          # Utilities
  public/
    history.json                # THE data file — written by backend, read by frontend

data/                           # Screenshots for README

.github/workflows/
  update-data.yml               # Weekly GitHub Actions pipeline (Wed 9:00 AM IST)
```

## Architecture Invariants

1. **history.json is the single source of truth.** Backend writes it; frontend reads it. No other data exchange path exists between the two.
2. **Each factor is a standalone module** under `backend/pipeline/factors/`. It fetches its own data, scores it 0–100, and returns an int. No factor knows about any other factor.
3. **Weights live in the orchestrator**, not in individual factors. The composite formula is in `orchestrator.py`.
4. **The pipeline is idempotent per week.** Running it twice in the same ISO week upserts (replaces) rather than appending a duplicate entry.
5. **Zero-cost stack.** GitHub Actions runs the pipeline; Vercel hosts the frontend. No paid infrastructure.
6. **`safe_execute` decorator** wraps every factor. If a data source fails, the factor returns a default (usually 50) rather than crashing the pipeline.

## Operational Rules

- **Never commit API keys.** Keys live in `.env` (local) or GitHub Actions secrets (CI). The `.env.example` documents required keys.
- **`--no-push` for local dev.** Always use `python main.py --no-push` when testing pipeline changes locally.
- **history.json is append-only in spirit.** The upsert logic only replaces the latest week's entry. Never delete or rewrite older entries.
- **Factor scores are 0–100 integers.** 0 = no risk, 100 = maximum risk. All factors use `normalize_score()` from `core/scoring.py`.

## Data Sources & API Keys

| Factor       | Source                | Key Required     |
| ------------ | --------------------- | ---------------- |
| demand       | Yahoo Finance         | None             |
| valuation    | Yahoo Finance + FRED  | `FRED_API_KEY`   |
| behavioral   | Google Trends/SerpApi | `SERPAPI_KEY`    |
| liquidity    | FRED                  | `FRED_API_KEY`   |
| gpu          | Vast.ai               | None             |
| credit       | FRED                  | `FRED_API_KEY`   |
| energy       | FRED                  | `FRED_API_KEY`   |
| datawall     | Epoch AI              | None             |

## Dev Commands

```bash
# Backend — run pipeline locally
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py --no-push

# Frontend — run dashboard locally
cd frontend
npm install
npm run dev        # http://localhost:3000
```

## What Does NOT Exist Yet

- No milestones.md or value-statement.md — project governance docs are not yet created.
- No test suite — neither backend nor frontend have automated tests.
- No CI lint or type-check step.
