"use client";

import { useState, useId, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FactorExplain, VisualEquation } from "@/lib/factors-data";

// ─────────────────────────────────────────────────────────────────────────────
// Visual equation renderer
// ─────────────────────────────────────────────────────────────────────────────
export function EquationDisplay({ eq }: { eq: VisualEquation }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-6 py-8 flex flex-col items-center gap-4">
      <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em]">The formula</p>

      {/* Main equation row */}
      <div className="flex items-center gap-5 flex-wrap justify-center">

        {/* LHS — result variable */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-4xl font-black font-mono text-blue-400"
            style={{ textShadow: "0 0 30px rgba(96,165,250,0.5)" }}
          >
            {eq.result}
          </span>
          {eq.unit && (
            <span className="text-xs font-mono text-blue-400/40">{eq.unit}</span>
          )}
        </div>

        {/* Equals sign */}
        <span className="text-3xl font-mono text-white/20 font-light">=</span>

        {/* RHS */}
        {eq.kind === "fraction" && eq.numerator && eq.denominator ? (
          <div className="flex flex-col items-center gap-0">
            {/* Numerator */}
            <div className="flex flex-col items-center pb-2">
              <span
                className="text-3xl font-black font-mono text-white/90"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              >
                {eq.numerator.value}
              </span>
              <span className="text-[10px] font-mono text-white/30 mt-0.5">
                {eq.numerator.label}
              </span>
            </div>

            {/* Fraction bar */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-1" />

            {/* Denominator */}
            <div className="flex flex-col items-center pt-2">
              <span
                className="text-3xl font-black font-mono text-white/90"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              >
                {eq.denominator.value}
              </span>
              <span className="text-[10px] font-mono text-white/30 mt-0.5">
                {eq.denominator.label}
              </span>
            </div>
          </div>
        ) : (
          /* Expression (flat formula) */
          <span
            className="text-2xl sm:text-3xl font-black font-mono text-white/90 text-center leading-snug"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
          >
            {eq.expression}
          </span>
        )}
      </div>

      {/* Caption — threshold summary */}
      {eq.caption && (
        <p className="text-[11px] font-mono text-white/30 text-center mt-1 leading-relaxed">
          {eq.caption}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────────────────────
export function WeightBar({ weight }: { weight: number }) {
  return (
    <div className="flex items-center gap-2.5" title={`${weight}% of the final score`}>
      <div className="h-1 w-20 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-400/40 transition-all duration-500"
          style={{ width: `${weight * 5}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/30 shrink-0">{weight}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works card
// ─────────────────────────────────────────────────────────────────────────────
export function StepCard({ step, title, body }: { step: number; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full border border-blue-500/25 bg-blue-500/10 flex items-center justify-center text-xs font-mono text-blue-400 font-bold">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-white/80 font-mono mb-1.5">{title}</p>
        <p className="text-sm text-white/40 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Factor accordion card
// ─────────────────────────────────────────────────────────────────────────────
export function FactorAccordion({ f }: { f: FactorExplain }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const handler = (e: Event) => {
      const targetId = (e as CustomEvent<string>).detail;
      if (targetId === f.id) setOpen(true);
    };
    window.addEventListener("open-factor-detail", handler);
    return () => window.removeEventListener("open-factor-detail", handler);
  }, [f.id]);

  return (
    <div
      id={`factor-${f.id}`}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden transition-colors duration-200 hover:border-white/[0.12] scroll-mt-24"
    >
      {/* Trigger */}
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="text-xl leading-none" aria-hidden>{f.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/85 font-mono">{f.title}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-snug truncate">{f.oneLiner}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <WeightBar weight={f.weight} />
          <ChevronDown
            className="w-4 h-4 text-white/25 transition-transform duration-200 ease-out shrink-0"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden
          />
        </div>
      </button>

      {/* Detail panel */}
      {open && (
        <div id={panelId} className="border-t border-white/[0.05] px-6 pb-7 pt-6 space-y-6">

          {/* ★ Visual equation — front and centre */}
          <EquationDisplay eq={f.equation} />

          {/* What we watch */}
          <div>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-2">What we look at</p>
            <p className="text-sm text-white/55 leading-relaxed">{f.whatWeWatch}</p>
          </div>

          {/* Why it matters */}
          <div>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-2">Why it matters</p>
            <p className="text-sm text-white/55 leading-relaxed">{f.whyItMatters}</p>
          </div>

          {/* How we score */}
          <div>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-2">How we turn it into a score</p>
            <p className="text-sm text-white/55 leading-relaxed">{f.howWeScore}</p>
          </div>

          {/* Example */}
          <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.06] px-5 py-4">
            <p className="text-[9px] font-mono text-blue-400/50 uppercase tracking-[0.15em] mb-2">Example</p>
            <p className="text-sm text-blue-100/50 leading-relaxed">{f.example}</p>
          </div>

          {/* Estimate warning */}
          {f.isEstimate && f.estimateNote && (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-5 py-4">
              <p className="text-[9px] font-mono text-amber-400/50 uppercase tracking-[0.15em] mb-2">Heads up</p>
              <p className="text-sm text-amber-100/45 leading-relaxed">{f.estimateNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
