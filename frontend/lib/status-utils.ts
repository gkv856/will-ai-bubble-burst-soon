export function getStatusColor(score: number) {
  if (score < 30) return "#10b981";
  if (score < 50) return "#84cc16";
  if (score < 70) return "#f59e0b";
  if (score < 85) return "#f97316";
  return "#ef4444";
}

export function getStatusLabel(score: number | null): string {
  if (score === null) return "Loading";
  if (score < 30) return "Healthy";
  if (score < 50) return "Moderate";
  if (score < 70) return "Elevated Risk";
  if (score < 85) return "Bubble Territory";
  return "Extreme Risk";
}

// Canonical 3-band composite risk scale — matches the main gauge (CompositeScore),
// the history chart legend, and the email copy. Use this (not getStatusColor/
// getStatusLabel above) for anything shown next to or about the composite score,
// so labels never disagree with the big gauge on the same screen.
export function getRiskColor(score: number): string {
  if (score < 40) return "#10b981";
  if (score < 70) return "#f59e0b";
  return "#ef4444";
}

export function getRiskLabel(score: number): string {
  if (score < 40) return "Healthy";
  if (score < 70) return "Elevated Risk";
  return "Bubble Territory";
}
