import { useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CurrencyCircleDollar, HandCoins, TrendUp } from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { KpiCard } from "@/components/shared/KpiCard";
import { getPeriodRange, filterByRange, sumField, groupCount, dailySeries } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#f43f5e", "#a855f7", "#10b981", "#eab308"];
const tooltipStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 };

export default function Reports() {
  const { enrollments, courses } = useData();
  const [preset, setPreset] = useState("30dias");
  const [custom, setCustom] = useState({ start: "", end: "" });

  const range = useMemo(
    () => getPeriodRange(preset, { start: custom.start ? new Date(custom.start) : null, end: custom.end ? new Date(custom.end) : null }),
    [preset, custom]
  );
  const filtered = useMemo(() => filterByRange(enrollments, range), [enrollments, range]);

  const periodSeries = useMemo(() => dailySeries(filtered, range), [filtered, range]);
  const byCourse = useMemo(
    () => groupCount(filtered, (e) => courses.find((c) => c.id === e.courseId)?.name || "—").sort((a, b) => b.value - a.value),
    [filtered, courses]
  );
  const byCategory = useMemo(() => groupCount(filtered, (e) => courses.find((c) => c.id === e.courseId)?.category || "Outro"), [filtered, courses]);
  const byCampaign = useMemo(() => groupCount(filtered, (e) => e.campaign || "Sem campanha").sort((a, b) => b.value - a.value).slice(0, 6), [filtered]);
  const byOrigin = useMemo(() => groupCount(filtered, (e) => e.origin), [filtered]);

  const totalRevenue = sumField(filtered, "salePrice");
  const totalRepasse = sumField(filtered, "repasse");
  const totalMargin = totalRevenue - totalRepasse;

  return (
    <div data-testid="reports-page">
      <PageHeader title="Relatórios" subtitle="Visão analítica das matrículas e resultados comerciais" />
      <div className="mb-6"><PeriodFilter preset={preset} custom={custom} onPresetChange={setPreset} onCustomChange={setCustom} /></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={CurrencyCircleDollar} label="Receita" value={formatCurrency(totalRevenue)} accent="emerald" />
        <KpiCard icon={HandCoins} label="Repasses" value={formatCurrency(totalRepasse)} accent="amber" />
        <KpiCard icon={TrendUp} label="Margem" value={formatCurrency(totalMargin)} accent="purple" />
      </div>

      <div className="mb-4">
        <ChartCard title="Matrículas por período">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={periodSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Matrículas por curso (mais vendidos)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byCourse} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-35} textAnchor="end" height={90} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Matrículas por categoria">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Matrículas por campanha">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCampaign} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={150} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Matrículas por origem">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byOrigin} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byOrigin.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6" data-testid={`report-card-${title}`}>
      <h3 className="text-sm font-semibold text-slate-200 mb-4">{title}</h3>
      {children}
    </div>
  );
}
