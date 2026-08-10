import Link from "next/link";
import { CompositeScore } from "@/components/dashboard/CompositeScore";
import { HistoryChart } from "@/components/dashboard/HistoryChart";
import { ConfidenceBar } from "@/components/dashboard/ConfidenceBar";
import { SignalGrid } from "@/components/dashboard/SignalGrid";
import { AnalogPanel } from "@/components/dashboard/AnalogPanel";
import { WarningBanner } from "@/components/dashboard/WarningBanner";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { fetchLatestScores, fetchHistory } from "@/lib/api";
import {
  Activity,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { getRiskColor, getRiskLabel } from "@/lib/status-utils";
import { StatusIcon } from "@/components/dashboard/StatusIcon";
import { TickerBar } from "@/components/dashboard/TickerBar";
import { EmailSignup } from "@/components/dashboard/EmailSignup";

export const revalidate = 3600;

// ── Main page (Server Component) ───────────────────────────────────────────────

export default async function Home() {
  const [latest, historyResp] = await Promise.all([
    fetchLatestScores(),
    fetchHistory(52),
  ]);
  const history = historyResp.data;

  const score = latest?.composite_score ?? null;
  const signalMap =
    latest?.signals && Array.isArray(latest.signals)
      ? Object.fromEntries(
          latest.signals.map((s: any) => [s.factor_id, s.score ?? 0]),
        )
      : null;

  // Build sparkline data from history (last 12 entries per factor)
  const sparklineData: Record<string, number[]> = {};
  if (history.length > 0 && latest?.signals) {
    for (const fid of latest.signals.map((s) => s.factor_id)) {
      sparklineData[fid] = history
        .slice(-12)
        .map((h: any) => {
          if (Array.isArray(h.signals)) {
            const sig = h.signals.find((s: any) => s.factor_id === fid);
            return sig?.score ?? 0;
          }
          if (h.factors) {
            return h.factors[fid] ?? 0;
          }
          return 0;
        })
        .filter((v: number) => v !== null);
    }
  }

  const runDate = latest?.run_date
    ? new Date(latest.run_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="orb orb-blue" aria-hidden="true" />
      <div className="orb orb-green" aria-hidden="true" />

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] backdrop-blur-xl bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-mono font-semibold text-sm text-white/90 hidden sm:block">
            AI Bubble Tracker
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <StatusIcon score={score} />
            <span className="text-white/40">{runDate || "—"}</span>
          </div>

          <RefreshButton />

          <Link
            href="/details"
            className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
          >
            Details
            <ArrowRight className="w-3 h-3" />
          </Link>

          <a
            href="https://github.com/gkv856/will-ai-bubble-burst-soon"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
            aria-label="View source on GitHub"
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:block">Source</span>
          </a>
        </div>
      </header>

      {/* ── TICKER ── */}
      <div className="pt-[49px]">
        <TickerBar signals={signalMap} />
      </div>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Updated weekly · 9 signals · Confidence intervals · Pattern matching
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
          Will the <span className="gradient-text-blue">AI Bubble</span>
          <br />
          Burst Soon?
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          A data-driven composite risk score built from 9 macro & AI signals —
          with confidence intervals, adaptive weights, and historical analog
          matching.
        </p>

        {/* Score pill */}
        {score !== null && (
          <div className="inline-flex items-center gap-4 glass-card rounded-2xl px-8 py-5 border border-white/[0.08]">
            <div>
              <div
                className="text-5xl font-black font-mono"
                style={{ color: getRiskColor(score) }}
              >
                {score}
              </div>
              <div className="text-xs text-white/30 font-mono mt-0.5">
                composite risk
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-left">
              <div
                className="text-sm font-semibold font-mono"
                style={{ color: getRiskColor(score) }}
              >
                {getRiskLabel(score)}
              </div>
              <div className="text-xs text-white/30 font-mono mt-0.5">
                as of {runDate}
              </div>
            </div>
          </div>
        )}

        {!latest && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-red-400 text-sm font-mono">
              Could not load data. Run the pipeline first.
            </p>
          </div>
        )}
      </section>

      <div className="section-divider mx-6 mb-8" />

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-8">
        {/* Warning banner */}
        {latest && (
          <WarningBanner
            verdict={latest.quality_verdict}
            staleSignals={latest.stale_signals || []}
          />
        )}

        {/* Score gauge + Confidence interval */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompositeScore score={score} />
          {latest?.confidence_interval && (
            <ConfidenceBar
              compositeScore={score!}
              ci={latest.confidence_interval}
            />
          )}
        </div>

        {/* History chart */}
        {history.length > 0 && <HistoryChart historyData={history as any} />}

        {/* Analog panel */}
        {latest?.analogs && (
          <AnalogPanel
            bubbleAnalogs={latest.analogs.bubble_analogs || []}
            boomAnalogs={latest.analogs.boom_analogs || []}
            adjustedRisk={latest.analogs.adjusted_risk}
          />
        )}

        {/* ── Email signup ── */}
        <EmailSignup />

        {/* CTA to details page */}
        <div className="flex justify-center pt-4">
          <Link
            href="/details"
            id="details-cta-btn"
            className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 text-sm font-mono text-white/60 hover:text-white/90 transition-all duration-200"
          >
            View signal breakdown, methodology &amp; math
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </main>

      {/* ── FOOTER ── */}
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
