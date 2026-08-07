"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompositeScore } from "@/components/dashboard/CompositeScore";
import { HistoryChart } from "@/components/dashboard/HistoryChart";
import { entryLabel } from "@/lib/types";
import type { WeekData } from "@/lib/types";
import {
  Activity,
  GitBranch,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

function getStatusColor(score: number) {
  if (score < 40) return "#10b981";
  if (score < 70) return "#f59e0b";
  return "#ef4444";
}

const StatusIcon = ({ score }: { score: number | null }) => {
  if (score === null)
    return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
  if (score < 40) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (score < 70) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  return <AlertTriangle className="w-4 h-4 text-red-400" />;
};

// ── Ticker items ──────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: "GPU (RTX 4090)", key: "gpu" },
  { label: "Credit Spreads", key: "credit" },
  { label: "Energy Costs", key: "energy" },
  { label: "Demand Ratio", key: "demand" },
  { label: "Data Wall", key: "datawall" },
  { label: "ERP Valuation", key: "valuation" },
  { label: "Retail FOMO", key: "behavioral" },
  { label: "Liquidity", key: "liquidity" },
];

const TickerBar = ({ factors }: { factors: Record<string, number> | null }) => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-2"
      aria-label="Live signal ticker"
    >
      <div className="ticker-track">
        {items.map((item, i) => {
          const val = factors?.[item.key] ?? null;
          const color = val !== null ? getStatusColor(val) : "#4b5563";
          return (
            <span
              key={i}
              className="flex items-center gap-2 px-6 text-xs font-mono whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-400">{item.label}</span>
              <span className="font-semibold" style={{ color }}>
                {val !== null ? `${val}%` : "--"}
              </span>
              <span className="text-white/10 px-2">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [historyData, setHistoryData] = useState<WeekData[]>([]);
  const [latestData, setLatestData] = useState<WeekData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data.json");
        if (!response.ok) throw new Error("Data not found");
        const json = await response.json();
        if (json.length > 0) {
          setHistoryData(json);
          setLatestData(json[json.length - 1]);
        }
      } catch {
        setError("Could not load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const date = latestData
    ? new Date(latestData.timestamp * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const compositeScore = latestData?.score ?? null;
  const statusLabel =
    compositeScore !== null
      ? compositeScore < 40
        ? "Healthy"
        : compositeScore < 70
          ? "Elevated Risk"
          : "Bubble Territory"
      : "Loading";

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      {/* Ambient background orbs */}
      <div className="orb orb-blue" aria-hidden="true" />
      <div className="orb orb-green" aria-hidden="true" />

      {/* ── NAV ───────────────────────────────────────────────────────── */}
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
            <StatusIcon score={compositeScore} />
            <span className="text-white/40">{latestData ? entryLabel(latestData) : "—"}</span>
          </div>

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

      {/* ── TICKER ────────────────────────────────────────────────────── */}
      <div className="pt-[49px]">
        <TickerBar factors={latestData?.factors ?? null} />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Updated daily · 8 macro signals · AI analysis
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
          Will the <span className="gradient-text-blue">AI Bubble</span>
          <br />
          Burst Soon?
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          A data-driven composite risk score built from GPU prices, credit
          spreads, retail FOMO, liquidity, and more — refreshed every trading day.
        </p>

        {/* ── Score pill ── */}
        {compositeScore !== null && (
          <div className="inline-flex items-center gap-4 glass-card rounded-2xl px-8 py-5 border border-white/[0.08]">
            <div>
              <div
                className="text-5xl font-black font-mono"
                style={{ color: getStatusColor(compositeScore) }}
              >
                {compositeScore}%
              </div>
              <div className="text-xs text-white/30 font-mono mt-0.5">
                composite risk
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-left">
              <div
                className="text-sm font-semibold font-mono"
                style={{ color: getStatusColor(compositeScore) }}
              >
                {statusLabel}
              </div>
              <div className="text-xs text-white/30 font-mono mt-0.5">
                as of {date}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading signals...
          </div>
        )}
        {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
      </section>

      <div className="section-divider mx-6 mb-12" />

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-10">
        {/* Gauge + Chart */}
        <CompositeScore score={compositeScore} />
        <HistoryChart historyData={historyData} />

        {/* AI Analysis card */}
        {latestData?.aiAnalysis && latestData.aiAnalysis !== "AI analysis unavailable." && (
          <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">✨</span>
              <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-widest">
                AI Analysis
              </span>
              <span className="ml-auto text-[10px] font-mono text-white/20">
                Gemini Flash · {latestData ? entryLabel(latestData) : ""}
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-mono">
              {latestData.aiAnalysis}
            </p>
          </div>
        )}

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

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
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
