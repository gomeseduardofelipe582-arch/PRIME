const ACCENTS = {
  indigo: "text-indigo-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
  purple: "text-purple-400",
};

export function KpiCard({ icon: Icon, label, value, hint, accent = "indigo" }) {
  return (
    <div
      className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-3"
      data-testid={`kpi-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        {Icon && <Icon size={20} className={ACCENTS[accent]} weight="duotone" />}
      </div>
      <span className="text-3xl font-bold text-white tracking-tight font-display">{value}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
}
