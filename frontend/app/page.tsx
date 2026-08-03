"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FactorCard } from "@/components/dashboard/FactorCard";
import { CompositeScore } from "@/components/dashboard/CompositeScore";
import { HistoryChart } from "@/components/dashboard/HistoryChart";
import type { WeekData } from "@/lib/types";
import {
  Activity,
  GitBranch,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Lazy-load the heavy math section — code-split per Next.js best practice
const MathBreakdown = dynamic(
  () =>
    import("@/components/dashboard/MathBreakdown").then((m) => m.MathBreakdown),
  { ssr: false },
);

// ── Ticker items ──────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: "GPU (RTX 4090)", key: "gpu" },
  { label: "Credit Spreads", key: "credit" },
  { label: "Energy Permits", key: "energy" },
  { label: "Demand Ratio", key: "demand" },
  { label: "Data Wall", key: "datawall" },
  { label: "ERP Valuation", key: "valuation" },
  { label: "Retail FOMO", key: "behavioral" },
  { label: "M2 Liquidity", key: "liquidity" },
];

function getStatusColor(score: number) {
  if (score < 40) return "#10b981";
  if (score < 70) return "#f59e0b";
  return "#ef4444";
}

function StatusIcon({ score }: { score: number | null }) {
  if (score === null)
    return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
  if (score < 40) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (score < 70) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  return <AlertTriangle className="w-4 h-4 text-red-400" />;
}

// ── Ticker bar ────────────────────────────────────────────────────────────────
function TickerBar({ factors }: { factors: Record<string, number> | null }) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop
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
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
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
}

// ── Methodology section ───────────────────────────────────────────────────────
function MethodologyCard({
  id,
  title,
  desc,
  weight,
}: {
  id: string;
  title: string;
  desc: string;
  weight: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 cursor-default">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
          {id}
        </span>
        <span className="text-xs font-mono text-white/30 shrink-0">
          {weight}
        </span>
      </div>
      <p className="text-sm font-semibold text-white/90 mb-1 font-mono">
        {title}
      </p>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [historyData, setHistoryData] = useState<WeekData[]>([]);
  const [latestData, setLatestData] = useState<WeekData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/history.json");
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

        <div className="flex items-center gap-2 text-xs font-mono">
          <StatusIcon score={compositeScore} />
          <span className="text-white/40">{latestData?.weekId ?? "—"}</span>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="View source on GitHub"
        >
          <GitBranch className="w-4 h-4" />
          <span className="hidden sm:block">Source</span>
        </a>
      </header>

      {/* ── TICKER ────────────────────────────────────────────────────── */}
      <div className="pt-[49px]">
        <TickerBar factors={latestData?.factors ?? null} />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Updated weekly · 8 macro signals
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
          Will the <span className="gradient-text-blue">AI Bubble</span>
          <br />
          Burst Soon?
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          A data-driven composite risk score built from GPU prices, credit
          spreads, retail FOMO, liquidity, and more — refreshed every week.
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

      {/* ── MAIN DASHBOARD ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-10">
        {/* Gauge + Chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <CompositeScore score={compositeScore} />
          <HistoryChart historyData={historyData} />
        </div>

        {/* Factor grid */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-widest">
              Signal Breakdown
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <FactorCard
              title="GPU Spot Prices"
              score={latestData?.factors?.gpu ?? null}
              id="gpu"
              desc="RTX 4090 rental cost on Vast.ai vs historical baseline."
            />
            <FactorCard
              title="Credit Spreads"
              score={latestData?.factors?.credit ?? null}
              id="credit"
              desc="Investment-grade bond spread (BAMLC0A0CM) from FRED."
            />
            <FactorCard
              title="Energy Permits"
              score={latestData?.factors?.energy ?? null}
              id="energy"
              desc="Proxy for new data centre build-out velocity."
            />
            <FactorCard
              title="Demand Reality"
              score={latestData?.factors?.demand ?? null}
              id="demand"
              desc="IGV/SMH ratio — software demand vs. hardware speculation."
            />
            <FactorCard
              title="Data Wall"
              score={latestData?.factors?.datawall ?? null}
              id="datawall"
              desc="Risk from AI training data exhaustion."
            />
            <FactorCard
              title="ERP Valuation"
              score={latestData?.factors?.valuation ?? null}
              id="valuation"
              desc="Equity risk premium indicating overvaluation signals."
            />
            <FactorCard
              title="Retail FOMO"
              score={latestData?.factors?.behavioral ?? null}
              id="behavioral"
              desc='Google Trends for "Nvidia options" + "AI investing".'
            />
            <FactorCard
              title="M2 Liquidity"
              score={latestData?.factors?.liquidity ?? null}
              id="liquidity"
              desc="US money supply from FRED — fuelling or deflating the rally."
            />
          </div>
        </div>

        <div className="section-divider" />

        {/* Methodology */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-mono font-semibold text-white/60 uppercase tracking-widest">
              Methodology
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MethodologyCard
              id="F1"
              title="GPU Spot Prices"
              weight="10%"
              desc="High GPU rental cost signals over-investment and speculative demand in AI compute."
            />
            <MethodologyCard
              id="F2"
              title="Credit Spreads"
              weight="10%"
              desc="Widening spreads signal macro stress; tightening enables continued AI spending."
            />
            <MethodologyCard
              id="F3"
              title="Demand Reality"
              weight="20%"
              desc="The IGV/SMH ratio reveals if software demand is keeping up with hardware bets."
            />
            <MethodologyCard
              id="F4"
              title="ERP Valuation"
              weight="20%"
              desc="A compressed equity risk premium signals markets pricing in an implausible future."
            />
            <MethodologyCard
              id="F5"
              title="Retail FOMO"
              weight="15%"
              desc="Retail search intensity tracks speculative euphoria at the top of bubble cycles."
            />
            <MethodologyCard
              id="F6"
              title="M2 Liquidity"
              weight="15%"
              desc="Loose monetary conditions inflate all risk assets including AI stocks."
            />
            <MethodologyCard
              id="F7"
              title="Data Wall"
              weight="5%"
              desc="Training data scarcity could stall model progress, puncturing growth narratives."
            />
            <MethodologyCard
              id="F8"
              title="Energy Permits"
              weight="5%"
              desc="Proxy for real capital commitment to AI infrastructure buildout."
            />
          </div>
        </div>

        <div className="section-divider" />

        {/* Math deep-dive */}
        <MathBreakdown latestData={latestData} />
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center">
        <p className="text-xs font-mono text-white/20">
          Not financial advice. Data sourced from FRED, Yahoo Finance, Vast.ai,
          and Google Trends.
          <span className="mx-2 opacity-40">·</span>
          <a
            href="https://github.com/gkv856/ai-bubble-tracker"
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
