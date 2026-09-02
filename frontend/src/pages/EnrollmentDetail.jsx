import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Copy, FilePdf, Info, Printer, WarningCircle, WhatsappLogo } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentChecklist } from "@/components/shared/DocumentChecklist";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUS_LIST } from "@/constants/options";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { buildSchoolWhatsAppUrl, generateSchoolEnrollmentReport, getSchoolAdditionalLines, getSchoolDocumentStatus, openSchoolWhatsApp } from "@/lib/whatsappText";
import { createEnrollmentDocumentSignedUrl, removeEnrollmentDocument, uploadEnrollmentDocument } from "@/services/documentStorageService";

export default function EnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enrollments, students, courses, schoolWhatsapp, updateEnrollmentStatus, updateEnrollmentDocuments, refreshAll, loading } = useData();
  const [busyDocumentId, setBusyDocumentId] = useState(null);
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
  const margin = enrollment.repasse == null ? null : enrollment.salePrice - enrollment.repasse;
  const schoolReport = generateSchoolEnrollmentReport(enrollment, student, course);
  const schoolDocuments = getSchoolDocumentStatus(enrollment, course);
  const schoolAdditionalLines = getSchoolAdditionalLines(enrollment, student, course);
  const hasPendingDocuments = schoolDocuments.pending.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schoolReport);
      toast.success("Relatório copiado");
    } catch {
      toast.error("Não foi possível copiar o relatório.");
    }
  };

  const handleOpenSchoolWhatsApp = () => {
    const url = buildSchoolWhatsAppUrl(enrollment, student, course, schoolWhatsapp);
    openSchoolWhatsApp(enrollment, student, course, schoolWhatsapp);
    if (hasPendingDocuments) toast.warning("Esta matrícula possui documentos pendentes.");
    return url;
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
    updateEnrollmentDocuments(enrollment.id, { ...enrollment.documents, [doc]: checked }, enrollment.documentRecords);
  };

  const handleDocumentUpload = async (record, file) => {
    setBusyDocumentId(record.id);
    try {
      const result = await uploadEnrollmentDocument({ enrollmentId: enrollment.id, enrollmentDocumentId: record.id, file });
      await refreshAll();
      if (result.cleanupError) toast.warning("Arquivo enviado, mas o arquivo anterior precisa de limpeza manual.");
      else toast.success("Documento anexado com segurança.");
    } catch (error) {
      toast.error(error.message || "Não foi possível anexar o documento.");
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleDocumentView = async (record) => {
    if (!record.filePath) return;
    setBusyDocumentId(record.id);
    try {
      const url = await createEnrollmentDocumentSignedUrl(record.filePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.message || "Não foi possível abrir o documento.");
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleDocumentRemove = async (record) => {
    if (!record.filePath || !window.confirm("Remover este arquivo privado da matrícula?")) return;
    setBusyDocumentId(record.id);
    try {
      const result = await removeEnrollmentDocument({ enrollmentDocumentId: record.id, filePath: record.filePath });
      await refreshAll();
      if (result.cleanupError) toast.warning("Documento removido da matrícula, mas o arquivo anterior precisa de limpeza manual.");
      else toast.success("Documento removido.");
    } catch (error) {
      toast.error(error.message || "Não foi possível remover o documento.");
    } finally {
      setBusyDocumentId(null);
    }
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
              <p className="text-xl font-bold text-amber-400 mt-1">{enrollment.repasse == null ? "Não informado" : formatCurrency(enrollment.repasse)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-xs text-slate-500">Margem</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{margin == null ? "Não informado" : formatCurrency(margin)}</p>
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
            <DocumentChecklist documents={course?.requiredDocuments || []} values={enrollment.documents} onToggle={toggleDoc} documentRecords={enrollment.documentRecords} onUpload={handleDocumentUpload} onView={handleDocumentView} onRemove={handleDocumentRemove} busyDocumentId={busyDocumentId} />
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <section aria-labelledby="school-report-title" data-testid="school-report-section">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between no-print">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-indigo-300">Enviar com segurança</p>
                <h2 id="school-report-title" className="mt-1 text-xl font-semibold text-slate-50 font-display">Resumo para a escola</h2>
                <p className="mt-1 text-sm leading-5 text-slate-400">Revise o texto antes de copiar ou abrir o WhatsApp.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopy} className="gap-2 bg-indigo-600 shadow-lg shadow-indigo-950/30 hover:bg-indigo-500" data-testid="copy-school-report-button"><Copy size={16} aria-hidden="true" /> Copiar relatório</Button>
                <Button onClick={handleOpenSchoolWhatsApp} variant="secondary" className="gap-2 border border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20" data-testid="open-school-whatsapp-button"><WhatsappLogo size={17} weight="fill" aria-hidden="true" /> Enviar para a escola no WhatsApp</Button>
                <Button onClick={handlePrint} variant="secondary" className="gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700" data-testid="print-summary-button"><Printer size={16} aria-hidden="true" /> Imprimir</Button>
                <Button disabled variant="secondary" className="hidden gap-2 bg-slate-800/50 text-slate-500 sm:inline-flex" data-testid="generate-pdf-button"><FilePdf size={16} aria-hidden="true" /> Gerar PDF (em breve)</Button>
              </div>
            </div>

            {hasPendingDocuments && <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100 no-print" role="status" data-testid="school-report-pending-warning"><WarningCircle size={18} className="mt-0.5 shrink-0 text-amber-200" weight="duotone" aria-hidden="true" /><div><p className="font-semibold">Esta matrícula possui documentos pendentes.</p><p className="mt-0.5 text-xs text-amber-100/70">O envio continua disponível; revise os itens abaixo e anexe arquivos manualmente no WhatsApp, se necessário.</p></div></div>}

            <div id="print-summary" className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl shadow-slate-950/20 sm:p-8" data-testid="enrollment-summary-card">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">Matrícula Prime</p><p className="mt-2 text-xl font-bold tracking-tight text-slate-950">Matrícula nº {enrollment.number}</p></div><div className="text-left text-sm text-slate-600 sm:text-right"><p>Data: {formatDate(enrollment.createdAt)}</p><p>Horário: {formatTime(enrollment.createdAt)}</p></div></div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2"><ReportBlock title="Curso"><p className="font-semibold text-slate-950">{course?.name || "—"}</p><p>Categoria: {course?.category || "—"}</p></ReportBlock><ReportBlock title="Dados do aluno"><p className="font-semibold text-slate-950">{student?.fullName || "—"}</p><p>CPF: {student?.cpf || "—"}</p><p>Telefone: {student?.phone || "—"}</p><p className="break-all">E-mail: {student?.email || "—"}</p></ReportBlock></div>
              {schoolAdditionalLines.length > 0 && <div className="mt-6"><ReportBlock title="Informações adicionais">{schoolAdditionalLines.map((line) => <p key={line}>{line}</p>)}</ReportBlock></div>}
              <div className="mt-6 border-t border-slate-200 pt-6"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Documentação</p><span className={`text-xs font-semibold ${schoolDocuments.complete ? "text-emerald-700" : "text-amber-700"}`}>{schoolDocuments.complete ? "Completa" : "Pendente"}</span></div><div className="space-y-2">{schoolDocuments.documents.length ? schoolDocuments.documents.map((document) => { const received = Boolean(enrollment.documents?.[document]); return <div key={document} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span className={received ? "text-emerald-700" : "text-amber-700"}>{received ? <CheckCircle size={16} weight="fill" aria-hidden="true" /> : <Info size={16} weight="fill" aria-hidden="true" />}</span><span className="truncate">{document}</span></span><span className={`shrink-0 text-xs font-semibold ${received ? "text-emerald-700" : "text-amber-700"}`}>{received ? "Recebido" : "Pendente"}</span></div>; }) : <p className="text-sm text-slate-500">Nenhum documento configurado para este curso.</p>}</div></div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function ReportBlock({ title, children }) {
  return <div className="space-y-1.5 text-sm leading-5 text-slate-600"><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">{title}</p>{children}</div>;
}
