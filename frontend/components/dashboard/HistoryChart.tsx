"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { TooltipContentProps } from "recharts";
import { TrendingUp } from "lucide-react";
import { entryLabel } from "@/lib/types";
import type { WeekData } from "@/lib/types";

interface HistoryChartProps {
  historyData: WeekData[];
}

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value as number;
  const color = score < 40 ? "#10b981" : score < 70 ? "#f59e0b" : "#ef4444";
  const label2 = score < 40 ? "Healthy" : score < 70 ? "Elevated Risk" : "Bubble Territory";

  return (
    <div className="glass-card rounded-xl px-4 py-3 text-xs font-mono border border-white/10">
      <div className="text-white/40 mb-1">{label}</div>
      <div className="text-xl font-black" style={{ color }}>{score}%</div>
      <div className="text-white/40 mt-0.5" style={{ color }}>{label2}</div>
    </div>
  );
}

export function HistoryChart({ historyData }: HistoryChartProps) {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[320px]">
        <TrendingUp className="w-8 h-8 text-white/10 mb-3" />
        <p className="text-xs font-mono text-white/20">No history yet — run the pipeline to collect data</p>
      </div>
    );
  }

  // Determine gradient color for the line based on latest score
  const latestScore = historyData[historyData.length - 1]?.score ?? 50;
  const lineColor = latestScore < 40 ? "#10b981" : latestScore < 70 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="glass-card rounded-2xl p-6 h-full min-h-[320px] flex flex-col"
      role="region"
      aria-label="Historical risk score chart"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-3.5 h-3.5 text-white/30" aria-hidden="true" />
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Historical Trend</span>
        <span className="ml-auto text-[10px] font-mono text-white/20">{historyData.length} data points</span>
      </div>

      <div className="flex-1 w-full" style={{ minHeight: 320 }}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={historyData.map(d => ({ ...d, label: entryLabel(d) }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />

            {/* Reference zone lines */}
            <ReferenceLine y={70} stroke="rgba(239,68,68,0.2)" strokeDasharray="4 4" label={{ value: "Danger", fill: "rgba(239,68,68,0.4)", fontSize: 9, fontFamily: "Fira Code", position: "right" }} />
            <ReferenceLine y={40} stroke="rgba(245,158,11,0.2)" strokeDasharray="4 4" label={{ value: "Caution", fill: "rgba(245,158,11,0.4)", fontSize: 9, fontFamily: "Fira Code", position: "right" }} />

            <XAxis
              dataKey="label"
              stroke="transparent"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "Fira Code" }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "Fira Code" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={CustomTooltip} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ fill: lineColor, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#fff", stroke: lineColor, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/[0.06]">
        {[{ color: "#10b981", label: "< 40 Healthy" }, { color: "#f59e0b", label: "40–70 Elevated" }, { color: "#ef4444", label: "> 70 Bubble" }].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
