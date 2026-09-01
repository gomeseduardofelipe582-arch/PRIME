import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Funnel, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { STATUS_LIST, LEAD_SOURCES, CATEGORIES } from "@/constants/options";
import { getPeriodRange, filterByRange, sumField } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { getStatusAction } from "@/lib/enrollmentActions";

const PERIOD_LABELS = { todos: "Todos", hoje: "Hoje", "7dias": "7 dias", "30dias": "30 dias", mes: "Este mês", personalizado: "Personalizado" };

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
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const studentOf = useCallback((id) => students.find((s) => s.id === id), [students]);
  const courseOf = useCallback((id) => courses.find((c) => c.id === id), [courses]);

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
      const matchesSearch = !term || e.number.includes(term) || student?.fullName?.toLowerCase().includes(term) || student?.cpf?.includes(term) || student?.phone?.includes(term) || course?.name?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || course?.category === categoryFilter;
      const matchesOrigin = originFilter === "all" || e.origin === originFilter;
      const matchesCourse = courseFilter === "all" || e.courseId === courseFilter;
      const matchesCampaign = campaignFilter === "all" || e.campaign === campaignFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesOrigin && matchesCourse && matchesCampaign;
    });
  }, [enrollments, search, statusFilter, categoryFilter, originFilter, courseFilter, campaignFilter, preset, custom, studentOf, courseOf]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (search.trim()) chips.push({ key: "search", label: `Busca: ${search.trim()}`, clear: () => setSearch("") });
    if (statusFilter !== "all") chips.push({ key: "status", label: `Status: ${STATUS_LIST.find((item) => item.key === statusFilter)?.label || statusFilter}`, clear: () => setStatusFilter("all") });
    if (categoryFilter !== "all") chips.push({ key: "category", label: `Categoria: ${categoryFilter}`, clear: () => setCategoryFilter("all") });
    if (courseFilter !== "all") chips.push({ key: "course", label: `Curso: ${courseOf(courseFilter)?.name || courseFilter}`, clear: () => setCourseFilter("all") });
    if (originFilter !== "all") chips.push({ key: "origin", label: `Origem: ${originFilter}`, clear: () => setOriginFilter("all") });
    if (campaignFilter !== "all") chips.push({ key: "campaign", label: `Campanha: ${campaignFilter}`, clear: () => setCampaignFilter("all") });
    if (preset !== "todos") chips.push({ key: "period", label: `Período: ${PERIOD_LABELS[preset]}`, clear: () => { setPreset("todos"); setCustom({ start: "", end: "" }); } });
    return chips;
  }, [search, statusFilter, categoryFilter, courseFilter, originFilter, campaignFilter, preset, courseOf]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setOriginFilter("all");
    setCourseFilter("all");
    setCampaignFilter("all");
    setPreset("todos");
    setCustom({ start: "", end: "" });
  };

  const totalSold = sumField(filtered, "salePrice");
  const totalMargin = filtered.reduce((total, enrollment) => total + (Number(enrollment.salePrice) || 0) - (Number(enrollment.repasse) || 0), 0);
  const hasAdvancedFilters = statusFilter !== "all" || categoryFilter !== "all" || originFilter !== "all" || courseFilter !== "all" || campaignFilter !== "all";

  return (
    <div data-testid="enrollments-page">
      <PageHeader
        title="Matrículas"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "matrícula encontrada" : "matrículas encontradas"}`}
        action={
          <Link to="/matriculas/nova">
            <Button className="gap-2 bg-indigo-600 shadow-lg shadow-indigo-950/30 hover:bg-indigo-500" data-testid="enrollments-new-button">Nova matrícula <ArrowUpRight size={16} aria-hidden="true" /></Button>
          </Link>
        }
      />

      <section className="mb-4 rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 sm:p-4" data-testid="enrollments-filters-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-xl">
            <MagnifyingGlass size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <label className="sr-only" htmlFor="enrollments-search-input">Buscar matrículas</label>
            <Input id="enrollments-search-input" placeholder="Buscar por número, nome, CPF, telefone ou curso" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 border-slate-700 bg-slate-950/60 pl-10 text-slate-100 placeholder:text-slate-500" data-testid="enrollments-search-input" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" className={`h-10 gap-2 border border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700 ${advancedOpen || hasAdvancedFilters ? "border-indigo-400/40 text-indigo-100" : ""}`} onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen} data-testid="enrollments-advanced-filters-button">
              <Funnel size={16} aria-hidden="true" /> Filtros avançados {hasAdvancedFilters && <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[0.65rem] text-white">{activeFilterChips.filter((chip) => !["search", "period"].includes(chip.key)).length}</span>}
            </Button>
            {activeFilterChips.length > 0 && <Button type="button" variant="ghost" className="h-10 text-slate-400 hover:bg-white/5 hover:text-white" onClick={clearFilters} data-testid="enrollments-clear-filters-button">Limpar filtros</Button>}
          </div>
        </div>

        <div className="mt-3 border-t border-slate-800/80 pt-3">
          <PeriodFilter preset={preset} custom={custom} onPresetChange={setPreset} onCustomChange={setCustom} presets={["todos", "hoje", "7dias", "30dias", "mes", "personalizado"]} />
        </div>

        {advancedOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-2 xl:grid-cols-5" data-testid="enrollments-advanced-filters">
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} allLabel="Todos os status" options={STATUS_LIST.map((item) => ({ value: item.key, label: item.label }))} testId="enrollments-status-filter" />
            <FilterSelect label="Categoria" value={categoryFilter} onChange={setCategoryFilter} allLabel="Todas as categorias" options={CATEGORIES.map((item) => ({ value: item, label: item }))} testId="enrollments-category-filter" />
            <FilterSelect label="Curso" value={courseFilter} onChange={setCourseFilter} allLabel="Todos os cursos" options={courses.map((item) => ({ value: item.id, label: item.name }))} testId="enrollments-course-filter" />
            <FilterSelect label="Origem" value={originFilter} onChange={setOriginFilter} allLabel="Todas as origens" options={LEAD_SOURCES.map((item) => ({ value: item, label: item }))} testId="enrollments-origin-filter" />
            <FilterSelect label="Campanha" value={campaignFilter} onChange={setCampaignFilter} allLabel="Todas as campanhas" options={campaignNames.map((item) => ({ value: item, label: item }))} testId="enrollments-campaign-filter" />
          </div>
        )}

        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros ativos" data-testid="enrollments-active-filters">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Ativos</span>
            {activeFilterChips.map((chip) => (
              <button key={chip.key} type="button" onClick={chip.clear} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-100 transition-colors hover:border-indigo-300/40 hover:bg-indigo-500/20" data-testid={`enrollments-filter-chip-${chip.key}`}>
                <span className="truncate">{chip.label}</span><X size={13} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Resumo dos resultados filtrados" data-testid="enrollments-result-summary">
        <SummaryMetric label="Resultados" value={filtered.length} />
        <SummaryMetric label="Total vendido" value={formatCurrency(totalSold)} accent="text-emerald-300" />
        <SummaryMetric label="Margem do resultado" value={formatCurrency(totalMargin)} accent="text-purple-300" />
      </section>

      <div className="overflow-hidden rounded-xl border border-slate-800/90 bg-slate-900/70 shadow-[0_12px_30px_rgba(2,6,23,0.12)]">
        <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                {["Nº", "Data", "Aluno", "Curso", "Categoria", "Valor", "Repasse", "Margem", "Origem", "Campanha", "Status", "Ação"].map((heading, index) => <TableHead key={heading} className={`whitespace-nowrap text-slate-400 ${index > 4 ? "text-right" : ""}`}>{heading}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => {
                const action = getStatusAction(e.status);
                return (
                  <TableRow key={e.id} tabIndex="0" className={`cursor-pointer border-slate-800 hover:bg-slate-800/50 focus-visible:bg-slate-800/50 ${action.attention ? "bg-amber-500/[0.035]" : ""}`} onClick={() => navigate(`/matriculas/${e.id}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate(`/matriculas/${e.id}`); }} data-testid={`enrollment-row-${e.number}`}>
                    <TableCell className="font-mono text-slate-300">{e.number}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-400">{formatDate(e.createdAt)}</TableCell>
                    <TableCell className="min-w-[150px] font-medium text-slate-100">{studentOf(e.studentId)?.fullName}</TableCell>
                    <TableCell className="min-w-[180px] text-slate-300">{courseOf(e.courseId)?.name}</TableCell>
                    <TableCell className="text-slate-400">{courseOf(e.courseId)?.category}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-slate-200">{formatCurrency(e.salePrice)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-amber-300">{formatCurrency(e.repasse)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold text-emerald-300">{formatCurrency(e.salePrice - e.repasse)}</TableCell>
                    <TableCell className="text-slate-400">{e.origin}</TableCell>
                    <TableCell className="max-w-[150px] text-slate-400"><span className="block truncate">{e.campaign || "—"}</span></TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
                    <TableCell className="text-right"><Link to={`/matriculas/${e.id}`} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-300 hover:text-indigo-200" data-testid={`enrollment-action-${e.number}`}>{action.label} <ArrowUpRight size={14} aria-hidden="true" /></Link></TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow className="border-slate-800"><TableCell colSpan={12} className="py-12 text-center text-sm text-slate-500">Nenhuma matrícula encontrada. Tente remover alguns filtros.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y divide-slate-800/80 sm:hidden" data-testid="enrollments-mobile-list">
          {filtered.map((e) => <EnrollmentMobileCard key={e.id} enrollment={e} student={studentOf(e.studentId)} course={courseOf(e.courseId)} navigate={navigate} />)}
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-500">Nenhuma matrícula encontrada. Tente remover alguns filtros.</p>}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, allLabel, options, testId }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full border-slate-700 bg-slate-950/60 text-slate-100" data-testid={testId}><SelectValue placeholder={allLabel} /></SelectTrigger>
        <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function SummaryMetric({ label, value, accent = "text-slate-100" }) {
  return <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 px-4 py-3"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className={`mt-1 text-lg font-bold font-display ${accent}`}>{value}</p></div>;
}

function EnrollmentMobileCard({ enrollment, student, course, navigate }) {
  const action = getStatusAction(enrollment.status);
  return (
    <article className={`p-4 ${action.attention ? "bg-amber-500/[0.035]" : ""}`} data-testid={`enrollment-mobile-card-${enrollment.number}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-slate-500">Nº {enrollment.number} · {formatDate(enrollment.createdAt)}</p>
          <h3 className="mt-1 truncate text-sm font-semibold text-slate-100">{student?.fullName}</h3>
          <p className="mt-1 truncate text-xs text-slate-400">{course?.name}</p>
        </div>
        <StatusBadge status={enrollment.status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-800/70 bg-slate-950/20 p-3">
        <div><p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Valor</p><p className="mt-1 text-xs font-semibold text-slate-200">{formatCurrency(enrollment.salePrice)}</p></div>
        <div><p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Repasse</p><p className="mt-1 text-xs font-semibold text-amber-300">{formatCurrency(enrollment.repasse)}</p></div>
        <div><p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Margem</p><p className="mt-1 text-xs font-semibold text-emerald-300">{formatCurrency(enrollment.salePrice - enrollment.repasse)}</p></div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="truncate text-xs text-slate-500">{enrollment.origin}{enrollment.campaign ? ` · ${enrollment.campaign}` : ""}</span>
        <Link to={`/matriculas/${enrollment.id}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200" data-testid={`enrollment-mobile-action-${enrollment.number}`}>{action.label} <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
