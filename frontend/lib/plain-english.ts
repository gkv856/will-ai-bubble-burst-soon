import type { SignalTrend } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Plain-English copy for each signal.
//
// Every score is a rank against the readings recorded so far: score = the share
// of past readings that today is more worrying than. 100 = most worrying we have
// seen, 0 = calmest. (The backend flips the direction for signals where a LOW
// value is the risky one, so the score always reads the same way.)
//
// Every question is phrased so that "yes" is the worrying answer.
// ─────────────────────────────────────────────────────────────────────────────

/** "far " | "" | "a little " — slotted in front of a comparison word. */
type Adverb = string;

export interface SignalCopy {
  id: string;
  /** Short technical name — shown as a small label above the question. */
  title: string;
  /** The question a layman would ask. "Yes" always means worrying. */
  question: string;
  /** Sentence used when today looks more worrying than usual. */
  worse: (adverb: Adverb) => string;
  /** Sentence used when today looks calmer than usual. */
  calm: (adverb: Adverb) => string;
  /** Sentence used when today sits in the middle of the pack. */
  middle: string;
  /** Why this signal matters for the AI bubble. */
  why: string;
  /** Where the number comes from. */
  source: string;
  /** Formats the raw reading for the "See the numbers" panel. */
  reading: (raw: number) => string;
}

const pct = (v: number, digits = 1) => `${v.toFixed(digits)}%`;

export const SIGNAL_COPY: Record<string, SignalCopy> = {
  credit_spreads: {
    id: "credit_spreads",
    title: "Credit spreads",
    question: "Are lenders getting nervous?",
    worse: (a) => `Risky companies are paying ${a}more to borrow than usual.`,
    calm: (a) => `Risky companies are paying ${a}less to borrow than usual.`,
    middle: "Borrowing costs for risky companies are about usual.",
    why: "AI firms run on borrowed money. When loans get pricey, the spending spree slows.",
    source: "ICE BofA high-yield bond spread, from the US Federal Reserve (FRED).",
    reading: (v) => `Risky companies pay ${pct(v, 2)} extra interest on top of what the US government pays.`,
  },
  erp_valuation: {
    id: "erp_valuation",
    title: "Stock valuation",
    question: "Are stocks pricey next to safe bonds?",
    worse: (a) => `Stocks look ${a}more expensive next to safe bonds than usual.`,
    calm: (a) => `Stocks look ${a}cheaper next to safe bonds than usual.`,
    middle: "Stocks look about as pricey next to bonds as usual.",
    why: "When safe bonds pay almost as much as stocks, investors have less reason to hold risky shares, and prices can fall.",
    source: "S&P 500 earnings (via the SPY fund) and the 10-year US Treasury yield (FRED).",
    reading: (v) =>
      `Stocks earn ${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(1)} percentage points ${v >= 0 ? "more" : "less"} than a safe 10-year government bond.`,
  },
  demand_reality: {
    id: "demand_reality",
    title: "Demand reality",
    question: "Is AI software demand falling behind chips?",
    worse: (a) => `Software stocks are lagging chip stocks ${a}more than usual.`,
    calm: (a) => `Software stocks are keeping up with chip stocks ${a}better than usual.`,
    middle: "Software and chip stocks are moving together about as usual.",
    why: "If real customers aren't paying for AI software, the chip boom may be hype.",
    source: "Prices of the IGV software fund and the SMH chip fund (Yahoo Finance).",
    reading: (v) => `Software fund price ÷ chip fund price = ${v.toFixed(2)}. A lower number means software is falling behind.`,
  },
  retail_fomo: {
    id: "retail_fomo",
    title: "Retail FOMO",
    question: "Is everyone rushing to buy AI stocks?",
    worse: (a) => `Interest in buying AI stocks is ${a}higher than usual.`,
    calm: (a) => `Interest in buying AI stocks is ${a}lower than usual.`,
    middle: "Interest in buying AI stocks is about normal.",
    why: "Bubbles tend to peak when everyday investors pile in.",
    source: "Google Trends, US searches for “Nvidia options”, “AI investing” and “AI stocks buy”.",
    reading: (v) => `Search interest is ${Math.round(v)} out of 100.`,
  },
  m2_liquidity: {
    id: "m2_liquidity",
    title: "Liquidity",
    question: "Is money getting tighter?",
    worse: (a) => `Money in the system is growing ${a}more slowly than usual.`,
    calm: (a) => `Money in the system is growing ${a}faster than usual.`,
    middle: "Money in the system is growing at about its usual pace.",
    why: "Easy money feeds bubbles. When it dries up, prices tend to fall.",
    source: "US M2 money supply, change over the past year (FRED).",
    reading: (v) => `The US money supply grew ${pct(v)} over the past year.`,
  },
  gpu_spot: {
    id: "gpu_spot",
    title: "GPU prices",
    question: "Is renting AI chips getting cheap?",
    worse: (a) => `Renting a top AI chip is ${a}cheaper than usual.`,
    calm: (a) => `Renting a top AI chip costs ${a}more than usual.`,
    middle: "AI chip rental prices are about usual.",
    why: "Falling rental prices can mean too many chips and too few buyers.",
    source: "Median hourly rental price of an RTX 4090 graphics card on Vast.ai.",
    reading: (v) => `Renting one RTX 4090 costs about $${v.toFixed(2)} an hour.`,
  },
  energy_costs: {
    id: "energy_costs",
    title: "Energy costs",
    question: "Is power getting too costly to run AI?",
    worse: (a) => `Electricity costs ${a}more than usual.`,
    calm: (a) => `Electricity costs ${a}less than usual.`,
    middle: "Electricity prices are about usual.",
    why: "Data centres use huge amounts of power. Costly power squeezes AI profits.",
    source: "Average US retail electricity price (FRED).",
    reading: (v) => `Electricity costs about ${(v * 100).toFixed(1)}¢ per kilowatt-hour.`,
  },
  data_wall: {
    id: "data_wall",
    title: "Data wall",
    question: "Is AI progress slowing down?",
    worse: (a) => `The biggest AI training runs are growing ${a}more slowly than usual.`,
    calm: (a) => `The biggest AI training runs are growing ${a}faster than usual.`,
    middle: "The biggest AI training runs are growing at a typical pace.",
    why: "Markets are pricing in fast AI progress. If it stalls, those hopes can unravel.",
    source: "Epoch AI's database of AI training runs.",
    reading: (v) => `Year-over-year growth in AI training power: ${v.toFixed(1)}.`,
  },
  narrative: {
    id: "narrative",
    title: "Narrative",
    question: "Is the news getting carried away?",
    worse: (a) => `AI news is using ${a}more hype language than usual.`,
    calm: (a) => `AI news is using ${a}less hype language than usual.`,
    middle: "Hype language in AI news is about usual.",
    why: "Bubbles are loud. “This time is different” talk often shows up near the top.",
    source: "Share of AI-related tech headlines (Finnhub) using phrases like “this time is different”.",
    reading: (v) => `${Math.round(v * 100)}% of AI headlines use hype language.`,
  },
};

/** Canonical display order (used for tie-breaks and the methodology list). */
export const SIGNAL_ORDER = Object.keys(SIGNAL_COPY);

// ─────────────────────────────────────────────────────────────────────────────
// Risk levels
// ─────────────────────────────────────────────────────────────────────────────

export type RiskLevel = "high" | "mid" | "low";

// Same cut-offs as the composite gauge (see status-utils.ts getRiskColor).
export function riskLevel(score: number): RiskLevel {
  if (score < 40) return "low";
  if (score < 70) return "mid";
  return "high";
}

export const LEVEL_COPY: Record<RiskLevel, { group: string; pill: string }> = {
  high: { group: "Needs attention", pill: "Red: worrying" },
  mid: { group: "Keep watching", pill: "Amber: keep watching" },
  low: { group: "Looks calm", pill: "Green: calm" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Answer + sentences
// ─────────────────────────────────────────────────────────────────────────────

/** The short answer to the card's question, e.g. "Yes, strongly". */
export function describeAnswer(score: number): string {
  if (score >= 85) return "Yes, strongly";
  if (score >= 70) return "Yes";
  if (score >= 56) return "A little";
  if (score >= 40) return "About normal";
  if (score > 15) return "No";
  return "No, not at all";
}

/** One plain sentence comparing today's reading with what's usual. */
export function describeScore(copy: SignalCopy, score: number): string {
  if (score >= 40 && score <= 55) return copy.middle;
  if (score > 55) return copy.worse(score >= 85 ? "far " : score >= 70 ? "" : "a little ");
  return copy.calm(score <= 15 ? "far " : "");
}

/** The exact rank, for the "See the numbers" panel. `since` is a short date like "Jul 26". */
export function describeRank(score: number, since: string | null): string {
  const span = since ? `since ${since}` : "so far";
  if (score >= 100) return `The most worrying reading we've recorded ${span}.`;
  if (score <= 0) return `The calmest reading we've recorded ${span}.`;
  if (score >= 50) return `More worrying than ${score}% of the readings we've recorded ${span}.`;
  return `Calmer than ${100 - score}% of the readings we've recorded ${span}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend
// ─────────────────────────────────────────────────────────────────────────────

const TREND_THRESHOLD = 5; // points of score movement before we call it a change

export interface TrendTag {
  kind: "worse" | "better" | "flat";
  label: string;
}

export function describeTrend(trend: SignalTrend | null | undefined): TrendTag | null {
  if (!trend) return null;
  const when = trend.daysAgo >= 27 ? "a month ago" : `${trend.daysAgo} days ago`;
  if (trend.delta >= TREND_THRESHOLD) return { kind: "worse", label: `Worse than ${when}` };
  if (trend.delta <= -TREND_THRESHOLD) return { kind: "better", label: `Better than ${when}` };
  return { kind: "flat", label: `About the same as ${when}` };
}
