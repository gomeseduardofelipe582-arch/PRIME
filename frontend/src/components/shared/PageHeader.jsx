export function PageHeader({ title, subtitle, action, eyebrow }) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-indigo-300">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 font-display sm:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
