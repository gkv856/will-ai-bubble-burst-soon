"use client";

import React from "react";
import { TrendingDown, Minus } from "lucide-react";
import type { AnalogMatch } from "@/lib/api";

interface AnalogPanelProps {
  bubbleAnalogs: AnalogMatch[];
  boomAnalogs: AnalogMatch[];
  adjustedRisk: string;
  adjustmentReason: string;
}

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "#ef4444"
    : pct >= 65 ? "#f97316"
    : "#f59e0b";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/50 w-8 text-right">{pct}%</span>
    </div>
  );
}

function AnalogCard({
  analog,
  type,
}: {
  analog: AnalogMatch;
  type: "bubble" | "boom";
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 space-y-2">
      <div className="text-[11px] font-mono font-semibold text-white/80 leading-tight">
        {analog.episode_name}
      </div>
      <SimilarityBar value={analog.similarity} />
      <div className="flex items-center gap-3 text-[9px] font-mono text-white/35">
        {analog.weeks_to_peak !== null ? (
          <span className="flex items-center gap-1">
            <Minus className="w-2.5 h-2.5" />
            {analog.weeks_to_peak}wk to peak
          </span>
        ) : (
          <span>No peak (boom)</span>
        )}
        {analog.max_drawdown_pct !== null && (
          <span className="flex items-center gap-1 text-red-400/70">
            <TrendingDown className="w-2.5 h-2.5" />
            {analog.max_drawdown_pct}% max drawdown
          </span>
        )}
      </div>
    </div>
  );
}

function riskBadgeClass(risk: string): string {
  if (risk.includes("BUBBLE") || risk === "HIGH" || risk === "EXTREME")
    return "bg-red-500/20 text-red-300 border-red-500/30";
  if (risk.includes("BOOM"))
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (risk.includes("UNCERTAIN") || risk.includes("MODERATE"))
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-blue-500/20 text-blue-300 border-blue-500/30";
}

export function AnalogPanel({
  bubbleAnalogs,
  boomAnalogs,
  adjustedRisk,
  adjustmentReason,
}: AnalogPanelProps) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/[0.07] space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-widest">
          Historical Analog Matching
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${riskBadgeClass(adjustedRisk)}`}
        >
          {adjustedRisk}
        </span>
      </div>

      <p className="text-[11px] font-mono text-white/40 leading-relaxed">
        {adjustmentReason}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bubble matches */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-red-400/70 uppercase tracking-wider mb-1">
            🔴 Bubble Matches
          </div>
          {bubbleAnalogs.length > 0 ? (
            bubbleAnalogs.map((a) => (
              <AnalogCard key={a.episode_name} analog={a} type="bubble" />
            ))
          ) : (
            <p className="text-[10px] font-mono text-white/20">No bubble analogs</p>
          )}
        </div>

        {/* Boom matches */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider mb-1">
            🟢 Boom Matches
          </div>
          {boomAnalogs.length > 0 ? (
            boomAnalogs.map((a) => (
              <AnalogCard key={a.episode_name} analog={a} type="boom" />
            ))
          ) : (
            <p className="text-[10px] font-mono text-white/20">No boom analogs</p>
          )}
        </div>
      </div>
    </div>
  );
}
