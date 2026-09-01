import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LABELS = { todos: "Todos", hoje: "Hoje", "7dias": "7 dias", "30dias": "30 dias", mes: "Este mês", personalizado: "Personalizado" };
const DEFAULT_PRESETS = ["hoje", "7dias", "30dias", "mes", "personalizado"];

export function PeriodFilter({ preset, custom, onPresetChange, onCustomChange, presets = DEFAULT_PRESETS }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((key) => (
        <Button
          key={key}
          size="sm"
          variant={preset === key ? "default" : "secondary"}
          className={cn("rounded-full text-xs", preset === key ? "bg-indigo-600 hover:bg-indigo-500" : "bg-slate-800 hover:bg-slate-700 text-slate-300")}
          onClick={() => onPresetChange(key)}
          data-testid={`period-filter-${key}`}
        >
          {LABELS[key]}
        </Button>
      ))}
      {preset === "personalizado" && (
        <div className="flex items-center gap-2 ml-1">
          <Input
            type="date"
            value={custom.start}
            onChange={(e) => onCustomChange({ ...custom, start: e.target.value })}
            className="h-8 w-36 bg-slate-900 border-slate-800 text-xs"
            data-testid="period-filter-start-date"
          />
          <span className="text-slate-500 text-xs">até</span>
          <Input
            type="date"
            value={custom.end}
            onChange={(e) => onCustomChange({ ...custom, end: e.target.value })}
            className="h-8 w-36 bg-slate-900 border-slate-800 text-xs"
            data-testid="period-filter-end-date"
          />
        </div>
      )}
    </div>
  );
}
