import { useState } from "react";
import { Target, PencilSimple, Check, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { readCollection, writeCollection } from "@/lib/storage";

const GOAL_KEY = "crm_monthly_goal";
const DEFAULT_GOAL = { revenue: 20000, count: 10 };

function GoalBar({ label, current, target, display, color, testId }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const done = pct >= 100;
  return (
    <div data-testid={testId}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`text-xs font-semibold ${done ? "text-emerald-400" : "text-slate-300"}`} data-testid={`${testId}-pct`}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${done ? "bg-emerald-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-slate-500">
        <span className="text-slate-200 font-semibold">{display(current)}</span>
        <span>meta {display(target)}</span>
      </div>
    </div>
  );
}

export function MonthlyGoalCard({ monthRevenue, monthCount }) {
  const [goal, setGoal] = useState(() => readCollection(GOAL_KEY, DEFAULT_GOAL));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  const save = () => {
    const next = { revenue: Math.max(0, Number(draft.revenue) || 0), count: Math.max(0, Number(draft.count) || 0) };
    writeCollection(GOAL_KEY, next);
    setGoal(next);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6" data-testid="monthly-goal-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-indigo-400" weight="duotone" />
          <h3 className="text-sm font-semibold text-slate-200">Meta do mês</h3>
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white gap-1.5" onClick={() => { setDraft(goal); setEditing(true); }} data-testid="monthly-goal-edit-button">
            <PencilSimple size={14} /> Editar
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500" onClick={save} data-testid="monthly-goal-save-button"><Check size={14} /></Button>
            <Button size="sm" variant="ghost" className="h-8 text-slate-400" onClick={() => setEditing(false)} data-testid="monthly-goal-cancel-button"><X size={14} /></Button>
          </div>
        )}
      </div>

      {editing && (
        <div className="grid grid-cols-2 gap-3 mb-5" data-testid="monthly-goal-form">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Meta em R$</label>
            <Input type="number" min="0" value={draft.revenue} onChange={(e) => setDraft({ ...draft, revenue: e.target.value })} className="bg-slate-900 border-slate-800 text-slate-100" data-testid="monthly-goal-revenue-input" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Meta de matrículas</label>
            <Input type="number" min="0" value={draft.count} onChange={(e) => setDraft({ ...draft, count: e.target.value })} className="bg-slate-900 border-slate-800 text-slate-100" data-testid="monthly-goal-count-input" />
          </div>
        </div>
      )}

      <div className="space-y-5">
        <GoalBar label="Vendas (R$)" current={monthRevenue} target={goal.revenue} display={formatCurrency} color="bg-indigo-500" testId="monthly-goal-revenue" />
        <GoalBar label="Matrículas" current={monthCount} target={goal.count} display={(v) => `${v}`} color="bg-cyan-500" testId="monthly-goal-count" />
      </div>
    </div>
  );
}
