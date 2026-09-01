import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { STATUS_LIST, LEAD_SOURCES, CATEGORIES } from "@/constants/options";
import { getPeriodRange, filterByRange } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";

export default function Enrollments() {
  const { enrollments, students, courses } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [preset, setPreset] = useState("todos");
  const [custom, setCustom] = useState({ start: "", end: "" });

  const studentOf = (id) => students.find((s) => s.id === id);
  const courseOf = (id) => courses.find((c) => c.id === id);

  const campaignNames = useMemo(() => Array.from(new Set(enrollments.map((e) => e.campaign).filter(Boolean))), [enrollments]);

  const filtered = useMemo(() => {
    let list = [...enrollments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (preset !== "todos") {
      const range = getPeriodRange(preset, { start: custom.start ? new Date(custom.start) : null, end: custom.end ? new Date(custom.end) : null });
      list = filterByRange(list, range);
    }
    return list.filter((e) => {
      const student = studentOf(e.studentId);
      const course = courseOf(e.courseId);
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        e.number.includes(term) ||
        student?.fullName?.toLowerCase().includes(term) ||
        student?.cpf?.includes(term) ||
        student?.phone?.includes(term) ||
        course?.name?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter;
      const matchesOrigin = originFilter === "all" || e.origin === originFilter;
      const matchesCourse = courseFilter === "all" || e.courseId === courseFilter;
      const matchesCampaign = campaignFilter === "all" || e.campaign === campaignFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesOrigin && matchesCourse && matchesCampaign;
    });
  }, [enrollments, search, statusFilter, categoryFilter, originFilter, courseFilter, campaignFilter, preset, custom, students, courses]);

  return (
    <div data-testid="enrollments-page">
      <PageHeader title="Matrículas" subtitle={`${filtered.length} matrícula(s) encontrada(s)`} />

      <div className="relative mb-3 max-w-md">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Buscar por número, nome, CPF, telefone ou curso"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
          data-testid="enrollments-search-input"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-slate-900 border-slate-800 text-slate-100" data-testid="enrollments-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_LIST.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-slate-900 border-slate-800 text-slate-100" data-testid="enrollments-category-filter"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48 bg-slate-900 border-slate-800 text-slate-100" data-testid="enrollments-course-filter"><SelectValue placeholder="Curso" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
            <SelectItem value="all">Todos os cursos</SelectItem>
            {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={originFilter} onValueChange={setOriginFilter}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-slate-100" data-testid="enrollments-origin-filter"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
            <SelectItem value="all">Todas as origens</SelectItem>
            {LEAD_SOURCES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="w-48 bg-slate-900 border-slate-800 text-slate-100" data-testid="enrollments-campaign-filter"><SelectValue placeholder="Campanha" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
            <SelectItem value="all">Todas as campanhas</SelectItem>
            {campaignNames.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <PeriodFilter
          preset={preset}
          custom={custom}
          onPresetChange={setPreset}
          onCustomChange={setCustom}
          presets={["todos", "hoje", "7dias", "30dias", "mes", "personalizado"]}
        />
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Nº</TableHead>
              <TableHead className="text-slate-400">Data</TableHead>
              <TableHead className="text-slate-400">Aluno</TableHead>
              <TableHead className="text-slate-400">Curso</TableHead>
              <TableHead className="text-slate-400">Categoria</TableHead>
              <TableHead className="text-slate-400">Valor</TableHead>
              <TableHead className="text-slate-400">Repasse</TableHead>
              <TableHead className="text-slate-400">Margem</TableHead>
              <TableHead className="text-slate-400">Origem</TableHead>
              <TableHead className="text-slate-400">Campanha</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow
                key={e.id}
                className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                onClick={() => navigate(`/matriculas/${e.id}`)}
                data-testid={`enrollment-row-${e.number}`}
              >
                <TableCell className="font-mono text-slate-300">{e.number}</TableCell>
                <TableCell className="text-slate-400">{formatDate(e.createdAt)}</TableCell>
                <TableCell className="text-slate-200">{studentOf(e.studentId)?.fullName}</TableCell>
                <TableCell className="text-slate-300">{courseOf(e.courseId)?.name}</TableCell>
                <TableCell className="text-slate-400">{courseOf(e.courseId)?.category}</TableCell>
                <TableCell className="text-slate-200">{formatCurrency(e.salePrice)}</TableCell>
                <TableCell className="text-amber-400">{formatCurrency(e.repasse)}</TableCell>
                <TableCell className="text-emerald-400">{formatCurrency(e.salePrice - e.repasse)}</TableCell>
                <TableCell className="text-slate-400">{e.origin}</TableCell>
                <TableCell className="text-slate-400">{e.campaign || "—"}</TableCell>
                <TableCell><StatusBadge status={e.status} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="border-slate-800">
                <TableCell colSpan={11} className="text-center text-slate-500 py-8">Nenhuma matrícula encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
