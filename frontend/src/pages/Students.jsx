import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export default function Students() {
  const { students, enrollments } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return students
      .map((s) => {
        const studentEnrollments = enrollments.filter((e) => e.studentId === s.id);
        const last = [...studentEnrollments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return { ...s, coursesCount: studentEnrollments.length, lastEnrollment: last };
      })
      .filter((s) => {
        const term = search.trim().toLowerCase();
        return !term || s.fullName.toLowerCase().includes(term) || s.cpf.includes(term) || s.phone.includes(term) || s.email.toLowerCase().includes(term);
      });
  }, [students, enrollments, search]);

  return (
    <div data-testid="students-page">
      <PageHeader title="Alunos" subtitle={`${rows.length} aluno(s) cadastrado(s)`} />
      <div className="relative mb-4 max-w-md">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Buscar por nome, CPF, telefone ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
          data-testid="students-search-input"
        />
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Nome</TableHead>
              <TableHead className="text-slate-400">CPF</TableHead>
              <TableHead className="text-slate-400">Telefone</TableHead>
              <TableHead className="text-slate-400">Cidade</TableHead>
              <TableHead className="text-slate-400">Cursos</TableHead>
              <TableHead className="text-slate-400">Última matrícula</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow
                key={s.id}
                className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                onClick={() => navigate(`/alunos/${s.id}`)}
                data-testid={`student-row-${s.id}`}
              >
                <TableCell className="text-slate-200">{s.fullName}</TableCell>
                <TableCell className="text-slate-400">{s.cpf}</TableCell>
                <TableCell className="text-slate-400">{s.phone}</TableCell>
                <TableCell className="text-slate-400">{s.city}</TableCell>
                <TableCell className="text-slate-300">{s.coursesCount}</TableCell>
                <TableCell className="text-slate-400">{s.lastEnrollment ? formatDate(s.lastEnrollment.createdAt) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
