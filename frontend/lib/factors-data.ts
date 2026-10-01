// ─────────────────────────────────────────────────────────────────────────────
// How the score is built — plain English
// (Per-signal explanations live in lib/plain-english.ts.)
// ─────────────────────────────────────────────────────────────────────────────
export const HOW_IT_WORKS = [
  {
    title: "Step 1 — We fetch real data",
    body: "Every weekday, the pipeline pulls fresh numbers for nine signals from sources like the US Federal Reserve, Yahoo Finance, Google Trends, the Vast.ai GPU marketplace, and Epoch AI. If a source is down, we reuse its last reading and mark the card as possibly out of date.",
  },
  {
    title: "Step 2 — We turn each one into a 0–100 risk score",
    body: "Every signal is measured differently — dollars, percentages, search interest — so we put them on one scale by comparing today's reading with every reading we've recorded so far. If today looks more worrying than almost all of them, the score is close to 100. If it looks calmer than almost all of them, it's close to 0.",
  },
  {
    title: "Step 3 — We blend them into one final score",
    body: "The nine scores are combined into one number. By default each signal counts equally (about 11%). When credit stress, weak software demand, or media hype flares up, that signal counts for more, so the final score reacts faster to the warning signs that matter most.",
  },
];
