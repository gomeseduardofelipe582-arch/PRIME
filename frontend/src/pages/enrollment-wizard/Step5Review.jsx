import { useData } from "@/context/DataContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

export function Step5Review({ data, onBack, onFinish }) {
  const { courses } = useData();
  const course = courses.find((c) => c.id === data.courseId);
  const margin = (Number(data.salePrice) || 0) - (course?.repasse || 0);
  const docsTotal = course?.requiredDocuments?.length || 0;
  const docsDone = Object.values(data.documents).filter(Boolean).length;

  return (
    <div className="space-y-6" data-testid="wizard-step5">
      <div className="rounded-lg border border-slate-800 divide-y divide-slate-800">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Curso</p>
          <p className="text-sm text-slate-100">{course?.name}</p>
          <p className="text-xs text-slate-500 mt-1">
            Venda {formatCurrency(data.salePrice)} · Repasse {formatCurrency(course?.repasse)} · Margem <span className="text-emerald-400 font-medium">{formatCurrency(margin)}</span>
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Aluno</p>
          <p className="text-sm text-slate-100">{data.student.fullName}</p>
          <p className="text-xs text-slate-500 mt-1">{data.student.cpf} · {data.student.phone} · {data.student.email}</p>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Documentação</p>
          <p className="text-sm text-slate-100">{docsDone}/{docsTotal} documentos recebidos</p>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Comercial</p>
          <p className="text-sm text-slate-100">Origem: {data.commercial.origin || "—"}</p>
          <p className="text-xs text-slate-500 mt-1">Campanha: {data.commercial.campaign || "—"}</p>
        </div>
        <div className="p-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-slate-500">Status inicial</p>
          <StatusBadge status="novo_cadastro" />
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} className="bg-slate-800 hover:bg-slate-700" data-testid="wizard-back-button">Voltar</Button>
        <Button onClick={onFinish} className="bg-indigo-600 hover:bg-indigo-500" data-testid="wizard-finish-button">Criar Matrícula</Button>
      </div>
    </div>
  );
}
