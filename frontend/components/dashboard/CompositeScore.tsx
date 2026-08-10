"use client";

import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Activity } from "lucide-react";
import { getRiskColor, getRiskLabel } from "@/lib/status-utils";

function getColor(score: number) {
  return getRiskColor(score);
}

function getStatus(score: number) {
  const glowByLabel: Record<string, string> = {
    "Healthy": "rgba(16,185,129,0.35)",
    "Elevated Risk": "rgba(245,158,11,0.35)",
    "Bubble Territory": "rgba(239,68,68,0.35)",
  };
  const label = getRiskLabel(score);
  return { label, glow: glowByLabel[label] };
}

export function CompositeScore({ score }: { score: number | null }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (score === null) return;
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const color = score !== null ? getColor(score) : "#1e293b";
  const status = score !== null ? getStatus(score) : null;
  const data = [{ value: animated, fill: color }];

  return (
    <div
      className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[320px] relative overflow-hidden scan-overlay"
      role="region"
      aria-label={`Composite risk score: ${score ?? 'loading'}`}
    >
      {/* Background glow */}
      {status && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 80px ${status.glow}` }}
          aria-hidden="true"
        />
      )}

      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-3.5 h-3.5 text-white/30" aria-hidden="true" />
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Composite Risk</span>
      </div>

      {/* Radial gauge */}
      <div className="relative w-52 h-52">
        <RadialBarChart
          width={208}
          height={208}
          innerRadius="78%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: "rgba(255,255,255,0.05)" }}
            dataKey="value"
            cornerRadius={12}
          />
        </RadialBarChart>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-6xl font-black font-mono transition-all duration-700"
            style={{ color, textShadow: score !== null ? `0 0 30px ${color}60` : 'none' }}
            aria-live="polite"
          >
            {score !== null ? animated : "--"}
          </div>
          <div className="text-base text-white/30 font-mono mt-0.5">%</div>
        </div>
      </div>

      {/* Status label */}
      {status && (
        <div className="mt-6">
          <span
            className="text-sm font-mono font-semibold px-5 py-1.5 rounded-full border"
            style={{ color, borderColor: `${color}40`, backgroundColor: `${color}12` }}
          >
            {status.label}
          </span>
        </div>
      )}

      {score === null && (
        <div className="mt-6 flex items-center gap-1.5 text-white/30 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Analyzing signals…
        </div>
      )}
    </div>
  );
}
