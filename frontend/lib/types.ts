export interface AiPrediction {
  scores: number[]; // Array of 3 scores (Day 1, Day 2, Day 3)
  reason: string;
}

/** How a signal's 0–100 risk score moved between an earlier reading and the latest one. */
export interface SignalTrend {
  /** Latest score minus the earlier score. Positive = risk went up. */
  delta: number;
  /** How many days back the comparison reading is. */
  daysAgo: number;
}

export interface WeekData {
  weekId?: string;
  dayId?: string;
  timestamp: number;
  factors: Record<string, number>;
  score: number;
  aiAnalysis?: string;
  aiPredictions?: Record<string, AiPrediction>;
}

export function entryLabel(entry: WeekData | any): string {
  if (entry.run_date) {
    const datePart = entry.run_date.split("T")[0];
    const d = new Date(datePart + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (entry.dayId) {
    // Format "2026-08-07" as "Aug 7"
    const d = new Date(entry.dayId + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return entry.weekId ?? "";
}

