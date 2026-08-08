export interface AiPrediction {
  scores: number[]; // Array of 3 scores (Day 1, Day 2, Day 3)
  reason: string;
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

/** Returns the display label for an entry — dayId if available, else weekId. */
export function entryLabel(entry: WeekData): string {
  if (entry.dayId) {
    // Format "2026-08-07" as "Aug 7"
    const d = new Date(entry.dayId + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return entry.weekId ?? "";
}

