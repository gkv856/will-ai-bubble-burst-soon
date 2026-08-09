"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface WarningBannerProps {
  verdict: "GREEN" | "YELLOW" | "RED" | null;
  staleSignals?: string[];
}

export function WarningBanner({ verdict, staleSignals = [] }: WarningBannerProps) {
  if (!verdict || verdict === "GREEN") return null;

  const isRed = verdict === "RED";
  const borderColor = isRed ? "border-red-500/30" : "border-amber-500/30";
  const bgColor = isRed ? "bg-red-500/10" : "bg-amber-500/10";
  const textColor = isRed ? "text-red-300" : "text-amber-300";
  const iconColor = isRed ? "text-red-400" : "text-amber-400";

  const message = isRed
    ? `Data quality: RED — ${staleSignals.length}+ signals have stale or missing data. Treat scores with caution.`
    : `Data quality: YELLOW — ${staleSignals.length} signal${staleSignals.length !== 1 ? "s" : ""} has stale data. Results may be slightly less reliable.`;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${borderColor} ${bgColor}`}
      role="alert"
    >
      <AlertTriangle className={`w-4 h-4 shrink-0 ${iconColor}`} />
      <p className={`text-xs font-mono ${textColor}`}>
        {message}
        {staleSignals.length > 0 && (
          <span className="opacity-70 ml-1">
            ({staleSignals.join(", ")})
          </span>
        )}
      </p>
    </div>
  );
}
