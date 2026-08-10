"use client";

import { LatestScores } from "@/lib/api";
import { FACTORS, HOW_IT_WORKS } from "@/lib/factors-data";
import {
  StepCard,
  FactorAccordion,
} from "@/components/dashboard/FactorAccordion";

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Weekly score panel — the punchline at the bottom
// ─────────────────────────────────────────────────────────────────────────────

import { WeeklyScorePanel } from "@/components/dashboard/WeeklyScorePanel";

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function MathBreakdown({
  latestData,
}: {
  latestData?: LatestScores | null;
}) {
  return (
    <section className="space-y-8" aria-labelledby="math-heading">
      <div className="section-divider" />

      {/* This week's score — the punchline */}
      <div className="space-y-3">
        <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em]">
          Putting it all together
        </p>
        <WeeklyScorePanel latestData={latestData ?? null} />
      </div>
      {/* Header */}
      <div className="space-y-2">
        <h2
          id="math-heading"
          className="text-xs font-mono font-semibold text-white/50 uppercase tracking-[0.15em]"
        >
          How the score is calculated
        </h2>
        <p className="text-sm text-white/35 leading-relaxed max-w-2xl">
          No finance degree needed. Here&apos;s how we go from raw data to the
          number you see at the top of the page — explained like you&apos;re
          explaining it to a friend.
        </p>
      </div>

      {/* 3-step overview */}
      <div className="space-y-2">
        {HOW_IT_WORKS.map((s, i) => (
          <StepCard key={i} step={i + 1} title={s.title} body={s.body} />
        ))}
      </div>

      <div className="section-divider" />

      {/* Per-factor accordion */}
      <div className="space-y-2">
        <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-3">
          Click any signal to see the formula and full explanation
        </p>
        <div className="space-y-1.5">
          {FACTORS.map((f) => (
            <FactorAccordion key={f.id} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
