import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle,
  CurrencyCircleDollar,
  HandCoins,
  PlusCircle,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react";
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { MonthlyGoalCard } from "@/components/shared/MonthlyGoalCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { Button } from "@/components/ui/button";
import { getPeriodRange, filterByRange, sumField, groupCount, groupSum } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { getStatusAction } from "@/lib/enrollmentActions";

export default function Dashboard() {
  const { enrollments, courses, students, loading } = useData();
  const [preset, setPreset] = useState("30dias");
  const [custom, setCustom] = useState({ start: "", end: "" });

  const now = useMemo(() => new Date(), []);
  const todayCount = enrollments.filter((e) => isWithinInterval(new Date(e.createdAt), { start: startOfDay(now), end: endOfDay(now) })).length;
  const weekCount = enrollments.filter((e) =>
    isWithinInterval(new Date(e.createdAt), { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) })
  ).length;
  const monthEnrollments = enrollments.filter((e) => isWithinInterval(new Date(e.createdAt), { start: startOfMonth(now), end: endOfMonth(now) }));
  const monthCount = monthEnrollments.length;
  const monthRevenue = sumField(monthEnrollments, "salePrice");

  const range = useMemo(
    () => getPeriodRange(preset, { start: custom.start ? new Date(custom.start) : null, end: custom.end ? new Date(custom.end) : null }),
    [preset, custom]
  );
  const filtered = useMemo(() => filterByRange(enrollments, range), [enrollments, range]);

  const totalSold = sumField(filtered, "salePrice");
  const totalRepasse = sumField(filtered, "repasse");
  const totalMargin = totalSold - totalRepasse;

  const courseName = (id) => courses.find((c) => c.id === id)?.name || "—";
  const studentName = (id) => students.find((s) => s.id === id)?.fullName || "—";

  const topCourses = useMemo(() => {
    const grouped = groupCount(filtered, (e) => courses.find((c) => c.id === e.courseId)?.name || "—");
    return grouped.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filtered, courses]);

  const byOrigin = useMemo(() => groupCount(filtered, (e) => e.origin).sort((a, b) => b.value - a.value), [filtered]);
  const byCampaign = useMemo(
    () => groupSum(filtered, (e) => e.campaign || "Sem campanha", (e) => e.salePrice).sort((a, b) => b.value - a.value).slice(0, 5),
    [filtered]
  );

  const recent = useMemo(() => [...enrollments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [enrollments]);
  const attentionItems = useMemo(
    () => [...enrollments]
      .filter((enrollment) => getStatusAction(enrollment.status).attention)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3),
    [enrollments]
  );

  if (loading) return <div className="text-sm text-slate-400">Carregando painel...</div>;

  return (
    <div data-testid="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do desempenho comercial"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/relatorios">
              <Button variant="ghost" className="gap-2 text-slate-300 hover:bg-white/5 hover:text-white" data-testid="dashboard-reports-button">
                Ver relatórios <ArrowUpRight size={16} aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/matriculas/nova">
              <Button className="gap-2 bg-indigo-600 shadow-lg shadow-indigo-950/40 hover:bg-indigo-500" data-testid="dashboard-new-enrollment-button">
                <PlusCircle size={18} aria-hidden="true" /> Nova Matrícula
              </Button>
            </Link>
          </div>
        }
      />

      <SectionLabel eyebrow="Entender" title="Saúde do negócio" detail="Acompanhe o movimento comercial antes de agir." />
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
          <KpiCard icon={CalendarCheck} label="Matrículas hoje" value={todayCount} accent="indigo" hint="Entradas no dia" />
          <KpiCard icon={CalendarCheck} label="Matrículas esta semana" value={weekCount} accent="indigo" hint="Segunda a domingo" />
          <KpiCard icon={CalendarCheck} label="Matrículas este mês" value={monthCount} accent="indigo" hint={`${formatCurrency(monthRevenue)} vendidos`} />
        </div>
        <MonthlyGoalCard monthRevenue={monthRevenue} monthCount={monthCount} />
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <SectionLabel eyebrow="Decidir" title="Desempenho no período" detail="Compare resultados usando um recorte de tempo." />
        <PeriodFilter preset={preset} custom={custom} onPresetChange={setPreset} onCustomChange={setCustom} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={CurrencyCircleDollar} label="Total vendido" value={formatCurrency(totalSold)} accent="emerald" hint="Receita no período" />
        <KpiCard icon={HandCoins} label="Total de repasses" value={formatCurrency(totalRepasse)} accent="amber" hint="Compromisso com escolas" />
        <KpiCard icon={TrendUp} label="Margem bruta estimada" value={formatCurrency(totalMargin)} accent="purple" hint="Venda menos repasse" />
      </div>

      <SectionLabel eyebrow="Decidir" title="Onde concentrar atenção" detail="Identifique os cursos e canais que mais movimentam o resultado." />
      <div className="mb-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(2,6,23,0.12)] lg:col-span-2" data-testid="dashboard-top-courses-section">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Cursos mais vendidos</h3>
              <p className="mt-1 text-xs text-slate-400">Volume de matrículas no período selecionado.</p>
            </div>
            <Link to="/cursos" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">Ver cursos</Link>
          </div>
          <div className="space-y-4" data-testid="dashboard-top-courses">
            {topCourses.map((c, i) => {
              const max = topCourses[0]?.value || 1;
              return (
                <div key={c.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-slate-300">
                      <span className="mr-2 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>{c.name}
                    </span>
                    <span className="shrink-0 font-semibold text-slate-100">{c.value} {c.value === 1 ? "venda" : "vendas"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800/90" aria-label={`${c.name}: ${c.value} vendas`} role="img">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.round((c.value / max) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {topCourses.length === 0 && <p className="text-xs text-slate-500">Sem dados no período.</p>}
          </div>
        </section>

        <AttentionPanel items={attentionItems} studentName={studentName} courseName={courseName} />
      </div>

      <SectionLabel eyebrow="Decidir" title="Aquisição e campanhas" detail="Entenda de onde vêm as matrículas e o valor gerado." />
      <div className="mb-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <RankingList title="Vendas por origem" items={byOrigin} valueLabel={(item) => item.value} empty="Sem dados no período." />
        <RankingList title="Vendas por campanha" items={byCampaign} valueLabel={(item) => formatCurrency(item.value)} empty="Sem dados no período." />
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <SectionLabel eyebrow="Agir" title="Matrículas recentes" detail="Abra um registro para seguir o próximo passo." />
        <Link to="/matriculas" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">Ver todas as matrículas</Link>
      </div>
      <section className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 shadow-[0_12px_30px_rgba(2,6,23,0.12)] sm:p-5" data-testid="dashboard-recent-enrollments">
        <div className="space-y-1">
          {recent.map((e) => {
            const action = getStatusAction(e.status);
            return (
              <div key={e.id} className={`flex flex-col gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between ${action.attention ? "bg-amber-500/[0.04]" : ""}`} data-testid={`dashboard-recent-enrollment-${e.number}`}>
                <Link to={`/matriculas/${e.id}`} className="flex min-w-0 items-center gap-3 sm:gap-4" aria-label={`Abrir matrícula ${e.number}`}>
                  <span className="shrink-0 font-mono text-xs text-slate-500">Nº {e.number}</span>
                  <span className="truncate text-sm font-medium text-slate-100">{studentName(e.studentId)}</span>
                  <span className="hidden truncate text-xs text-slate-400 md:inline">{courseName(e.courseId)}</span>
                </Link>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{formatDate(e.createdAt)}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <Link to={`/matriculas/${e.id}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200" data-testid={`dashboard-recent-action-${e.number}`}>
                    {action.label} <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ eyebrow, title, detail }) {
  return (
    <div className="mb-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-indigo-300">{eyebrow}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function AttentionPanel({ items, studentName, courseName }) {
  return (
    <section className="rounded-xl border border-amber-300/20 bg-amber-500/[0.06] p-5 shadow-[0_12px_30px_rgba(2,6,23,0.12)]" data-testid="dashboard-attention-panel">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-300/20">
          <WarningCircle size={19} className="text-amber-200" weight="duotone" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Precisa de atenção</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">Pendências que podem avançar agora.</p>
        </div>
      </div>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => {
            const action = getStatusAction(item.status);
            return (
              <Link key={item.id} to={`/matriculas/${item.id}`} className="group block rounded-lg border border-amber-300/10 bg-slate-950/20 p-3 transition-colors hover:border-amber-300/25 hover:bg-slate-950/40" data-testid={`dashboard-attention-${item.number}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{studentName(item.studentId)}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{courseName(item.courseId)}</p>
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 text-amber-200 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-right text-[0.68rem] font-semibold text-amber-100">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-300/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
          <div className="flex items-center gap-2 font-semibold"><CheckCircle size={17} aria-hidden="true" /> Tudo em dia</div>
          <p className="mt-1 text-xs text-emerald-200/70">Nenhuma matrícula exige ação imediata.</p>
        </div>
      )}
    </section>
  );
}

function RankingList({ title, items, valueLabel, empty }) {
  return (
    <section className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(2,6,23,0.12)]">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-300">{item.name}</span>
            <span className="shrink-0 font-semibold text-slate-100">{valueLabel(item)}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-500">{empty}</p>}
      </div>
    </section>
  );
}
