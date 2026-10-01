"use client";

import { useId, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  Eye,
  Minus,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { getRiskColor } from "@/lib/status-utils";
import {
  LEVEL_COPY,
  SIGNAL_COPY,
  describeAnswer,
  describeRank,
  describeScore,
  describeTrend,
  riskLevel,
  type RiskLevel,
} from "@/lib/plain-english";
import type { AiPrediction, SignalTrend } from "@/lib/types";

interface SignalCardProps {
  id: string;
  score: number | null;
  rawValue: number | null;
  /** Share of the final score this signal carries, 0–1. */
  weight: number | null;
  /** True when the latest fetch failed or the value is a carried-forward fallback. */
  hasIssue: boolean;
  issueNote?: string | null;
  trend: SignalTrend | null;
  /** Short date of the first recorded reading, e.g. "Jul 26". */
  sinceLabel: string | null;
  aiPrediction?: AiPrediction;
}

const LEVEL_ICON: Record<RiskLevel, React.ElementType> = {
  high: TriangleAlert,
  mid: Eye,
  low: Check,
};

// Dark text for the solid pill, lighter shade of the status colour for the big answer.
const LEVEL_STYLE: Record<RiskLevel, { pillText: string; answer: string }> = {
  high: { pillText: "#2a0707", answer: "text-red-400" },
  mid: { pillText: "#2b1b00", answer: "text-amber-400" },
  low: { pillText: "#022c22", answer: "text-emerald-400" },
};

const TREND_STYLE = {
  worse: { Icon: TrendingUp, className: "text-red-400" },
  better: { Icon: TrendingDown, className: "text-emerald-400" },
  flat: { Icon: Minus, className: "text-white/60" },
} as const;

// Widths match the risk cut-offs in plain-english.ts (low < 40, mid < 70, high ≥ 70).
const ZONES: { level: RiskLevel; width: number }[] = [
  { level: "low", width: 40 },
  { level: "mid", width: 30 },
  { level: "high", width: 30 },
];
const ZONE_COLOR: Record<RiskLevel, string> = {
  low: getRiskColor(0),
  mid: getRiskColor(50),
  high: getRiskColor(100),
};

export function SignalCard({
  id,
  score,
  rawValue,
  weight,
  hasIssue,
  issueNote,
  trend,
  sinceLabel,
  aiPrediction,
}: SignalCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const copy = SIGNAL_COPY[id];
  if (!copy) return null;

  const hasScore = score !== null;
  const level = hasScore ? riskLevel(score) : null;
  const style = level ? LEVEL_STYLE[level] : null;
  const color = hasScore ? getRiskColor(score) : "#6b7280";
  const LevelIcon = level ? LEVEL_ICON[level] : Clock;
  const trendTag = hasScore ? describeTrend(trend) : null;
  const TrendIcon = trendTag ? TREND_STYLE[trendTag.kind].Icon : null;

  return (
    <div
      className="relative overflow-hidden rounded-xl p-5 pt-6 flex flex-col gap-3 h-full"
      style={{ backgroundColor: `${color}1c`, border: `1px solid ${color}8c` }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: color }} aria-hidden="true" />

      {/* Status + trend */}
      <div className="flex items-center justify-between gap-x-3 gap-y-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: color, color: style?.pillText ?? "#111827" }}
        >
          <LevelIcon className="w-3.5 h-3.5" aria-hidden="true" />
          {level ? LEVEL_COPY[level].pill : "No reading"}
        </span>
        {trendTag && TrendIcon && (
          <span className={`inline-flex items-center gap-1 text-[11px] ${TREND_STYLE[trendTag.kind].className}`}>
            <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {trendTag.label}
          </span>
        )}
      </div>

      {/* Question, answer, plain sentence */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-mono uppercase tracking-widest text-white/50">{copy.title}</p>
        <h3 className="text-base font-semibold text-white/95 leading-snug">{copy.question}</h3>
      </div>
      {hasScore && style && (
        <p className={`text-2xl font-bold leading-tight ${style.answer}`}>{describeAnswer(score)}</p>
      )}
      <p className="text-sm text-white/90 leading-relaxed">
        {hasScore ? describeScore(copy, score) : "We couldn't get a reading for this signal this time."}
      </p>
      <p className="text-xs text-white/60 leading-relaxed">{copy.why}</p>

      {hasIssue && (
        <p
          className="inline-flex items-center gap-1.5 text-[11px] text-amber-400"
          title={issueNote ?? undefined}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Data may be out of date
        </p>
      )}

      {/* Where today sits between the calmest and most worrying readings so far */}
      {hasScore && level && (
        <div>
          <div
            className="relative h-2"
            role="img"
            aria-label={`Risk score ${score} out of 100, from calmest (0) to most worrying (100) so far`}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden flex">
              {ZONES.map((z) => (
                <span
                  key={z.level}
                  className="h-full"
                  style={{
                    width: `${z.width}%`,
                    backgroundColor: ZONE_COLOR[z.level],
                    opacity: z.level === level ? 1 : 0.35,
                  }}
                />
              ))}
            </div>
            <span
              className="absolute -top-[3px] h-3.5 w-1 -translate-x-1/2 rounded-full bg-white"
              style={{ left: `${Math.min(Math.max(score, 2), 98)}%`, boxShadow: `0 0 0 2px ${color}66` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/50 mt-2">
            <span>Calmest so far</span>
            <span>Most worrying so far</span>
          </div>
        </div>
      )}

      {/* Details for the curious */}
      {open && (
        <div id={panelId} className="border-t border-white/[0.12] pt-3 space-y-3">
          {hasScore && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1">Where it sits</p>
              <p className="text-xs text-white/70 leading-relaxed">{describeRank(score, sinceLabel)}</p>
            </div>
          )}
          {rawValue !== null && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1">Today&apos;s reading</p>
              <p className="text-xs text-white/70 leading-relaxed">{copy.reading(rawValue)}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1">Where it comes from</p>
            <p className="text-xs text-white/70 leading-relaxed">{copy.source}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1">How we score it</p>
            <p className="text-xs text-white/70 leading-relaxed">
              We rank today&apos;s reading against every reading we&apos;ve recorded so far. The most worrying one
              scores 100, the calmest scores 0.
            </p>
          </div>
          {aiPrediction && (
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-300 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
                AI forecast
              </p>
              <p className="text-xs text-white/65 leading-relaxed italic">&ldquo;{aiPrediction.reason}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-1">
        <span className="text-[11px] text-white/50">
          {weight !== null ? `Counts for ${Math.round(weight * 100)}% of the total` : ""}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded"
        >
          {open ? "Hide numbers" : "See the numbers"}
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
