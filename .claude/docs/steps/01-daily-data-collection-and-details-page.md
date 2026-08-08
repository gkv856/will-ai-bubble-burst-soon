---
title: Daily Data Pipeline and UI Split
date: 2026-08-08
description: Transitioned the data collection pipeline from weekly to daily runs, integrated Gemini Flash for AI trend analysis, backfilled 14 days of data, and split the frontend into a lean landing page and a dedicated /details page.
---

# Daily Data Pipeline and UI Split

## Why
Waiting 10 weeks to build a trend line was too slow in the fast-moving AI space. We needed higher resolution data (daily) to capture short-term speculation cycles, along with an automated LLM integration to interpret the raw signals for users. Additionally, the landing page was becoming cluttered, necessitating a split between the high-level dashboard and the granular methodology/breakdown.

## What we built

1. **Daily Data Pipeline (`backend/pipeline/`)**
   - Refactored `orchestrator.py` to run daily and accept a `--backfill` flag.
   - Swapped out slow-moving monthly FRED series for daily equivalents:
     - M2 money supply → Daily overnight reverse repo (`RRPONTSYD`) for liquidity.
     - Monthly electricity → Daily WTI crude oil (`DCOILWTICO`) for energy costs.
   - Added `get_fred_series()` to support historical window fetching.
   - Restructured `data.json` storage to key entries by `dayId` instead of `weekId`.

2. **AI Analysis Integration**
   - Created `clients/gemini.py` using a lightweight REST client for Gemini 2.0 Flash.
   - Instructed the model to act as a cynical quantitative macro analyst.
   - Configured graceful fallback if the Gemini API is rate-limited or the key is missing.

3. **Data Backfill Script**
   - Built a robust, standalone `backfill.py` script.
   - Fetches 14 days of historical data for all 8 factors, handling API-specific rate limits (e.g., FRED 120/min limit, SerpApi's unique date constraints).
   - Generates daily entries, scores them using the composite weighting, and merges them into `data.json`.

4. **Frontend Architecture**
   - **`page.tsx`**: Stripped down to a minimal, high-impact landing page. Now features just the hero section, the live signal ticker, the composite score gauge, the history chart, and the new AI analysis card.
   - **`details/page.tsx`**: A new, dedicated subpage housing all 8 factor cards, the methodology grid, the math breakdown, and the email signup component.
   - **Types**: Updated `types.ts` to support daily data fields and the `aiAnalysis` string.

## Verified
- Ran `backfill.py --days 14` which successfully queried FRED, yfinance, SerpApi, Vast.ai, and Epoch AI.
- `data.json` populated with 22 entries (14 days of recent backfilled data).
- The frontend successfully renders the daily chart layout and properly displays the AI analysis card on the root page, with navigation successfully linking to the `/details` route.

## Not built (this step)
- Did not implement an automated cron trigger on the hosting platform (though GitHub Actions was updated to run Mon-Fri).
- Did not backfill Vast.ai or Epoch AI historically (as they lack historical APIs; they just populate the current date's value across the backfill window).

## What's next
- Need to verify the GitHub Actions runner properly executes the daily pipeline tomorrow.
- May want to add caching for the Gemini API call if it gets expensive.