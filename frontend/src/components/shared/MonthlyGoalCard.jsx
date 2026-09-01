import { useState } from "react";
import { Target, PencilSimple, Check, X, ArrowUpRight } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { readCollection, writeCollection } from "@/lib/storage";

const GOAL_KEY = "crm_monthly_goal";
const DEFAULT_GOAL = { revenue: 20000, count: 10 };

function GoalBar({ label, current, target, display, color, testId }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const done = pct >= 100;
  const remaining = Math.max(0, target - current);

  return (
    <div data-testid={testId}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <span className={`text-xs font-semibold ${done ? "text-emerald-300" : "text-slate-200"}`} data-testid={`${testId}-pct`}>
          {pct}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/90" aria-label={`${label}: ${pct}% da meta alcançada`} role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${done ? "bg-emerald-400" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-100">{display(current)}</span>
        <span className="text-slate-500">meta {display(target)}</span>
      </div>
      {!done && remaining > 0 && (
        <p className="mt-1 text-[0.68rem] text-slate-500">Faltam {display(remaining)}</p>
      )}
    </div>
  );
}

export function MonthlyGoalCard({ monthRevenue, monthCount }) {
  const [goal, setGoal] = useState(() => readCollection(GOAL_KEY, DEFAULT_GOAL));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  const startEditing = () => {
    setDraft(goal);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(goal);
    setEditing(false);
  };

  const save = () => {
    const next = {
      revenue: Math.max(0, Number(draft.revenue) || 0),
      count: Math.max(0, Number(draft.count) || 0),
    };
    writeCollection(GOAL_KEY, next);
    setGoal(next);
    setEditing(false);
    toast.success("Meta do mês atualizada.");
  };

  return (
    <section className="rounded-xl border border-indigo-400/20 bg-indigo-500/[0.07] p-5 shadow-[0_12px_30px_rgba(2,6,23,0.14)]" data-testid="monthly-goal-card">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-400/20">
            <Target size={19} className="text-indigo-300" weight="duotone" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Meta do mês</h3>
            <p className="mt-1 text-xs text-slate-400">Acompanhe o ritmo do objetivo comercial.</p>
          </div>
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" className="h-8 shrink-0 gap-1.5 text-slate-300 hover:bg-white/5 hover:text-white" onClick={startEditing} data-testid="monthly-goal-edit-button">
            <PencilSimple size={14} aria-hidden="true" /> Editar
          </Button>
        ) : (
          <div className="flex gap-1" aria-label="Ações da edição da meta">
            <Button size="sm" className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-500" onClick={save} data-testid="monthly-goal-save-button">
              <Check size={14} aria-hidden="true" /> Salvar
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-slate-300 hover:bg-white/5 hover:text-white" onClick={cancelEditing} data-testid="monthly-goal-cancel-button">
              <X size={14} aria-hidden="true" /> Cancelar
            </Button>
          </div>
        )}
      </div>

      {editing && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="monthly-goal-form">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="monthly-goal-revenue-input">Meta em R$</label>
            <Input id="monthly-goal-revenue-input" type="number" min="0" value={draft.revenue} onChange={(e) => setDraft({ ...draft, revenue: e.target.value })} className="border-slate-700 bg-slate-950/60 text-slate-100" data-testid="monthly-goal-revenue-input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="monthly-goal-count-input">Meta de matrículas</label>
            <Input id="monthly-goal-count-input" type="number" min="0" value={draft.count} onChange={(e) => setDraft({ ...draft, count: e.target.value })} className="border-slate-700 bg-slate-950/60 text-slate-100" data-testid="monthly-goal-count-input" />
          </div>
        </div>
      )}

      <div className="space-y-5">
        <GoalBar label="Vendas (R$)" current={monthRevenue} target={goal.revenue} display={formatCurrency} color="bg-indigo-400" testId="monthly-goal-revenue" />
        <GoalBar label="Matrículas" current={monthCount} target={goal.count} display={(v) => `${v}`} color="bg-cyan-400" testId="monthly-goal-count" />
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-indigo-300/10 pt-4 text-xs text-indigo-200/80">
        <ArrowUpRight size={14} aria-hidden="true" />
        <span>Use os filtros abaixo para analisar o desempenho por período.</span>
      </div>
    </section>
  );
}
