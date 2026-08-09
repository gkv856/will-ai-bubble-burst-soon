"use client";

import { useState, useEffect } from "react";
import { LatestScores } from "@/lib/api";

// Maps factor IDs → human labels + weights
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

export function WeeklyScorePanel({ latestData }: { latestData: LatestScores | null }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [latestData]);

  const date = latestData?.run_date
    ? new Date(latestData.run_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const composite = latestData?.composite_score ?? null;
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
            {latestData?.run_id ? latestData.run_id.slice(0, 8) : "—"}
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
          const signal = latestData?.signals?.find((s) => s.factor_id === id);
          const raw = signal?.score ?? null;
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
