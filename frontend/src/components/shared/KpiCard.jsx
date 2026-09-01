const ACCENTS = {
  indigo: {
    icon: "text-indigo-300",
    surface: "bg-indigo-500/10 ring-indigo-400/20",
    value: "text-slate-50",
  },
  emerald: {
    icon: "text-emerald-300",
    surface: "bg-emerald-500/10 ring-emerald-400/20",
    value: "text-emerald-50",
  },
  amber: {
    icon: "text-amber-300",
    surface: "bg-amber-500/10 ring-amber-400/20",
    value: "text-amber-50",
  },
  rose: {
    icon: "text-rose-300",
    surface: "bg-rose-500/10 ring-rose-400/20",
    value: "text-rose-50",
  },
  purple: {
    icon: "text-purple-300",
    surface: "bg-purple-500/10 ring-purple-400/20",
    value: "text-purple-50",
  },
};

export function KpiCard({ icon: Icon, label, value, hint, accent = "indigo", trend, trendLabel }) {
  const colors = ACCENTS[accent] || ACCENTS.indigo;

  return (
    <section
      className="group flex min-h-[142px] flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(2,6,23,0.16)] transition-colors hover:border-slate-700"
      data-testid={`kpi-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
      aria-label={label}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="max-w-[14rem] text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </span>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${colors.surface}`}>
            <Icon size={19} className={colors.icon} weight="duotone" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span className={`truncate text-[1.8rem] font-bold tracking-tight font-display ${colors.value}`}>
          {value}
        </span>
        {trend && (
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[0.68rem] font-semibold text-emerald-300">
            {trend}
          </span>
        )}
      </div>
      {(hint || trendLabel) && (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="truncate">{hint}</span>
          {trendLabel && <span className="shrink-0 text-slate-500">{trendLabel}</span>}
        </div>
      )}
    </section>
  );
}
