"use client";

import { useState, useId, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// External prop
// ─────────────────────────────────────────────────────────────────────────────
interface LatestData {
  weekId: string;
  score: number;
  factors: Record<string, number>;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A visual equation — rendered as a fraction or a simple expression */
interface VisualEquation {
  /** Left-hand side label, e.g. "Risk Score" */
  result: string;
  /** How to display the right-hand side */
  kind: "fraction" | "expression";
  /** Fraction: top of the fraction bar */
  numerator?: { value: string; label: string };
  /** Fraction: bottom of the fraction bar */
  denominator?: { value: string; label: string };
  /** Expression: a flat formula string like "Trends A + Trends B" */
  expression?: string;
  /** Optional suffix unit on the result side */
  unit?: string;
  /** An extra line of context below the equation */
  caption?: string;
}

interface FactorExplain {
  id: string;
  title: string;
  weight: number;
  emoji: string;
  oneLiner: string;
  equation: VisualEquation;
  whatWeWatch: string;
  whyItMatters: string;
  howWeScore: string;
  example: string;
  isEstimate?: boolean;
  estimateNote?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const FACTORS: FactorExplain[] = [
  {
    id: "demand",
    title: "Demand Reality",
    weight: 20,
    emoji: "📊",
    oneLiner: "Are people actually buying AI software, or just the chips?",
    equation: {
      result: "ratio",
      kind: "fraction",
      numerator: { value: "IGV", label: "Software ETF price" },
      denominator: { value: "SMH", label: "Semiconductor ETF price" },
      caption: "ratio ≥ 0.45 → 0% risk   ·   ratio ≤ 0.35 → 100% risk",
    },
    whatWeWatch:
      "We look at two stock market ETFs every week. IGV is a basket of software companies like Salesforce and Adobe. SMH is a basket of chip companies like Nvidia and TSMC. We divide IGV's price by SMH's price to get a ratio.",
    whyItMatters:
      "Think of it like a restaurant boom. If everyone is buying kitchen equipment (chips) but no restaurants are actually serving food (software), that's a red flag. Real demand means the software side should be keeping up. When chips shoot up but software lags behind, it smells like speculation, not real growth.",
    howWeScore:
      "If the ratio is 0.45 or above — software is keeping up — we score 0 risk. If it drops to 0.35 or below — software is being left in the dust — we score 100. Everything in between is a straight line.",
    example:
      "Say IGV is at $90 and SMH is at $200. The ratio is 0.45 — healthy, 0 risk. But if IGV stays at $90 and SMH rockets to $260, ratio drops to 0.35 — maximum danger.",
  },
  {
    id: "valuation",
    title: "ERP Valuation",
    weight: 20,
    emoji: "💰",
    oneLiner: "Are stock prices leaving any cushion for risk, or none at all?",
    equation: {
      result: "ERP",
      kind: "expression",
      expression: "S&P 500 earnings yield − 10Y Treasury yield",
      unit: "%",
      caption: "ERP ≥ 4% → 0% risk   ·   ERP ≤ 0% → 100% risk",
    },
    whatWeWatch:
      "Every week we pull the S&P 500's trailing earnings yield — the inverse of its P/E ratio, via the SPY ETF — and the 10-year US Treasury yield from the Federal Reserve. Subtracting the treasury yield from the earnings yield gives the Equity Risk Premium (ERP): the extra return investors are getting for holding riskier stocks instead of a safe government bond.",
    whyItMatters:
      "If stocks barely pay more than a 'risk-free' bond — or pay less — that means investors have gotten so excited about AI that they've bid prices up to silly levels. History says when this gap closes to zero or goes negative, markets are dangerously overvalued. The 2000 dot-com crash happened when this exact thing occurred.",
    howWeScore:
      "ERP at 4% or above = stocks offer a healthy cushion over bonds, 0 risk. ERP at 0% or below = stocks pay no premium at all for the extra risk, 100 risk. Linear in between.",
    example:
      "Right now the S&P 500's trailing P/E is around 27, an earnings yield of roughly 3.7%. The 10-year Treasury yields about 4.75%. That's a −1% ERP — stocks are priced to return less than a boring government bond, which is why this factor is reading near maximum risk.",
  },
  {
    id: "behavioral",
    title: "Retail FOMO",
    weight: 15,
    emoji: "🔥",
    oneLiner: "Are everyday people going crazy about AI stocks?",
    equation: {
      result: "FOMO score",
      kind: "expression",
      expression: `"Nvidia options" + "AI investing"`,
      caption: "score ≤ 50 → 0% risk   ·   score ≥ 150 → 100% risk",
    },
    whatWeWatch:
      `Every week we check Google Trends for two search terms: "Nvidia options" and "AI investing". Google gives each a score from 0 to 100 based on how popular they are. We add both scores together.`,
    whyItMatters:
      "Throughout history, bubbles have a tell: regular people — your parents, your barber, your Uber driver — start talking about the hot new investment. When everyone's Googling how to buy Nvidia options, that's usually a sign smart money already bought in, and the last buyers are always the ones who lose.",
    howWeScore:
      "Combined score of 50 or less = everyone is calm, 0 risk. Combined score of 150 or more = peak FOMO, 100 risk. Linear between.",
    example:
      'If "Nvidia options" scores 60 and "AI investing" scores 70, that\'s a combined 130 — getting into the danger zone. If both are around 25, combined 50, markets are calm.',
  },
  {
    id: "liquidity",
    title: "M2 Liquidity",
    weight: 15,
    emoji: "💧",
    oneLiner: "Is there enough money flowing around to keep the AI party going?",
    equation: {
      result: "M2",
      kind: "expression",
      expression: "All bank deposits + savings in circulation (billions $)",
      caption: "M2 ≥ $21,000B → 0% risk   ·   M2 ≤ $20,600B → 100% risk",
    },
    whatWeWatch:
      "We pull M2 Money Supply from the US Federal Reserve every week. M2 is basically a measure of all the money in circulation — bank deposits, savings accounts, and so on — in billions of dollars.",
    whyItMatters:
      "Think of money supply like the water level in a swimming pool. When the Fed prints more money and lowers interest rates (pool fills up), everything floats — stocks, crypto, AI companies. When they drain the pool (raise rates, reduce money supply), everything sinks. The 2022 AI winter happened as M2 contracted.",
    howWeScore:
      "M2 at $21,000B or above = plenty of liquidity, 0 risk. M2 at $20,600B or below = tightening conditions, 100 risk. Linear between.",
    example:
      "If M2 is $20,800B, we're halfway between healthy and danger — so the score is around 50. If the Fed starts printing again and M2 climbs to $21,500B, risk drops to 0.",
  },
  {
    id: "gpu",
    title: "GPU Spot Prices",
    weight: 10,
    emoji: "🖥️",
    oneLiner: "Is AI compute demand actually real, or is supply piling up?",
    equation: {
      result: "avg price",
      kind: "fraction",
      numerator: { value: "sum of all RTX 4090 rental prices", label: "from Vast.ai marketplace" },
      denominator: { value: "number of active listings", label: "on Vast.ai" },
      unit: "$/hr",
      caption: "avg ≥ $0.50/hr → 0% risk   ·   avg ≤ $0.20/hr → 100% risk",
    },
    whatWeWatch:
      "We check Vast.ai — a marketplace where anyone can rent GPU computing power by the hour, like Airbnb for graphics cards. We specifically look at the average rental price for RTX 4090 GPUs.",
    whyItMatters:
      "If everyone really needs AI compute, prices should stay high because supply can't keep up with demand. If prices collapse, it means either companies massively over-built data centres, or demand dropped off. Cheap GPUs sound great for developers, but for the bubble question it's a warning sign.",
    howWeScore:
      "Average price $0.50/hr or above = healthy demand, 0 risk. Price drops to $0.20/hr or below = supply glut / demand collapse, 100 risk.",
    example:
      "Say the average RTX 4090 rents for $0.35/hr. That's halfway between $0.50 and $0.20, so the score is around 50. If prices stay at $0.60/hr, demand is clearly there — 0 risk.",
  },
  {
    id: "credit",
    title: "Credit Spreads",
    weight: 10,
    emoji: "📉",
    oneLiner: "Are bond markets nervous about company debt?",
    equation: {
      result: "spread",
      kind: "expression",
      expression: "Corporate bond yield − US Treasury yield",
      unit: "%",
      caption: "spread ≤ 3.5% → 0% risk   ·   spread ≥ 5.5% → 100% risk",
    },
    whatWeWatch:
      "We pull a number from the US Federal Reserve called the Corporate OAS Spread. It measures how much extra interest big companies have to pay to borrow money compared to the US government.",
    whyItMatters:
      "When lenders get nervous, they charge companies more to borrow. That extra cost is the 'spread'. A wide spread means lenders think companies might default — they're scared. When companies can't borrow cheaply, the cheap-debt-fuelled AI investment binge has to stop. Before the 2008 crash, spreads went to 6–8%.",
    howWeScore:
      "Spread at 3.5% or below = banks are relaxed, 0 risk. Spread at 5.5% or above = lenders are scared, 100 risk.",
    example:
      "If the spread is at 4.5% — right in the middle — the risk score is 50. If spreads tighten back to 2.5%, banks are basically giving money away. 0 risk. If spreads widen to 6%, something is breaking. 100 risk.",
  },
  {
    id: "datawall",
    title: "Data Wall",
    weight: 5,
    emoji: "🧱",
    oneLiner: "Has AI training-compute scaling stalled out?",
    equation: {
      result: "Risk Score",
      kind: "expression",
      expression: "ΔOOM(max training FLOP), this year vs. last year",
      caption: "growth ≥ 1 order of magnitude/yr → 0% risk   ·   growth ≤ 0 (no new record) → 100% risk",
    },
    whatWeWatch:
      "Every week we pull Epoch AI's public dataset of 1,000+ notable AI models, tracking the training compute (in FLOP) disclosed for each one all the way back to the 1950s. We take the highest compute figure ever disclosed as of today and compare it to the highest figure disclosed exactly one year ago.",
    whyItMatters:
      "For years, AI capability gains came largely from throwing ~10x more compute at bigger models every year. If that scaling curve flattens — if nobody's beaten last year's record — it means labs have hit a wall on cost, chips, or data. That's exactly the scenario that could stall the capability gains Wall Street has priced in.",
    howWeScore:
      "We measure the change in orders of magnitude (powers of 10) between this year's record and last year's record. A full order of magnitude of growth (10x, the historical pace) or more scores 0 risk. Zero growth — nobody beat last year's record — scores 100 risk. Linear in between.",
    example:
      "If the biggest disclosed model a year ago used 5×10²⁵ FLOP, and today's biggest is 5×10²⁶ FLOP, that's a full 10x jump — 0 risk. Right now the record hasn't budged in over a year, which is why this factor is reading 100.",
  },
  {
    id: "energy",
    title: "Energy Costs",
    weight: 5,
    emoji: "⚡",
    oneLiner: "Is the power grid straining to feed AI data centres?",
    equation: {
      result: "price",
      kind: "fraction",
      numerator: { value: "$/kWh", label: "US retail electricity price" },
      denominator: { value: "FRED", label: "APU000072610, monthly" },
      unit: "$/kWh",
      caption: "price ≤ $0.15/kWh → 0% risk   ·   price ≥ $0.22/kWh → 100% risk",
    },
    whatWeWatch:
      "AI data centres are power-hungry — a single large one can use as much electricity as a small city. We pull the average US retail electricity price (cents per kilowatt-hour) from the Federal Reserve every week.",
    whyItMatters:
      "Electricity prices climbing faster than normal is a real-world sign that AI's power appetite is outpacing what the grid can comfortably supply. That pressure eventually shows up as higher operating costs for AI companies and public pushback on new data centres — both of which can slow the buildout.",
    howWeScore:
      "Price at $0.15/kWh or below = grid has slack, 0 risk. Price at $0.22/kWh or above = real strain, 100 risk. Linear in between.",
    example:
      "The average US price was about $0.14/kWh in late 2021 and has climbed to roughly $0.20/kWh now — that's already more than halfway to the danger threshold, which is why this factor is elevated.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// How the score is built — plain English
// ─────────────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    title: "Step 1 — We fetch real data",
    body: "Each week, the pipeline automatically pulls live numbers from sources like the US Federal Reserve, Yahoo Finance, Google Trends, the Vast.ai GPU marketplace, and Epoch AI's model dataset. All eight signals are fetched live — nothing is hand-estimated.",
  },
  {
    title: "Step 2 — We convert each signal into a 0–100 risk score",
    body: "Every signal is completely different — one is a dollar amount, another is a percentage, another is a search trend. So we need to put them all on the same scale. We define a healthy level and a danger level for each signal. If we're at the healthy level, the score is 0. If we're at the danger level, the score is 100. If we're somewhere in between, the score slides proportionally.",
  },
  {
    title: "Step 3 — We combine them into one final score",
    body: "The eight risk scores are blended into one number using weights. We give more weight to signals we think are more predictive. Demand Reality and Valuation each get 20% — they're the most fundamental. FOMO and Liquidity each get 15%. GPU prices and Credit spreads each get 10%. Energy and Data Wall get 5% each. Add it all up and you get the final composite score.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Visual equation renderer — the key new piece
// ─────────────────────────────────────────────────────────────────────────────
function EquationDisplay({ eq }: { eq: VisualEquation }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-6 py-8 flex flex-col items-center gap-4">
      <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em]">The formula</p>

      {/* Main equation row */}
      <div className="flex items-center gap-5 flex-wrap justify-center">

        {/* LHS — result variable */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-4xl font-black font-mono text-blue-400"
            style={{ textShadow: "0 0 30px rgba(96,165,250,0.5)" }}
          >
            {eq.result}
          </span>
          {eq.unit && (
            <span className="text-xs font-mono text-blue-400/40">{eq.unit}</span>
          )}
        </div>

        {/* Equals sign */}
        <span className="text-3xl font-mono text-white/20 font-light">=</span>

        {/* RHS */}
        {eq.kind === "fraction" && eq.numerator && eq.denominator ? (
          <div className="flex flex-col items-center gap-0">
            {/* Numerator */}
            <div className="flex flex-col items-center pb-2">
              <span
                className="text-3xl font-black font-mono text-white/90"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              >
                {eq.numerator.value}
              </span>
              <span className="text-[10px] font-mono text-white/30 mt-0.5">
                {eq.numerator.label}
              </span>
            </div>

            {/* Fraction bar */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-1" />

            {/* Denominator */}
            <div className="flex flex-col items-center pt-2">
              <span
                className="text-3xl font-black font-mono text-white/90"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              >
                {eq.denominator.value}
              </span>
              <span className="text-[10px] font-mono text-white/30 mt-0.5">
                {eq.denominator.label}
              </span>
            </div>
          </div>
        ) : (
          /* Expression (flat formula) */
          <span
            className="text-2xl sm:text-3xl font-black font-mono text-white/90 text-center leading-snug"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
          >
            {eq.expression}
          </span>
        )}
      </div>

      {/* Caption — threshold summary */}
      {eq.caption && (
        <p className="text-[11px] font-mono text-white/30 text-center mt-1 leading-relaxed">
          {eq.caption}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────────────────────
function WeightBar({ weight }: { weight: number }) {
  return (
    <div className="flex items-center gap-2.5" title={`${weight}% of the final score`}>
      <div className="h-1 w-20 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-400/40 transition-all duration-500"
          style={{ width: `${weight * 5}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/30 shrink-0">{weight}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works card
// ─────────────────────────────────────────────────────────────────────────────
function StepCard({ step, title, body }: { step: number; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full border border-blue-500/25 bg-blue-500/10 flex items-center justify-center text-xs font-mono text-blue-400 font-bold">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-white/80 font-mono mb-1.5">{title}</p>
        <p className="text-sm text-white/40 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Factor accordion card
// ─────────────────────────────────────────────────────────────────────────────
function FactorCard({ f }: { f: FactorExplain }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const handler = (e: Event) => {
      const targetId = (e as CustomEvent<string>).detail;
      if (targetId === f.id) setOpen(true);
    };
    window.addEventListener("open-factor-detail", handler);
    return () => window.removeEventListener("open-factor-detail", handler);
  }, [f.id]);

  return (
    <div
      id={`factor-${f.id}`}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden transition-colors duration-200 hover:border-white/[0.12] scroll-mt-24"
    >
      {/* Trigger */}
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="text-xl leading-none" aria-hidden>{f.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/85 font-mono">{f.title}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-snug truncate">{f.oneLiner}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <WeightBar weight={f.weight} />
          <ChevronDown
            className="w-4 h-4 text-white/25 transition-transform duration-200 ease-out shrink-0"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden
          />
        </div>
      </button>

      {/* Detail panel */}
      {open && (
        <div id={panelId} className="border-t border-white/[0.05] px-6 pb-7 pt-6 space-y-6">

          {/* ★ Visual equation — front and centre */}
          <EquationDisplay eq={f.equation} />

          {/* What we watch */}
          <div>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-2">What we look at</p>
            <p className="text-sm text-white/55 leading-relaxed">{f.whatWeWatch}</p>
          </div>

          {/* Why it matters */}
          <div>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-2">Why it matters</p>
            <p className="text-sm text-white/55 leading-relaxed">{f.whyItMatters}</p>
          </div>

          {/* How we score */}
          <div>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-2">How we turn it into a score</p>
            <p className="text-sm text-white/55 leading-relaxed">{f.howWeScore}</p>
          </div>

          {/* Example */}
          <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.06] px-5 py-4">
            <p className="text-[9px] font-mono text-blue-400/50 uppercase tracking-[0.15em] mb-2">Example</p>
            <p className="text-sm text-blue-100/50 leading-relaxed">{f.example}</p>
          </div>

          {/* Estimate warning */}
          {f.isEstimate && f.estimateNote && (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-5 py-4">
              <p className="text-[9px] font-mono text-amber-400/50 uppercase tracking-[0.15em] mb-2">Heads up</p>
              <p className="text-sm text-amber-100/45 leading-relaxed">{f.estimateNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Weekly score panel — the punchline at the bottom
// ─────────────────────────────────────────────────────────────────────────────

// Maps factor IDs → human labels + weights (matching FACTORS array above)
const FACTOR_META: { id: string; label: string; weight: number }[] = [
  { id: "demand",     label: "Demand Reality",   weight: 20 },
  { id: "valuation",  label: "ERP Valuation",    weight: 20 },
  { id: "behavioral", label: "Retail FOMO",      weight: 15 },
  { id: "liquidity",  label: "M2 Liquidity",     weight: 15 },
  { id: "gpu",        label: "GPU Spot Prices",  weight: 10 },
  { id: "credit",     label: "Credit Spreads",   weight: 10 },
  { id: "datawall",   label: "Data Wall",        weight:  5 },
  { id: "energy",     label: "Energy Costs",     weight:  5 },
];

function barColor(score: number) {
  if (score < 40) return { bar: "#10b981", glow: "rgba(16,185,129,0.35)" };
  if (score < 70) return { bar: "#f59e0b", glow: "rgba(245,158,11,0.35)" };
  return { bar: "#ef4444", glow: "rgba(239,68,68,0.35)" };
}

function riskLabel(score: number) {
  if (score < 40) return "Low";
  if (score < 70) return "Mid";
  return "High";
}

function WeeklyScorePanel({ latestData }: { latestData: LatestData | null }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [latestData]);

  const date = latestData
    ? new Date(latestData.timestamp * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const composite = latestData?.score ?? null;
  const compositeColor = composite !== null ? barColor(composite) : { bar: "#4b5563", glow: "none" };
  const compositeStatus =
    composite === null ? "—" :
    composite < 40 ? "Healthy — no bubble signals" :
    composite < 70 ? "Elevated — watch closely" :
    "Bubble territory — high danger";

  return (
    <div
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
      role="region"
      aria-label="This week's score breakdown"
    >
      {/* Panel header */}
      <div className="px-6 py-5 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">This week</p>
          <p className="text-sm font-mono font-semibold text-white/80">
            {latestData?.weekId ?? "—"}
            {date && <span className="text-white/30 font-normal ml-2">· {date}</span>}
          </p>
        </div>

        {/* Big composite score */}
        <div className="flex items-end gap-3">
          <div className="text-right">
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-0.5">Composite</p>
            <p
              className="text-4xl font-black font-mono leading-none transition-all duration-700"
              style={{
                color: compositeColor.bar,
                textShadow: `0 0 30px ${compositeColor.glow}`,
              }}
            >
              {composite !== null ? `${composite}` : "—"}
              <span className="text-xl ml-0.5 opacity-60">%</span>
            </p>
          </div>
          <div
            className="text-[10px] font-mono px-2.5 py-1 rounded-full border leading-none mb-1"
            style={{
              color: compositeColor.bar,
              borderColor: `${compositeColor.bar}30`,
              backgroundColor: `${compositeColor.bar}12`,
            }}
          >
            {compositeStatus}
          </div>
        </div>
      </div>

      {/* Factor bars — horizontal chart per skill recommendation */}
      <div className="px-6 py-5 space-y-3.5">
        <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.15em] mb-4">Score breakdown — each bar shows that signal&apos;s risk level (0 = safe, 100 = danger)</p>
        {FACTOR_META.map(({ id, label, weight }) => {
          const raw = latestData?.factors?.[id] ?? null;
          const pct = raw !== null ? raw : 0;
          const { bar, glow } = raw !== null ? barColor(raw) : { bar: "#374151", glow: "none" };

          return (
            <div key={id} className="group">
              {/* Row header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/50">{label}</span>
                  <span className="text-[9px] font-mono text-white/20">{weight}% weight</span>
                </div>
                <div className="flex items-center gap-2">
                  {raw !== null && (
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: bar,
                        borderColor: `${bar}25`,
                        backgroundColor: `${bar}10`,
                      }}
                    >
                      {riskLabel(raw)}
                    </span>
                  )}
                  <span
                    className="text-sm font-black font-mono w-10 text-right"
                    style={{ color: raw !== null ? bar : "#4b5563" }}
                    aria-label={`${label}: ${raw !== null ? raw : "no data"}%`}
                  >
                    {raw !== null ? `${raw}%` : "—"}
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div
                className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: animated ? `${pct}%` : "0%",
                    backgroundColor: bar,
                    boxShadow: raw !== null ? `0 0 8px ${glow}` : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-6 pb-5">
        <p className="text-[10px] font-mono text-white/20 leading-relaxed">
          Composite = (Demand × 20%) + (Valuation × 20%) + (FOMO × 15%) + (Liquidity × 15%) + (GPU × 10%) + (Credit × 10%) + (Data Wall × 5%) + (Energy × 5%)
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function MathBreakdown({ latestData }: { latestData?: LatestData | null }) {
  return (
    <section className="space-y-8" aria-labelledby="math-heading">

      {/* Header */}
      <div className="space-y-2">
        <h2
          id="math-heading"
          className="text-xs font-mono font-semibold text-white/50 uppercase tracking-[0.15em]"
        >
          How the score is calculated
        </h2>
        <p className="text-sm text-white/35 leading-relaxed max-w-2xl">
          No finance degree needed. Here&apos;s how we go from raw data to the number you see at the top of the page — explained like you&apos;re explaining it to a friend.
        </p>
      </div>

      {/* 3-step overview */}
      <div className="space-y-2">
        {HOW_IT_WORKS.map((s, i) => (
          <StepCard key={i} step={i + 1} title={s.title} body={s.body} />
        ))}
      </div>

      <div className="section-divider" />

      {/* Per-factor accordion */}
      <div className="space-y-2">
        <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-3">
          Click any signal to see the formula and full explanation
        </p>
        <div className="space-y-1.5">
          {FACTORS.map((f) => (
            <FactorCard key={f.id} f={f} />
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* This week's score — the punchline */}
      <div className="space-y-3">
        <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em]">
          Putting it all together
        </p>
        <WeeklyScorePanel latestData={latestData ?? null} />
      </div>

    </section>
  );
}
