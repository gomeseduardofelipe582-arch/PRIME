import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CurrencyCircleDollar, HandCoins, TrendUp, PlusCircle } from "@phosphor-icons/react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays } from "date-fns";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { Button } from "@/components/ui/button";
import { getPeriodRange, filterByRange, sumField, groupCount, groupSum } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";

const tooltipStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 };

export default function Dashboard() {
  const { enrollments, courses, students, loading } = useData();
  const [preset, setPreset] = useState("30dias");
  const [custom, setCustom] = useState({ start: "", end: "" });

  const now = useMemo(() => new Date(), []);
  const todayCount = enrollments.filter((e) => isWithinInterval(new Date(e.createdAt), { start: startOfDay(now), end: endOfDay(now) })).length;
  const weekCount = enrollments.filter((e) =>
    isWithinInterval(new Date(e.createdAt), { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) })
  ).length;
  const monthCount = enrollments.filter((e) => isWithinInterval(new Date(e.createdAt), { start: startOfMonth(now), end: endOfMonth(now) })).length;

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

  const evolution = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const day = subDays(now, i);
      const count = enrollments.filter((e) => format(new Date(e.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length;
      days.push({ name: format(day, "dd/MM"), matriculas: count });
    }
    return days;
  }, [enrollments, now]);

  const recent = useMemo(() => [...enrollments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [enrollments]);

  if (loading) return <div className="text-slate-400 text-sm">Carregando...</div>;

  return (
    <div data-testid="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do desempenho comercial"
        action={
          <Link to="/matriculas/nova">
            <Button className="bg-indigo-600 hover:bg-indigo-500 gap-2" data-testid="dashboard-new-enrollment-button">
              <PlusCircle size={18} /> Nova Matrícula
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={CalendarCheck} label="Matrículas hoje" value={todayCount} accent="indigo" />
        <KpiCard icon={CalendarCheck} label="Matrículas esta semana" value={weekCount} accent="indigo" />
        <KpiCard icon={CalendarCheck} label="Matrículas este mês" value={monthCount} accent="indigo" />
      </div>

      <div className="mb-4">
        <PeriodFilter preset={preset} custom={custom} onPresetChange={setPreset} onCustomChange={setCustom} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={CurrencyCircleDollar} label="Total vendido" value={formatCurrency(totalSold)} accent="emerald" />
        <KpiCard icon={HandCoins} label="Total de repasses" value={formatCurrency(totalRepasse)} accent="amber" />
        <KpiCard icon={TrendUp} label="Margem bruta estimada" value={formatCurrency(totalMargin)} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Evolução das matrículas (14 dias)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="matriculas" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Vendas por origem</h3>
          <div className="space-y-3">
            {byOrigin.map((o) => (
              <div key={o.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{o.name}</span>
                <span className="text-slate-400 font-semibold">{o.value}</span>
              </div>
            ))}
            {byOrigin.length === 0 && <p className="text-xs text-slate-500">Sem dados no período.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Cursos mais vendidos</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topCourses} layout="vertical" margin={{ left: 20, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={150} tick={{ width: 140 }} interval={0} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Vendas por campanha</h3>
          <div className="space-y-3">
            {byCampaign.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate mr-2">{c.name}</span>
                <span className="text-slate-400 font-semibold shrink-0">{formatCurrency(c.value)}</span>
              </div>
            ))}
            {byCampaign.length === 0 && <p className="text-xs text-slate-500">Sem dados no período.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Matrículas recentes</h3>
        <div className="space-y-2">
          {recent.map((e) => (
            <Link
              key={e.id}
              to={`/matriculas/${e.id}`}
              className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-slate-800/60 transition-colors"
              data-testid={`dashboard-recent-enrollment-${e.number}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs text-slate-500 font-mono shrink-0">Nº {e.number}</span>
                <span className="text-sm text-slate-200 truncate">{studentName(e.studentId)}</span>
                <span className="text-xs text-slate-500 truncate hidden sm:inline">{courseName(e.courseId)}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500">{formatDate(e.createdAt)}</span>
                <StatusBadge status={e.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
