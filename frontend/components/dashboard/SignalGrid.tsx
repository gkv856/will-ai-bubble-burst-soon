"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { SignalDetail } from "@/lib/api";

interface SignalGridProps {
  signals: SignalDetail[];
  /** Historical weekly scores per factor_id for sparklines */
  sparklineData?: Record<string, number[]>;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "#4b5563";
  if (score < 30) return "#10b981";
  if (score < 50) return "#84cc16";
  if (score < 70) return "#f59e0b";
  if (score < 85) return "#f97316";
  return "#ef4444";
}

function VelocityArrow({ velocity }: { velocity: number | null }) {
  if (velocity === null)
    return <Minus className="w-3 h-3 text-white/20" />;
  if (velocity > 5)
    return <TrendingUp className="w-3 h-3 text-red-400" />;
  if (velocity < -5)
    return <TrendingDown className="w-3 h-3 text-emerald-400" />;
  return <Minus className="w-3 h-3 text-white/40" />;
}

function Sparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          strokeOpacity={0.7}
        />
        <Tooltip
          contentStyle={{ display: "none" }}
          cursor={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SignalCard({
  signal,
  sparkline,
}: {
  signal: SignalDetail;
  sparkline: number[];
}) {
  const color = getScoreColor(signal.score);
  const isDefault = Math.abs((signal.weight_used ?? 1 / 9) - 1 / 9) < 0.001;

  return (
    <div
      className="glass-card rounded-xl p-4 border border-white/[0.07] flex flex-col gap-2 hover:border-white/[0.12] transition-all duration-200"
      style={{ borderLeftColor: color, borderLeftWidth: 2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-mono font-semibold text-white/60 leading-tight">
          {signal.name}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {signal.stale && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              STALE
            </span>
          )}
          {!isDefault && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {((signal.weight_used ?? 0) * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <span
          className="text-3xl font-black font-mono leading-none"
          style={{ color }}
        >
          {signal.score ?? "—"}
        </span>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <VelocityArrow velocity={signal.velocity_4wk} />
            <span className="text-[9px] font-mono text-white/30">
              {signal.velocity_4wk !== null
                ? `${signal.velocity_4wk > 0 ? "+" : ""}${signal.velocity_4wk.toFixed(1)}% 4wk`
                : "no velocity"}
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {sparkline.length > 1 ? (
        <div className="-mx-1">
          <Sparkline data={sparkline} color={color} />
        </div>
      ) : (
        <div className="h-8 flex items-center">
          <span className="text-[9px] font-mono text-white/15">insufficient history</span>
        </div>
      )}

      {/* Error message if any */}
      {signal.error_message && (
        <p className="text-[9px] font-mono text-amber-400/70 truncate" title={signal.error_message}>
          {signal.error_message}
        </p>
      )}
    </div>
  );
}

export function SignalGrid({ signals, sparklineData = {} }: SignalGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-widest">
          9 Signal Breakdown
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {signals.map((signal) => (
          <SignalCard
            key={signal.factor_id}
            signal={signal}
            sparkline={sparklineData[signal.factor_id] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
