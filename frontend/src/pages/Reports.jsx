import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  CurrencyCircleDollar,
  HandCoins,
  TrendUp,
} from "@phosphor-icons/react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { PeriodFilter } from "@/components/shared/PeriodFilter";
import { KpiCard } from "@/components/shared/KpiCard";
import {
  dailySeries,
  filterByRange,
  getPeriodRange,
  sumField,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  fontSize: 12,
};

function buildRankings(filtered, courses, campaigns) {
  const courseMap = new Map();
  const campaignMap = new Map();
  const originMap = new Map();

  filtered.forEach((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    const courseName = course?.name || "Curso não identificado";
    const campaignName = enrollment.campaign || "Sem campanha";
    const campaign = campaigns.find((item) => item.name === campaignName);
    const origin = enrollment.origin || "Não informada";
    const revenue = Number(enrollment.salePrice) || 0;
    const repasse = Number(enrollment.repasse) || 0;
    const margin = revenue - repasse;

    addRankingRow(courseMap, courseName, {
      course: courseName,
      revenue,
      margin,
    });
    addRankingRow(campaignMap, campaignName, {
      campaign: campaignName,
      channel: campaign?.channel || "—",
      revenue,
      margin,
    });
    addRankingRow(originMap, origin, { origin, revenue, margin });
  });

  const sortRows = (rows) => rows.sort(
    (first, second) => (
      second.enrollments - first.enrollments || second.revenue - first.revenue
    )
  );

  return {
    courseRows: sortRows(Array.from(courseMap.values())),
    campaignRows: sortRows(Array.from(campaignMap.values())),
    originRows: sortRows(Array.from(originMap.values())),
  };
}

function addRankingRow(map, key, details) {
  const current = map.get(key) || {
    ...details,
    enrollments: 0,
    revenue: 0,
    margin: 0,
  };

  current.enrollments += 1;
  current.revenue += details.revenue;
  current.margin += details.margin;
  map.set(key, current);
}

export default function Reports() {
  const { enrollments, courses, campaigns, loading } = useData();
  const [preset, setPreset] = useState("30dias");
  const [custom, setCustom] = useState({ start: "", end: "" });

  const range = useMemo(
    () => getPeriodRange(preset, {
      start: custom.start ? new Date(custom.start) : null,
      end: custom.end ? new Date(custom.end) : null,
    }),
    [preset, custom]
  );
  const filtered = useMemo(() => filterByRange(enrollments, range), [enrollments, range]);

  const periodSeries = useMemo(() => dailySeries(filtered, range), [filtered, range]);
  const rankings = useMemo(
    () => buildRankings(filtered, courses, campaigns),
    [filtered, courses, campaigns]
  );

  const totalRevenue = sumField(filtered, "salePrice");
  const totalRepasse = sumField(filtered, "repasse");
  const totalMargin = totalRevenue - totalRepasse;
  const ticketAverage = filtered.length ? totalRevenue / filtered.length : 0;
  const bestCourse = rankings.courseRows[0];
  const bestCampaign = rankings.campaignRows[0];
  const bestOrigin = rankings.originRows[0];
  const highestMargin = [...rankings.courseRows].sort((first, second) => {
    return second.margin - first.margin;
  })[0];

  return (
    <div data-testid="reports-page">
      <PageHeader
        title="Relatórios"
        subtitle="Visão executiva dos resultados comerciais no período selecionado"
      />

      <div className="mb-6" data-testid="reports-period-filters">
        <PeriodFilter
          preset={preset}
          custom={custom}
          onPresetChange={setPreset}
          onCustomChange={setCustom}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KpiCard
          icon={CurrencyCircleDollar}
          label="Receita"
          value={formatCurrency(totalRevenue)}
          accent="emerald"
        />
        <KpiCard
          icon={HandCoins}
          label="Repasses"
          value={formatCurrency(totalRepasse)}
          accent="amber"
        />
        <KpiCard
          icon={TrendUp}
          label="Margem"
          value={formatCurrency(totalMargin)}
          accent="purple"
        />
        <KpiCard
          icon={CalendarCheck}
          label="Matrículas realizadas"
          value={filtered.length}
          accent="indigo"
        />
        <KpiCard
          icon={CurrencyCircleDollar}
          label="Ticket médio"
          value={formatCurrency(ticketAverage)}
          accent="emerald"
        />
      </div>

      <div className="mb-6">
        <ReportCard
          title="Evolução das matrículas"
          testId="report-enrollment-evolution-card"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={periodSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>

      <ReportCard
        title="Destaques do período"
        testId="report-period-highlights-card"
      >
        <div
          className={
            "grid grid-cols-1 divide-y divide-slate-800 sm:grid-cols-2 "
            + "sm:divide-y-0 sm:divide-x xl:grid-cols-5"
          }
        >
          <Highlight
            label="Curso mais vendido"
            value={bestCourse?.course || "Sem dados"}
            detail={bestCourse ? `${bestCourse.enrollments} matrículas` : ""}
            testId="report-highlight-top-course"
          />
          <Highlight
            label="Campanha com mais matrículas"
            value={bestCampaign?.campaign || "Sem dados"}
            detail={bestCampaign ? `${bestCampaign.enrollments} matrículas` : ""}
            testId="report-highlight-top-campaign"
          />
          <Highlight
            label="Principal origem dos leads"
            value={bestOrigin?.origin || "Sem dados"}
            detail={bestOrigin ? `${bestOrigin.enrollments} matrículas` : ""}
            testId="report-highlight-top-origin"
          />
          <Highlight
            label="Maior margem gerada"
            value={highestMargin ? formatCurrency(highestMargin.margin) : "Sem dados"}
            detail={highestMargin?.course || ""}
            testId="report-highlight-highest-margin"
          />
          <Highlight
            label="Ticket médio"
            value={formatCurrency(ticketAverage)}
            detail={filtered.length ? "por matrícula" : "Sem dados"}
            testId="report-highlight-average-ticket"
          />
        </div>
      </ReportCard>

      <div className="mt-6 space-y-4">
        <RankingTable
          title="Cursos mais vendidos"
          columns={["Curso", "Matrículas", "Receita", "Margem"]}
          rows={rankings.courseRows}
          loading={loading}
          testId="report-top-courses-table"
          renderRow={(row) => [
            row.course,
            row.enrollments,
            formatCurrency(row.revenue),
            formatCurrency(row.margin),
          ]}
        />
        <RankingTable
          title="Campanhas com melhor resultado"
          columns={["Campanha", "Canal", "Matrículas", "Receita", "Margem"]}
          rows={rankings.campaignRows}
          loading={loading}
          testId="report-top-campaigns-table"
          renderRow={(row) => [
            row.campaign,
            row.channel,
            row.enrollments,
            formatCurrency(row.revenue),
            formatCurrency(row.margin),
          ]}
        />
        <RankingTable
          title="Origem das vendas"
          columns={["Origem", "Matrículas", "Receita", "Margem"]}
          rows={rankings.originRows}
          loading={loading}
          testId="report-sales-origin-table"
          renderRow={(row) => [
            row.origin,
            row.enrollments,
            formatCurrency(row.revenue),
            formatCurrency(row.margin),
          ]}
        />
      </div>
    </div>
  );
}

function ReportCard({ title, testId, meta, children }) {
  return (
    <section
      className="rounded-lg border border-slate-800 bg-slate-900/50 p-6"
      data-testid={testId}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          {title}
        </h2>
        {meta && (
          <span
            className="rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-400"
            data-testid={`${testId}-meta`}
          >
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Highlight({ label, value, detail, testId }) {
  return (
    <div
      className="min-w-0 px-0 py-4 first:pt-0 last:pb-0 sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0"
      data-testid={testId}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-semibold text-slate-100" title={value}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
    </div>
  );
}

function RankingTable({ title, columns, rows, loading, renderRow, testId }) {
  const resultLabel = rows.length === 1 ? "resultado" : "resultados";
  const meta = loading
    ? "Atualizando dados"
    : `${rows.length} ${resultLabel} · Por matrículas`;

  return (
    <ReportCard title={title} testId={testId} meta={meta}>
      <div className="hidden sm:block">
        <table
          className="w-full text-left"
          data-testid={`${testId}-content`}
        >
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={`pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                    index > 0 ? "text-right" : ""
                  }`}
                  data-testid={`${testId}-header-${index}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <RankingTableSkeleton columns={columns} testId={testId} />}
            {!loading && rows.map((row, rowIndex) => (
              <tr
                key={row.course || row.campaign || row.origin}
                className="border-b border-slate-800/70 last:border-0"
                data-testid={`${testId}-row-${rowIndex}`}
              >
                {renderRow(row).map((value, valueIndex) => (
                  <td
                    key={`${rowIndex}-${valueIndex}`}
                    className={`py-3.5 text-sm ${
                      valueIndex === 0
                        ? "max-w-[300px] truncate font-medium text-slate-200"
                        : valueIndex === columns.length - 1
                          ? "text-right font-semibold text-emerald-400"
                        : "text-right text-slate-400"
                    }`}
                    data-testid={`${testId}-row-${rowIndex}-cell-${valueIndex}`}
                  >
                    {valueIndex === 0 ? (
                      <span className="flex items-center gap-3">
                        <span
                          className="w-6 shrink-0 font-mono text-xs text-slate-500"
                          data-testid={`${testId}-row-${rowIndex}-position`}
                        >
                          {String(rowIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate">{value}</span>
                      </span>
                    ) : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden" data-testid={`${testId}-mobile-content`}>
        {loading && <MobileRankingSkeleton columns={columns} testId={testId} />}
        {!loading && rows.map((row, rowIndex) => (
          <MobileRankingRow
            key={row.course || row.campaign || row.origin}
            columns={columns}
            values={renderRow(row)}
            rowIndex={rowIndex}
            testId={testId}
          />
        ))}
      </div>
      {!loading && rows.length === 0 && (
        <p
          className="py-3 text-sm text-slate-500"
          data-testid={`${testId}-empty-state`}
        >
          Sem dados no período selecionado.
        </p>
      )}
    </ReportCard>
  );
}

function MobileRankingRow({ columns, values, rowIndex, testId }) {
  const metrics = values.slice(1);
  const metricGrid = metrics.length === 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div
      className="border-b border-slate-800/70 py-4 first:pt-0 last:border-0 last:pb-0"
      data-testid={`${testId}-mobile-row-${rowIndex}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="w-6 shrink-0 font-mono text-xs text-slate-500"
          data-testid={`${testId}-mobile-row-${rowIndex}-position`}
        >
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
        <span
          className="truncate text-sm font-medium text-slate-200"
          data-testid={`${testId}-mobile-row-${rowIndex}-label`}
        >
          {values[0]}
        </span>
      </div>
      <div className={`mt-3 grid gap-3 ${metricGrid}`}>
        {metrics.map((value, metricIndex) => (
          <div
            key={columns[metricIndex + 1]}
            className="min-w-0"
            data-testid={`${testId}-mobile-row-${rowIndex}-metric-${metricIndex}`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {columns[metricIndex + 1]}
            </p>
            <p
              className={`mt-1 truncate text-xs font-semibold ${
                metricIndex === metrics.length - 1
                  ? "text-emerald-400"
                  : "text-slate-300"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingTableSkeleton({ columns, testId }) {
  return Array.from({ length: 3 }, (_, rowIndex) => (
    <tr
      key={`loading-${rowIndex}`}
      className="border-b border-slate-800/70 last:border-0"
      data-testid={`${testId}-loading-row-${rowIndex}`}
    >
      {columns.map((column, columnIndex) => (
        <td key={column} className="py-4">
          <div
            className={`h-3 animate-pulse rounded bg-slate-800/80 ${
              columnIndex === 0 ? "w-3/4" : "ml-auto w-12"
            }`}
          />
        </td>
      ))}
    </tr>
  ));
}

function MobileRankingSkeleton({ columns, testId }) {
  return Array.from({ length: 3 }, (_, rowIndex) => (
    <div
      key={`mobile-loading-${rowIndex}`}
      className="border-b border-slate-800/70 py-4 first:pt-0 last:border-0 last:pb-0"
      data-testid={`${testId}-mobile-loading-row-${rowIndex}`}
    >
      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/80" />
      <div className="mt-3 grid grid-cols-3 gap-3">
        {columns.slice(1).map((column) => (
          <div key={column} className="h-3 animate-pulse rounded bg-slate-800/80" />
        ))}
      </div>
    </div>
  ));
}
