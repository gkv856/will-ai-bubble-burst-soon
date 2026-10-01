import { Info } from "lucide-react";
import type { HistoryContext, SignalDetail } from "@/lib/api";
import type { AiPrediction } from "@/lib/types";
import { getRiskColor } from "@/lib/status-utils";
import {
  LEVEL_COPY,
  SIGNAL_COPY,
  SIGNAL_ORDER,
  riskLevel,
  type RiskLevel,
} from "@/lib/plain-english";
import { SignalCard } from "@/components/dashboard/SignalCard";

interface SignalOverviewProps {
  signals: SignalDetail[];
  context: HistoryContext;
  aiPredictions?: Record<string, AiPrediction>;
}

const LEVELS: RiskLevel[] = ["high", "mid", "low"];
// A representative score per level, just to pick the matching colour.
const LEVEL_SAMPLE_SCORE: Record<RiskLevel, number> = { high: 100, mid: 50, low: 0 };

function headline(red: number, total: number): string {
  if (red === 0) return `None of the ${total} warning lights are red`;
  if (red === 1) return `1 of ${total} warning lights is red`;
  return `${red} of ${total} warning lights are red`;
}

function formatSince(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SignalOverview({ signals, context, aiPredictions }: SignalOverviewProps) {
  const ranked = signals
    .filter((s) => SIGNAL_COPY[s.factor_id])
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        SIGNAL_ORDER.indexOf(a.factor_id) - SIGNAL_ORDER.indexOf(b.factor_id),
    );

  const byLevel: Record<RiskLevel, SignalDetail[]> = { high: [], mid: [], low: [] };
  const missing: SignalDetail[] = [];
  for (const s of ranked) {
    if (s.score === null) missing.push(s);
    else byLevel[riskLevel(s.score)].push(s);
  }

  const total = ranked.length;
  const since = formatSince(context.since);

  const renderCard = (s: SignalDetail) => (
    <SignalCard
      key={s.factor_id}
      id={s.factor_id}
      score={s.score}
      rawValue={s.raw_value}
      weight={s.weight_used}
      hasIssue={s.stale || Boolean(s.error_message)}
      issueNote={s.error_message}
      trend={context.trends[s.factor_id] ?? null}
      sinceLabel={since}
      aiPrediction={aiPredictions?.[s.factor_id]}
    />
  );

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-6 space-y-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">Today&apos;s read</p>
          <p className="text-2xl sm:text-3xl font-bold text-white/90 leading-tight">{headline(byLevel.high.length, total)}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1" aria-hidden="true">
            {ranked.map((s) => (
              <span
                key={s.factor_id}
                className="h-2 w-5 rounded-sm"
                style={{ backgroundColor: s.score === null ? "#4b5563" : getRiskColor(s.score) }}
              />
            ))}
          </div>
          <p className="text-xs text-white/40">
            {byLevel.high.length} red · {byLevel.mid.length} amber · {byLevel.low.length} green
            {missing.length > 0 && ` · ${missing.length} no reading`}
          </p>
        </div>

        <div className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-white/60 leading-relaxed">
            This is a gauge, not a crash prediction.
            {since && context.readings > 1 && (
              <>
                {" "}
                A red light means that signal looks more stretched than most of the {context.readings} readings we&apos;ve
                recorded since {since}. The longer we track, the more meaningful that comparison gets.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cards, most worrying first */}
      {LEVELS.filter((level) => byLevel[level].length > 0).map((level) => {
        const color = getRiskColor(LEVEL_SAMPLE_SCORE[level]);
        return (
          <section key={level} aria-labelledby={`signals-${level}`}>
            <div className="flex items-center gap-3 mb-4">
              <h3 id={`signals-${level}`} className="text-base font-bold" style={{ color }}>
                {LEVEL_COPY[level].group}
              </h3>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ color, backgroundColor: `${color}22`, border: `1px solid ${color}55` }}
              >
                {byLevel[level].length} {byLevel[level].length === 1 ? "signal" : "signals"}
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: `${color}40` }} aria-hidden="true" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {byLevel[level].map(renderCard)}
            </div>
          </section>
        );
      })}

      {missing.length > 0 && (
        <section aria-labelledby="signals-missing">
          <div className="flex items-center gap-3 mb-4">
            <h3 id="signals-missing" className="text-base font-bold text-gray-400">
              No reading yet
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-gray-400 bg-gray-500/15 border border-gray-500/30">
              {missing.length} {missing.length === 1 ? "signal" : "signals"}
            </span>
            <span className="h-px flex-1 bg-gray-500/25" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{missing.map(renderCard)}</div>
        </section>
      )}
    </div>
  );
}
