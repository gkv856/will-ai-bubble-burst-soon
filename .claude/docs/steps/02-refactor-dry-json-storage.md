---
description: Reverted database/API server architectural drift back to JSON-only data storage, and refactored the Next.js frontend to keep all files under 300 lines following DRY principles. Added ISR.
---

# Refactoring: DRY UI components and JSON storage

## Why

The project architecture had drifted significantly. A backend API server and SQLite database were introduced, which violated the core invariant of the project (`data.json` as the single source of truth). Furthermore, several frontend components (`MathBreakdown.tsx`, `chart.tsx`, `page.tsx`, `details/page.tsx`) had grown beyond 300 lines, violating DRY principles and reducing maintainability.

## What we built

- **Reverted Architectural Drift:** Removed `backend/app/` (API server) and `backend/db/` (SQLite database). Restored the backend pipeline to simply write to `data.json`.
- **DRY Component Extraction:** 
  - Shrunk `MathBreakdown.tsx` from ~650 lines to 76 lines by extracting `FactorAccordion`, `WeeklyScorePanel`, `EquationDisplay`, and `StepCard`.
  - Extracted shared components `StatusIcon` and `TickerBar`.
  - Shrunk `chart.tsx` from 374 lines to 170 lines by extracting `ChartTooltip` and `ChartLegend`.
- **Data Abstraction:** Moved large constant datasets (`FACTORS`, `HOW_IT_WORKS`) into `frontend/lib/factors-data.ts`.
- **ISR Optimization:** Added `export const revalidate = 3600;` to Next.js routes to statically build the site while fetching new data periodically, optimizing for the new `data.json` pattern.

## Verified

- `npm run build` completed successfully, producing static pages for `/` and `/details`.
- All Next.js routes built successfully and size limits were well within constraints (121 kB first load JS).
- Git status confirms the complete removal of the bloated python API and DB directories.

## Not built (this step)

- We did not write automated tests or change the backend's core scraping mechanisms.

## What's next

- Adding comprehensive E2E Playwright testing to verify UI layout and routing interactions.
- Configuring GitHub actions to automate these new ISR builds.
