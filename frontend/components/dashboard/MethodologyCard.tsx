export const MethodologyCard = ({
  id,
  title,
  desc,
  weight,
}: {
  id: string;
  title: string;
  desc: string;
  weight: string;
}) => (
  <div className="glass-card rounded-xl p-4 cursor-default">
    <div className="flex items-start justify-between gap-3 mb-2">
      <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
        {id}
      </span>
      <span className="text-xs font-mono text-white/30 shrink-0">{weight}</span>
    </div>
    <p className="text-sm font-semibold text-white/90 mb-1 font-mono">
      {title}
    </p>
    <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
  </div>
);
