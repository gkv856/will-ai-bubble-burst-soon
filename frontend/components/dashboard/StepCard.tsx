export function StepCard({ step, title, body }: { step: number; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full border border-blue-500/25 bg-blue-500/10 flex items-center justify-center text-xs font-mono text-blue-400 font-bold">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-white/80 font-mono mb-1.5">{title}</p>
        <p className="text-sm text-white/40 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
