import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FactorCard } from "@/components/dashboard/FactorCard";
import { EmailSignup } from "@/components/dashboard/EmailSignup";
import { fetchLatestScores } from "@/lib/api";
import {
  Activity,
  GitBranch,
  TrendingUp,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// The MathBreakdown uses dynamic import (client side)
const MathBreakdown = dynamic(
  () =>
    import("@/components/dashboard/MathBreakdown").then((m) => m.MathBreakdown),
  { ssr: false },
);

import { MethodologyCard } from "@/components/dashboard/MethodologyCard";
import { StatusIcon } from "@/components/dashboard/StatusIcon";
import {
  FACTOR_CARDS_DATA,
  METHODOLOGY_CARDS_DATA,
  revalidate,
} from "@/components/dashboard/CompData";

// ── Details page (Server Component) ──────────────────────────────────────────
export default async function DetailsPage() {
  const latest = await fetchLatestScores();
  const compositeScore = latest?.composite_score ?? null;
  const signalMap =
    latest?.signals && Array.isArray(latest.signals)
      ? Object.fromEntries(
          latest.signals.map((s) => [s.factor_id, s.score ?? null]),
        )
      : {};

  const runDate = latest?.run_date
    ? new Date(latest.run_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="orb orb-blue" aria-hidden="true" />
      <div className="orb orb-green" aria-hidden="true" />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] backdrop-blur-xl bg-black/40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors duration-200"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <span className="text-white/20 text-xs">·</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Activity className="w-3 h-3 text-blue-400" />
            </div>
            <span className="font-mono font-semibold text-sm text-white/90 hidden sm:block">
              Signal Details
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <StatusIcon score={compositeScore} />
            <span className="text-white/40">{runDate || "—"}</span>
          </div>
          <a
            href="https://github.com/gkv856/will-ai-bubble-burst-soon"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors duration-200"
            aria-label="View source on GitHub"
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:block">Source</span>
          </a>
        </div>
      </header>

      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />9 macro
          signals · full breakdown
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Signal <span className="gradient-text-blue">Breakdown</span>
        </h1>
        <p className="text-white/40 text-sm font-mono max-w-xl">
          Individual factor scores, scoring methodology, and the composite
          calculation — as of {runDate || "latest data"}.
        </p>
      </section>

      <div className="section-divider mx-6 mb-10" />

      {!latest && (
        <p className="text-center text-red-400 text-sm font-mono py-20">
          Could not load data.
        </p>
      )}

      {latest && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-12">
          {/* ── Factor grid ── */}
          <section aria-labelledby="signals-heading">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2
                id="signals-heading"
                className="text-sm font-mono font-semibold text-white/60 uppercase tracking-widest"
              >
                Live Signals
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {FACTOR_CARDS_DATA.map((card) => (
                <FactorCard
                  key={card.id}
                  title={card.title}
                  score={signalMap[card.id] ?? null}
                  id={card.id}
                  desc={card.desc}
                  aiPrediction={latest?.aiPredictions?.[card.id]}
                />
              ))}
            </div>
          </section>
          <div className="section-divider" />

          {/* ── Math deep-dive ── */}
          <MathBreakdown latestData={latest as any} />
          <div className="section-divider" />

          {/* ── Methodology ── */}
          <section aria-labelledby="methodology-heading">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2
                id="methodology-heading"
                className="text-sm font-mono font-semibold text-white/60 uppercase tracking-widest"
              >
                Methodology
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {METHODOLOGY_CARDS_DATA.map((card) => (
                <MethodologyCard
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  weight={card.weight}
                  desc={card.desc}
                />
              ))}
            </div>
          </section>

          <div className="section-divider" />

          {/* ── Email signup ── */}
          <EmailSignup />

          {/* ── Back link ── */}
          <div className="flex justify-center pt-4">
            <Link
              href="/"
              id="back-to-dashboard-btn"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 text-sm font-mono text-white/60 hover:text-white/90 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to dashboard
            </Link>
          </div>
        </main>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center">
        <p className="text-xs font-mono text-white/20">
          Not financial advice. Data sourced from FRED, Yahoo Finance, Vast.ai,
          Google Trends, and Epoch AI.
          <span className="mx-2 opacity-40">·</span>
          <a
            href="https://github.com/gkv856/will-ai-bubble-burst-soon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white/60 transition-colors"
          >
            <GitBranch className="w-3 h-3" />
            Open Source
          </a>
        </p>
      </footer>
    </div>
  );
}
