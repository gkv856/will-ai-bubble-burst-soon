"use client";

import React from "react";
import type { ConfidenceInterval } from "@/lib/api";
import { getRiskColor, getRiskLabel } from "@/lib/status-utils";

interface ConfidenceBarProps {
  compositeScore: number;
  ci: ConfidenceInterval;
}

export function ConfidenceBar({ compositeScore, ci }: ConfidenceBarProps) {
  const lower = ci.lower ?? 0;
  const upper = ci.upper ?? 100;
  const degraded = (ci.degradation_multiplier ?? 1) > 1.5;
  const color = getRiskColor(compositeScore);
  const statusLabel = getRiskLabel(compositeScore);

  // Map 0-100 to percentage positions
  const rangeLeft = `${lower}%`;
  const rangeWidth = `${Math.max(upper - lower, 2)}%`;
  const markerLeft = `${compositeScore}%`;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/[0.07]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-widest">
          How Sure We Are
        </span>
        {degraded && (
          <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
            ⚠ Less sure than usual
          </span>
        )}
      </div>

      {/* Plain-language summary */}
      <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-4">
        We estimate <span style={{ color }} className="font-semibold">
          {statusLabel.toLowerCase()}
        </span>{" "}
        — a score of <span style={{ color }} className="font-mono font-bold">{compositeScore}</span> out
        of 100 — but the real number could reasonably be anywhere from{" "}
        <span className="font-mono text-white/85">{lower.toFixed(0)}</span> to{" "}
        <span className="font-mono text-white/85">{upper.toFixed(0)}</span>.
      </p>

      {/* Bar container */}
      <div className="relative h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] overflow-visible">
        {/* Range fill */}
        <div
          className="absolute top-0 bottom-0 rounded-lg border-x transition-all duration-500"
          style={{
            left: rangeLeft,
            width: rangeWidth,
            backgroundColor: `${color}26`,
            borderColor: `${color}55`,
          }}
        />

        {/* Score marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: markerLeft }}
        >
          <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: color }} />
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold whitespace-nowrap"
            style={{ color }}
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
          <span style={{ color }} className="font-semibold">{compositeScore}</span>
        </span>
        <span>
          Upper:{" "}
          <span className="text-white/60">{upper.toFixed(1)}</span>
        </span>
      </div>

      <p className="text-[10px] font-mono text-white/20 mt-3 leading-relaxed">
        This is a range, not a single guess, because the signals feeding it don&apos;t
        always agree (statisticians call this a 95% confidence interval).
        {ci.degradation_multiplier && ci.degradation_multiplier > 1 && (
          <>
            {" "}
            {ci.degradation_multiplier > 2
              ? "Several inputs are missing or out of date, so this range is wider than usual."
              : "A few inputs are slightly stale, so this range is a bit wider than usual."}
          </>
        )}
      </p>
    </div>
  );
}
