# Signal Breakdown Page

## Problem
The main dashboard was trying to do too much. It displayed the hero summary, the time-series chart, the AI analysis, and then dumped all 8 detailed factor cards, the methodology documentation, and the math formulas onto a single scrolling page. For casual users who just want a high-level "bubble status," this was overwhelming. For quantitative users who want to see the exact formula weightings, it was buried too far down.

## Solution
We stripped the main landing page (`page.tsx`) down to its essentials: the hero ticker, the history chart, and the new AI analysis card. We moved all the granular details into a dedicated `/details` route. The new Details page houses the individual factor cards, the grid detailing the specific weighting methodology of the 8 factors, and the mathematical formula breakdown.

## Impact
The landing page now acts as an executive summary that's much faster to parse and load. The Details page serves as a deep dive for the power users, allowing both audiences to get what they want without compromising the UX for either.

## Built in
- `docs/steps/01-daily-data-collection-and-details-page.md`

_Last updated: 2026-08-08_