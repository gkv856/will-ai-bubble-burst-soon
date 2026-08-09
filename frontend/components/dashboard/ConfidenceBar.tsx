"use client";

import React from "react";
import type { ConfidenceInterval } from "@/lib/api";

interface ConfidenceBarProps {
  compositeScore: number;
  ci: ConfidenceInterval;
}

export function ConfidenceBar({ compositeScore, ci }: ConfidenceBarProps) {
  const lower = ci.lower ?? 0;
  const upper = ci.upper ?? 100;
  const degraded = (ci.degradation_multiplier ?? 1) > 1.5;

  // Map 0-100 to percentage positions
  const rangeLeft = `${lower}%`;
  const rangeWidth = `${Math.max(upper - lower, 2)}%`;
  const markerLeft = `${compositeScore}%`;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/[0.07]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-widest">
          95% Confidence Interval
        </span>
        {degraded && (
          <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
            ⚠ Degraded — interval widened
          </span>
        )}
      </div>

      {/* Bar container */}
      <div className="relative h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] overflow-visible">
        {/* Range fill */}
        <div
          className="absolute top-0 bottom-0 rounded-lg bg-blue-500/20 border-x border-blue-500/30"
          style={{ left: rangeLeft, width: rangeWidth }}
        />

        {/* Score marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: markerLeft }}
        >
          <div className="w-0.5 h-6 bg-blue-400 rounded-full" />
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-blue-300 whitespace-nowrap"
          >
            {compositeScore}
          </div>
        </div>

        {/* Scale labels */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute bottom-0 -translate-x-1/2 text-[9px] font-mono text-white/20"
            style={{ left: `${tick}%` }}
          >
            {tick}
          </div>
        ))}
      </div>

      {/* Bounds */}
      <div className="flex justify-between mt-2 text-[10px] font-mono text-white/30">
        <span>
          Lower:{" "}
          <span className="text-white/60">{lower.toFixed(1)}</span>
        </span>
        <span>
          Score:{" "}
          <span className="text-blue-300 font-semibold">{compositeScore}</span>
        </span>
        <span>
          Upper:{" "}
          <span className="text-white/60">{upper.toFixed(1)}</span>
        </span>
      </div>

      {ci.degradation_multiplier && ci.degradation_multiplier > 1 && (
        <p className="text-[10px] font-mono text-white/20 mt-2">
          Degradation multiplier: {ci.degradation_multiplier.toFixed(2)}× —
          {ci.degradation_multiplier > 2
            ? " severely widened due to missing/stale data"
            : " slightly widened due to stale signals"}
        </p>
      )}
    </div>
  );
}
