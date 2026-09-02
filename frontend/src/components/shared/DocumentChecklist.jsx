import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function DocumentChecklist({ documents, values, onToggle, readOnly = false, documentRecords = [], onUpload, onView, onRemove, busyDocumentId }) {
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
        {documents.map((doc) => {
          const record = documentRecords.find((item) => item.label === doc);
          const busy = record?.id === busyDocumentId;
          const inputId = `document-upload-${record?.id || doc}`;
          return (
            <div key={doc} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`document-checkbox-${record?.id || doc}`}
                  checked={!!values[doc]}
                  disabled={readOnly || busy}
                  onCheckedChange={(checked) => onToggle && onToggle(doc, checked)}
                  data-testid={`document-checkbox-${doc}`}
                />
                <label htmlFor={`document-checkbox-${record?.id || doc}`} className={cn("min-w-0 flex-1 cursor-pointer text-sm", readOnly && "cursor-default", values[doc] ? "text-slate-500 line-through" : "text-slate-200")}>{doc}</label>
              </div>
              {record && !readOnly && (
                <div className="ml-7 mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <input id={inputId} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload?.(record, file); event.target.value = ""; }} />
                  <label htmlFor={inputId} className={cn("cursor-pointer rounded border border-slate-700 px-2.5 py-1 text-slate-300 hover:bg-slate-800", busy && "pointer-events-none opacity-60")} data-testid={`document-upload-${record.id}`}>{busy ? "Processando..." : record.filePath ? "Substituir arquivo" : "Anexar arquivo"}</label>
                  {record.filePath && <button type="button" onClick={() => onView?.(record)} disabled={busy} className="rounded border border-slate-700 px-2.5 py-1 text-indigo-300 hover:bg-slate-800" data-testid={`document-view-${record.id}`}>Visualizar</button>}
                  {record.filePath && <button type="button" onClick={() => onRemove?.(record)} disabled={busy} className="rounded border border-rose-500/40 px-2.5 py-1 text-rose-300 hover:bg-rose-500/10" data-testid={`document-remove-${record.id}`}>Remover</button>}
                  {record.originalFilename && <span className="max-w-full truncate text-slate-500" title={record.originalFilename}>{record.originalFilename}</span>}
                </div>
              )}
            </div>
          );
        })}
        {documents.length === 0 && <p className="text-xs text-slate-500 px-4 py-3">Nenhum documento configurado para este curso.</p>}
      </div>
    </div>
  );
}
