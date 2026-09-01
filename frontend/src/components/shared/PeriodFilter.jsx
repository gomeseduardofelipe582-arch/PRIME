import { CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LABELS = { todos: "Todos", hoje: "Hoje", "7dias": "7 dias", "30dias": "30 dias", mes: "Este mês", personalizado: "Personalizado" };
const DEFAULT_PRESETS = ["hoje", "7dias", "30dias", "mes", "personalizado"];

export function PeriodFilter({ preset, custom, onPresetChange, onCustomChange, presets = DEFAULT_PRESETS }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" data-testid="period-filter">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          <CalendarBlank size={15} className="text-indigo-300" aria-hidden="true" /> Período
        </span>
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-800/90 bg-slate-900/60 p-1" role="group" aria-label="Selecionar período">
          {presets.map((key) => {
            const selected = preset === key;
            return (
              <Button
                key={key}
                size="sm"
                variant="ghost"
                aria-pressed={selected}
                className={cn(
                  "h-8 rounded-lg px-3 text-xs transition-colors",
                  selected
                    ? "bg-indigo-500/20 text-indigo-100 shadow-sm ring-1 ring-indigo-400/30 hover:bg-indigo-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                )}
                onClick={() => onPresetChange(key)}
                data-testid={`period-filter-${key}`}
              >
                {LABELS[key]}
              </Button>
            );
          })}
        </div>
      </div>
      {preset === "personalizado" && (
        <div className="flex flex-wrap items-center gap-2" data-testid="period-filter-custom-range">
          <label className="sr-only" htmlFor="period-filter-start-date">Data inicial</label>
          <Input
            id="period-filter-start-date"
            type="date"
            value={custom.start}
            onChange={(e) => onCustomChange({ ...custom, start: e.target.value })}
            className="h-9 w-[8.5rem] border-slate-700 bg-slate-950/60 text-xs text-slate-200"
            data-testid="period-filter-start-date"
          />
          <span className="text-xs text-slate-500">até</span>
          <label className="sr-only" htmlFor="period-filter-end-date">Data final</label>
          <Input
            id="period-filter-end-date"
            type="date"
            value={custom.end}
            onChange={(e) => onCustomChange({ ...custom, end: e.target.value })}
            className="h-9 w-[8.5rem] border-slate-700 bg-slate-950/60 text-xs text-slate-200"
            data-testid="period-filter-end-date"
          />
        </div>
      )}
    </div>
  );
}
