export const revalidate = 3600;

export const FACTOR_CARDS_DATA = [
  {
    id: "gpu_spot",
    title: "GPU Spot Prices",
    desc: "RTX 4090 rental cost vs historical baseline.",
  },
  {
    id: "credit_spreads",
    title: "Credit Spreads",
    desc: "Investment-grade bond spread (BAMLC0A0CM) from FRED.",
  },
  {
    id: "energy_costs",
    title: "Energy Costs",
    desc: "WTI crude oil price — energy cost pressure on AI data centres.",
  },
  {
    id: "demand_reality",
    title: "Demand Reality",
    desc: "IGV/SMH ratio — software demand vs. hardware speculation.",
  },
  {
    id: "data_wall",
    title: "Data Wall",
    desc: "Risk from AI training data exhaustion.",
  },
  {
    id: "erp_valuation",
    title: "ERP Valuation",
    desc: "S&P 500 earnings yield vs. 10-year Treasury yield.",
  },
  {
    id: "retail_fomo",
    title: "Retail FOMO",
    desc: 'Google Trends for "Nvidia options" + "AI investing".',
  },
  {
    id: "m2_liquidity",
    title: "Liquidity",
    desc: "Overnight reverse repo volume — tracks loose liquidity.",
  },
  {
    id: "narrative",
    title: "Narrative",
    desc: "Finnhub market news narrative tracking.",
  },
];

export const METHODOLOGY_CARDS_DATA = [
  {
    id: "F1",
    title: "GPU Spot Prices",
    weight: "10%",
    desc: "High GPU rental cost signals over-investment and speculative demand in AI compute.",
  },
  {
    id: "F2",
    title: "Credit Spreads",
    weight: "10%",
    desc: "Widening spreads signal macro stress; tightening enables continued AI spending.",
  },
  {
    id: "F3",
    title: "Demand Reality",
    weight: "20%",
    desc: "The IGV/SMH ratio reveals if software demand is keeping up with hardware bets.",
  },
  {
    id: "F4",
    title: "ERP Valuation",
    weight: "20%",
    desc: "A compressed equity risk premium signals markets pricing in an implausible future.",
  },
  {
    id: "F5",
    title: "Retail FOMO",
    weight: "15%",
    desc: "Retail search intensity tracks speculative euphoria at the top of bubble cycles.",
  },
  {
    id: "F6",
    title: "Liquidity",
    weight: "15%",
    desc: "Low overnight reverse repo volume = loose cash flooding into risk assets.",
  },
  {
    id: "F7",
    title: "Data Wall",
    weight: "5%",
    desc: "Training data scarcity could stall model progress, puncturing growth narratives.",
  },
  {
    id: "F8",
    title: "Energy Costs",
    weight: "5%",
    desc: "Rising oil prices signal escalating energy costs for AI data-centre infrastructure.",
  },
  {
    id: "F9",
    title: "Narrative",
    weight: "16%",
    desc: "When a single theme dominates financial news, it often signals peak hype and crowded positioning.",
  },
];
