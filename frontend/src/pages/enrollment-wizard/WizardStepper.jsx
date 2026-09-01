import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STEPS = ["Curso", "Aluno", "Documentos", "Comercial", "Revisão"];

export function WizardStepper({ current }) {
  return (
    <div className="flex items-center justify-between mb-8" data-testid="wizard-stepper">
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const active = step === current;
        const done = step < current;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border transition-colors",
                  done ? "bg-emerald-500 border-emerald-500 text-emerald-950" : active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-900 border-slate-700 text-slate-500"
                )}
                data-testid={`wizard-step-indicator-${step}`}
              >
                {done ? <Check size={16} weight="bold" /> : step}
              </div>
              <span className={cn("text-xs font-medium text-center px-0.5", active ? "text-slate-100" : "text-slate-500")}>{label}</span>
            </div>
            {step < STEPS.length && <div className={cn("h-px flex-1 -mt-6", done ? "bg-emerald-500" : "bg-slate-800")} />}
          </div>
        );
      })}
    </div>
  );
}
