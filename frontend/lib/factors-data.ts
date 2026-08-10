/** A visual equation — rendered as a fraction or a simple expression */
export interface VisualEquation {
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

export interface FactorExplain {
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
export const FACTORS: FactorExplain[] = [
  {
    id: "demand_reality",
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
    id: "erp_valuation",
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
    id: "retail_fomo",
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
    id: "m2_liquidity",
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
    id: "gpu_spot",
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
    id: "credit_spreads",
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
    id: "data_wall",
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
    id: "energy_costs",
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
  {
    id: "narrative",
    title: "Narrative Dominance",
    weight: 16,
    emoji: "📰",
    oneLiner: "Is AI dominating the news cycle?",
    equation: {
      result: "AI News Share",
      kind: "fraction",
      numerator: { value: "AI-related articles", label: "Finnhub news API" },
      denominator: { value: "Total market articles", label: "" },
      unit: "%",
      caption: "share ≥ 20% → 100% risk   ·   share ≤ 5% → 0% risk",
    },
    whatWeWatch: "We track the proportion of market news articles mentioning AI via Finnhub.",
    whyItMatters: "When a single theme dominates financial news, it often signals peak hype and crowded positioning.",
    howWeScore: "If AI makes up over 20% of all market news, the hype is deafening (100 risk). Below 5% is normal background noise (0 risk).",
    example: "If 15% of all articles mention AI, the score is roughly 66, indicating elevated hype.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// How the score is built — plain English
// ─────────────────────────────────────────────────────────────────────────────
export const HOW_IT_WORKS = [
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
