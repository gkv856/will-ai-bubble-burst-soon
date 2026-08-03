export interface WeekData {
  weekId: string;
  timestamp: number;
  factors: Record<string, number>;
  score: number;
}
