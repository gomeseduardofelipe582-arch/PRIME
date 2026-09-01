import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function DocumentChecklist({ documents, values, onToggle, readOnly = false }) {
  const total = documents.length;
  const received = documents.filter((d) => values[d]).length;
  const complete = total > 0 && received === total;
  return (
    <div className="space-y-3" data-testid="document-checklist">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Documentos ({received}/{total})
        </span>
        <span
          className={cn(
            "text-xs font-semibold rounded-full px-2.5 py-1",
            complete ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          )}
          data-testid="document-checklist-status"
        >
          {complete ? "Documentação completa" : "Documentação pendente"}
        </span>
      </div>
      <div className="rounded-lg border border-slate-800 divide-y divide-slate-800">
        {documents.map((doc) => (
          <label key={doc} className={cn("flex items-center gap-3 px-4 py-3 cursor-pointer", readOnly && "cursor-default")}>
            <Checkbox
              checked={!!values[doc]}
              disabled={readOnly}
              onCheckedChange={(checked) => onToggle && onToggle(doc, checked)}
              data-testid={`document-checkbox-${doc}`}
            />
            <span className={cn("text-sm", values[doc] ? "text-slate-500 line-through" : "text-slate-200")}>{doc}</span>
          </label>
        ))}
        {documents.length === 0 && <p className="text-xs text-slate-500 px-4 py-3">Nenhum documento configurado para este curso.</p>}
      </div>
    </div>
  );
}
