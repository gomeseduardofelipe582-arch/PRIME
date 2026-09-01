import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, enrollments, courses, updateStudentNotes, loading } = useData();
  const student = students.find((s) => s.id === id);
  const [notes, setNotes] = useState(student?.notes || "");

  useEffect(() => {
    setNotes(student?.notes || "");
  }, [student?.id, student?.notes]);

  if (loading) return <div className="text-slate-400 text-sm">Carregando...</div>;
  if (!student) return <div className="text-slate-400" data-testid="student-not-found">Aluno não encontrado.</div>;

  const studentEnrollments = enrollments.filter((e) => e.studentId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const courseOf = (cid) => courses.find((c) => c.id === cid);
  const uniqueCourses = Array.from(new Map(studentEnrollments.map((e) => [e.courseId, courseOf(e.courseId)])).values());

  const saveNotes = async () => {
    await updateStudentNotes(student.id, notes);
    toast.success("Observações salvas.");
  };

  return (
    <div data-testid="student-detail-page">
      <button onClick={() => navigate("/alunos")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4" data-testid="student-detail-back-button">
        <ArrowLeft size={16} /> Voltar para alunos
      </button>
      <h1 className="text-2xl font-bold text-slate-50 font-display mb-1">{student.fullName}</h1>
      <p className="text-sm text-slate-400 mb-6">{student.cpf} · {student.city} - {student.state}</p>

      <Tabs defaultValue="personal">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="personal" data-testid="student-tab-personal">Dados pessoais</TabsTrigger>
          <TabsTrigger value="history" data-testid="student-tab-history">Histórico de matrículas</TabsTrigger>
          <TabsTrigger value="courses" data-testid="student-tab-courses">Cursos realizados</TabsTrigger>
          <TabsTrigger value="notes" data-testid="student-tab-notes">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-500">CPF</p><p className="text-slate-200 mt-0.5">{student.cpf}</p></div>
            <div><p className="text-xs text-slate-500">Data de nascimento</p><p className="text-slate-200 mt-0.5">{student.birthDate ? formatDate(student.birthDate) : "—"}</p></div>
            <div><p className="text-xs text-slate-500">Telefone</p><p className="text-slate-200 mt-0.5">{student.phone}</p></div>
            <div><p className="text-xs text-slate-500">E-mail</p><p className="text-slate-200 mt-0.5">{student.email}</p></div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">Endereço</p>
              <p className="text-slate-200 mt-0.5">{student.address}, {student.number} {student.complement} — {student.neighborhood}, {student.city} - {student.state}, {student.zip}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-3">
          {studentEnrollments.map((e) => (
            <Link
              key={e.id}
              to={`/matriculas/${e.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors"
              data-testid={`student-history-row-${e.number}`}
            >
              <div>
                <p className="text-sm text-slate-200 font-medium">{courseOf(e.courseId)?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Nº {e.number} · {formatDate(e.createdAt)} · {formatCurrency(e.salePrice)}</p>
              </div>
              <StatusBadge status={e.status} />
            </Link>
          ))}
          {studentEnrollments.length === 0 && <p className="text-sm text-slate-500">Nenhuma matrícula registrada.</p>}
        </TabsContent>

        <TabsContent value="courses" className="mt-6 grid sm:grid-cols-2 gap-3">
          {uniqueCourses.map((c) => c && (
            <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4" data-testid={`student-course-${c.id}`}>
              <p className="text-sm text-slate-200 font-medium">{c.name}</p>
              <p className="text-xs text-slate-500 mt-1">{c.category}</p>
            </div>
          ))}
          {uniqueCourses.length === 0 && <p className="text-sm text-slate-500">Nenhum curso realizado.</p>}
        </TabsContent>

        <TabsContent value="notes" className="mt-6 space-y-3">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} className="bg-slate-900 border-slate-800 text-slate-100" data-testid="student-notes-textarea" />
          <Button onClick={saveNotes} className="bg-indigo-600 hover:bg-indigo-500" data-testid="student-notes-save-button">Salvar observações</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
