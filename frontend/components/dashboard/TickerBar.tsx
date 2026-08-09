import { getStatusColor } from "@/lib/status-utils";

const TICKER_ITEMS = [
  { label: "Demand Reality", key: "demand" },
  { label: "ERP Valuation", key: "valuation" },
  { label: "Retail FOMO", key: "behavioral" },
  { label: "M2 Liquidity", key: "liquidity" },
  { label: "GPU Spot", key: "gpu" },
  { label: "Credit Spreads", key: "credit" },
  { label: "Energy Costs", key: "energy" },
  { label: "Data Wall", key: "datawall" },
  { label: "Narrative", key: "narrative" },
];

export const TickerBar = ({ signals }: { signals: Record<string, number> | null }) => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-2"
      aria-label="Live signal ticker"
    >
      <div className="ticker-track">
        {items.map((item, i) => {
          const val = signals?.[item.key] ?? null;
          const color = val !== null ? getStatusColor(val) : "#4b5563";
          return (
            <span
              key={i}
              className="flex items-center gap-2 px-6 text-xs font-mono whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-400">{item.label}</span>
              <span className="font-semibold" style={{ color }}>
                {val !== null ? `${val}` : "--"}
              </span>
              <span className="text-white/10 px-2">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
