import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Copy, Printer, FilePdf } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentChecklist } from "@/components/shared/DocumentChecklist";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUS_LIST } from "@/constants/options";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { buildSummaryText } from "@/lib/whatsappText";

export default function EnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enrollments, students, courses, updateEnrollmentStatus, updateEnrollmentDocuments, loading } = useData();
  const enrollment = enrollments.find((e) => e.id === id);

  if (loading) return <div className="text-slate-400 text-sm">Carregando...</div>;
  if (!enrollment) {
    return (
      <div className="text-slate-400" data-testid="enrollment-not-found">
        Matrícula não encontrada. <Link to="/matriculas" className="text-indigo-400">Voltar</Link>
      </div>
    );
  }

  const student = students.find((s) => s.id === enrollment.studentId);
  const course = courses.find((c) => c.id === enrollment.courseId);
  const margin = enrollment.salePrice - enrollment.repasse;

  const handleCopy = async () => {
    const text = buildSummaryText(enrollment, student, course);
    await navigator.clipboard.writeText(text);
    toast.success("Resumo copiado para a área de transferência!");
  };

  const handlePrint = () => window.print();

  const handleStatusChange = (nextStatus) => {
    if (nextStatus === enrollment.status) return;
    if (nextStatus === "cancelada" && !window.confirm("Cancelar esta matrícula? Essa ação altera o status do registro.")) return;

    toast.promise(updateEnrollmentStatus(enrollment.id, nextStatus), {
      loading: "Atualizando status...",
      success: "Status da matrícula atualizado.",
      error: "Não foi possível atualizar o status.",
    });
  };

  const toggleDoc = (doc, checked) => {
    updateEnrollmentDocuments(enrollment.id, { ...enrollment.documents, [doc]: checked });
  };

  return (
    <div data-testid="enrollment-detail-page">
      <button
        onClick={() => navigate("/matriculas")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 no-print"
        data-testid="enrollment-detail-back-button"
      >
        <ArrowLeft size={16} /> Voltar para matrículas
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 no-print">
        <div>
          <p className="text-xs font-mono text-slate-500">MATRÍCULA Nº {enrollment.number}</p>
          <h1 className="text-2xl font-bold text-slate-50 font-display mt-1">{student?.fullName}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {course?.name} · {formatDate(enrollment.createdAt)} às {formatTime(enrollment.createdAt)}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          <StatusBadge status={enrollment.status} />
          <Select value={enrollment.status} onValueChange={handleStatusChange}>
            <SelectTrigger aria-label="Alterar status da matrícula" className="w-full bg-slate-900 border-slate-800 text-slate-100 sm:w-56" data-testid="enrollment-status-select"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              {STATUS_LIST.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-900 border border-slate-800 no-print">
          <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="summary" data-testid="tab-summary">Resumo para Escola</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs text-slate-500">Valor vendido</p>
              <p className="text-xl font-bold text-slate-100 mt-1">{formatCurrency(enrollment.salePrice)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs text-slate-500">Repasse à escola</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(enrollment.repasse)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs text-slate-500">Margem</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(margin)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Dados do aluno</p>
              <p className="text-sm text-slate-200">{student?.fullName}</p>
              <p className="text-xs text-slate-400">CPF: {student?.cpf}</p>
              <p className="text-xs text-slate-400">Telefone: {student?.phone}</p>
              <p className="text-xs text-slate-400">E-mail: {student?.email}</p>
              <p className="text-xs text-slate-400">{student?.city} - {student?.state}</p>
              <Link to={`/alunos/${student?.id}`} className="text-xs text-indigo-400 inline-block pt-1" data-testid="enrollment-view-student-link">
                Ver perfil completo →
              </Link>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Informações comerciais</p>
              <p className="text-xs text-slate-400">Origem: <span className="text-slate-200">{enrollment.origin}</span></p>
              <p className="text-xs text-slate-400">Campanha: <span className="text-slate-200">{enrollment.campaign || "—"}</span></p>
              <p className="text-xs text-slate-400 pt-2">Observações internas:</p>
              <p className="text-xs text-slate-300">{enrollment.notes || "Nenhuma observação registrada."}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500 mb-4">Documentação</p>
            <DocumentChecklist documents={course?.requiredDocuments || []} values={enrollment.documents} onToggle={toggleDoc} />
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <div className="flex flex-wrap gap-3 mb-4 no-print">
            <Button onClick={handleCopy} className="bg-indigo-600 hover:bg-indigo-500 gap-2" data-testid="copy-whatsapp-button">
              <Copy size={16} /> Copiar para WhatsApp
            </Button>
            <Button onClick={handlePrint} variant="secondary" className="bg-slate-800 hover:bg-slate-700 gap-2" data-testid="print-summary-button">
              <Printer size={16} /> Imprimir
            </Button>
            <Button disabled variant="secondary" className="bg-slate-800/50 text-slate-500 gap-2 cursor-not-allowed" data-testid="generate-pdf-button">
              <FilePdf size={16} /> Gerar PDF (em breve)
            </Button>
          </div>
          <div id="print-summary" className="rounded-lg border border-slate-800 bg-white text-slate-900 p-8 max-w-2xl font-mono text-sm space-y-4" data-testid="enrollment-summary-card">
            <div>
              <p className="font-bold text-base">MATRÍCULA Nº {enrollment.number}</p>
              <p>Data: {formatDate(enrollment.createdAt)} · Horário: {formatTime(enrollment.createdAt)}</p>
            </div>
            <div>
              <p className="font-bold">CURSO</p>
              <p>{course?.name}</p>
            </div>
            <div>
              <p className="font-bold">DADOS DO ALUNO</p>
              <p>Nome: {student?.fullName}</p>
              <p>CPF: {student?.cpf}</p>
              <p>Telefone: {student?.phone}</p>
              <p>E-mail: {student?.email}</p>
            </div>
            {course?.extraStudentFields?.some((f) => enrollment.extra?.[f.key]) && (
              <div>
                <p className="font-bold">INFORMAÇÕES ADICIONAIS</p>
                {course.extraStudentFields.map((f) => (enrollment.extra[f.key] ? <p key={f.key}>{f.label}: {enrollment.extra[f.key]}</p> : null))}
              </div>
            )}
            <div>
              <p className="font-bold">DOCUMENTAÇÃO</p>
              {(course?.requiredDocuments || []).map((doc) => (
                <p key={doc}>{enrollment.documents[doc] ? "[Recebido]" : "[Pendente]"} {doc}</p>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
