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
