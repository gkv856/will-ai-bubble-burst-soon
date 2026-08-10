"use client";

import React from "react";
import type { AnalogMatch } from "@/lib/api";

interface AnalogPanelProps {
  bubbleAnalogs: AnalogMatch[];
  boomAnalogs: AnalogMatch[];
  adjustedRisk: string;
}

function SimilarityBar({
  value,
  type,
}: {
  value: number;
  type: "bubble" | "boom";
}) {
  const pct = Math.round(value * 100);
  const bubbleShade = pct >= 80 ? "#ef4444" : pct >= 65 ? "#f97316" : "#f59e0b";
  const boomShade = pct >= 80 ? "#10b981" : pct >= 65 ? "#34d399" : "#6ee7b7";
  const color = type === "bubble" ? bubbleShade : boomShade;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/50 w-16 text-right">{pct}% match</span>
    </div>
  );
}

function describeOutcome(analog: AnalogMatch): string {
  const drawdown = analog.max_drawdown_pct !== null ? Math.abs(analog.max_drawdown_pct) : null;

  if (analog.weeks_to_peak === null || drawdown === null) {
    return "Kept growing for years — it never crashed.";
  }

  const timeText =
    analog.weeks_to_peak >= 52
      ? `~${(analog.weeks_to_peak / 52).toFixed(1)} more years`
      : `~${Math.round(analog.weeks_to_peak / 4.345)} more months`;

  return `Kept rising for ${timeText}, then fell ${drawdown}%.`;
}

function AnalogCard({
  analog,
  type,
}: {
  analog: AnalogMatch;
  type: "bubble" | "boom";
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 space-y-2 transition-colors duration-200 hover:bg-white/[0.04] hover:border-white/[0.14]">
      <div className="text-[11px] font-mono font-semibold text-white/80 leading-tight">
        {analog.episode_name}
      </div>
      <SimilarityBar value={analog.similarity} type={type} />
      <p className="text-[10px] text-white/40 leading-snug">{describeOutcome(analog)}</p>
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

interface ITopAnalog {
  analog: AnalogMatch;
  type: "bubble" | "boom";
}

function getTopAnalog(
  bubbleAnalogs: AnalogMatch[],
  boomAnalogs: AnalogMatch[],
): ITopAnalog | null {
  const topBubble = bubbleAnalogs[0];
  const topBoom = boomAnalogs[0];

  if (!topBubble && !topBoom) return null;
  if (!topBubble) return { analog: topBoom, type: "boom" };
  if (!topBoom) return { analog: topBubble, type: "bubble" };

  return topBoom.similarity >= topBubble.similarity
    ? { analog: topBoom, type: "boom" }
    : { analog: topBubble, type: "bubble" };
}

function summarize(topAnalog: ITopAnalog | null): string {
  if (!topAnalog) return "There isn't enough historical data yet to compare today to past episodes.";

  const { analog, type } = topAnalog;
  const year = new Date(analog.week_matched).getFullYear();
  const yearText = Number.isNaN(year) ? "" : ` (around ${year})`;

  if (type === "boom") {
    return `Today's data most closely resembles the ${analog.episode_name}${yearText} — a healthy growth period, not a crash.`;
  }
  return `Today's data most closely resembles the ${analog.episode_name}${yearText} — a period that ended in a sharp downturn.`;
}

export function AnalogPanel({
  bubbleAnalogs,
  boomAnalogs,
  adjustedRisk,
}: AnalogPanelProps) {
  const topAnalog = getTopAnalog(bubbleAnalogs, boomAnalogs);

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/[0.07] space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-widest">
          Similar Moments In History
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${riskBadgeClass(adjustedRisk)}`}
        >
          {adjustedRisk}
        </span>
      </div>

      <p className="text-sm sm:text-base text-white/70 leading-relaxed">
        {summarize(topAnalog)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bubble matches */}
        <div className="space-y-2">
          <div>
            <div className="text-[10px] font-mono text-red-400/70 uppercase tracking-wider">
              🔴 Bubble-like Patterns
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">Historically, these ended in a crash</p>
          </div>
          {bubbleAnalogs.length > 0 ? (
            bubbleAnalogs.map((a) => (
              <AnalogCard key={a.episode_name} analog={a} type="bubble" />
            ))
          ) : (
            <p className="text-[10px] font-mono text-white/20">No bubble-like patterns found</p>
          )}
        </div>

        {/* Boom matches */}
        <div className="space-y-2">
          <div>
            <div className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">
              🟢 Boom-like Patterns
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">Historically, these kept growing</p>
          </div>
          {boomAnalogs.length > 0 ? (
            boomAnalogs.map((a) => (
              <AnalogCard key={a.episode_name} analog={a} type="boom" />
            ))
          ) : (
            <p className="text-[10px] font-mono text-white/20">No boom-like patterns found</p>
          )}
        </div>
      </div>
    </div>
  );
}
