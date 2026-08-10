"use client";

import { useEffect, useState } from "react";
import type { SVGProps } from "react";
import { Cpu, CreditCard, Zap, ShoppingCart, Server, DollarSign, Flame, Droplets, Newspaper } from "lucide-react";
import type { AiPrediction } from "@/lib/types";

interface FactorCardProps {
  title: string;
  score: number | null;
  id: string;
  desc?: string;
  aiPrediction?: AiPrediction;
}

export function getColorClass(score: number): string {
  if (score < 40) return "text-emerald-400";
  if (score < 70) return "text-yellow-400";
  return "text-red-400";
}

function getProgressColor(score: number): string {
  if (score < 40) return "#10b981";
  if (score < 70) return "#f59e0b";
  return "#ef4444";
}

function getRiskLabel(score: number): string {
  if (score < 40) return "Low";
  if (score < 70) return "Mid";
  return "High";
}

const ICONS: Record<string, React.ElementType> = {
  gpu_spot:       Cpu,
  credit_spreads: CreditCard,
  energy_costs:   Zap,
  demand_reality: ShoppingCart,
  data_wall:      Server,
  erp_valuation:  DollarSign,
  retail_fomo:    Flame,
  m2_liquidity:   Droplets,
  narrative:      Newspaper,
};

export function FactorCard({ title, score, id, desc, aiPrediction }: FactorCardProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (score === null) return;
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const Icon = ICONS[id] ?? Activity;
  const color = score !== null ? getProgressColor(score) : "#374151";
  const colorClass = score !== null ? getColorClass(score) : "text-white/20";
  const riskLabel = score !== null ? getRiskLabel(score) : null;

  const jumpToDetail = () => {
    const target = document.getElementById(`factor-${id}`);
    if (!target) return;
    window.dispatchEvent(new CustomEvent("open-factor-detail", { detail: id }));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="glass-card rounded-xl p-5 cursor-pointer group h-full transition-colors duration-200 hover:border-white/20"
      role="button"
      tabIndex={0}
      onClick={jumpToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          jumpToDetail();
        }
      }}
      aria-label={`${title}: ${score ?? 'loading'} percent risk. View full explanation.`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{id.toUpperCase()}</span>
          <span className="text-sm font-semibold text-white/80 font-mono leading-tight">{title}</span>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1 mb-3">
        <span
          className={`text-3xl font-black font-mono transition-all duration-700 ${colorClass}`}
          aria-live="polite"
        >
          {score !== null ? animated : "--"}
        </span>
        <span className="text-white/30 text-sm font-mono">%</span>
        {riskLabel && (
          <span
            className="ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}25` }}
          >
            {riskLabel}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mb-3" role="progressbar" aria-valuenow={animated} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: score !== null ? `${animated}%` : '0%',
            backgroundColor: color,
            boxShadow: score !== null ? `0 0 8px ${color}60` : 'none',
          }}
        />
      </div>

      {/* Description */}
      {desc && (
        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2">{desc}</p>
      )}

      {/* AI Prediction */}
      {aiPrediction && (
        <div className="mt-4 pt-3 border-t border-purple-500/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
            <span className="text-[10px] font-mono text-purple-400/80 uppercase tracking-widest">AI Forecast</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed italic line-clamp-3">
            "{aiPrediction.reason}"
          </p>
        </div>
      )}
    </div>
  );
}

// Fallback for missing import
function Activity(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
