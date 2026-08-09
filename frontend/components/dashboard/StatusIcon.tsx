import { Activity, CheckCircle, AlertTriangle } from "lucide-react";

export const StatusIcon = ({ score }: { score: number | null }) => {
  if (score === null)
    return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
  if (score < 40) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
};
