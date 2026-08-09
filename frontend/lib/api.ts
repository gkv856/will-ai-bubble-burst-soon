/**
 * Typed API helpers — calls the FastAPI backend.
 * Falls back to the static /data.json if NEXT_PUBLIC_API_URL is not set.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api/v1";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SignalDetail {
  factor_id: string;
  name: string;
  score: number | null;
  raw_value: number | null;
  velocity_4wk: number | null;
  velocity_12wk: number | null;
  stale: boolean;
  error_message: string | null;
  weight_used: number | null;
}

export interface ConfidenceInterval {
  lower: number | null;
  upper: number | null;
  std_dev: number | null;
  degradation_multiplier: number | null;
  confidence_level: string;
}

export interface AnalogMatch {
  episode_name: string;
  similarity: number;
  weeks_to_peak: number | null;
  max_drawdown_pct: number | null;
}

export interface LatestScores {
  run_id: string;
  run_date: string;
  composite_score: number;
  confidence_interval: ConfidenceInterval;
  correlation_penalty: number;
  quality_verdict: "GREEN" | "YELLOW" | "RED";
  low_confidence: boolean;
  stale_signals: string[];
  weights_used: Record<string, number>;
  signals: SignalDetail[];
  analogs: {
    bubble: AnalogMatch[];
    boom: AnalogMatch[];
    adjusted_risk: string;
    adjustment_reason: string;
  };
}

export interface HistoryEntry {
  run_date: string;
  composite_score: number;
  composite_lower: number | null;
  composite_upper: number | null;
  quality_verdict: "GREEN" | "YELLOW" | "RED" | null;
  signals: Record<string, number | null>;
}

export interface HistoryResponse {
  data: HistoryEntry[];
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 300 }, // 5 min cache
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} fetching ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLatestScores(): Promise<LatestScores> {
  return apiFetch<LatestScores>("/scores/latest");
}

export async function fetchHistory(weeks = 52): Promise<HistoryResponse> {
  return apiFetch<HistoryResponse>(`/history?weeks=${weeks}`);
}

export async function fetchSignalHistory(factorId: string, weeks = 52) {
  return apiFetch(`/signals/${factorId}/history?weeks=${weeks}`);
}

export async function fetchAnalogs() {
  return apiFetch("/analogs");
}

export async function fetchHealth() {
  return apiFetch("/health");
}
