import { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

export default function Campaigns() {
  const { enrollments, campaigns } = useData();

  const rows = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      const name = e.campaign || "Sem campanha";
      if (!map.has(name)) map.set(name, { name, count: 0, revenue: 0, margin: 0 });
      const row = map.get(name);
      row.count += 1;
      row.revenue += e.salePrice;
      row.margin += e.salePrice - e.repasse;
    });
    return Array.from(map.values())
      .map((row) => ({ ...row, channel: campaigns.find((c) => c.name === row.name)?.channel || "—" }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [enrollments, campaigns]);

  return (
    <div data-testid="campaigns-page">
      <PageHeader title="Campanhas" subtitle="Desempenho das campanhas de aquisição" />
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Campanha</TableHead>
              <TableHead className="text-slate-400">Canal</TableHead>
              <TableHead className="text-slate-400">Matrículas</TableHead>
              <TableHead className="text-slate-400">Receita</TableHead>
              <TableHead className="text-slate-400">Margem gerada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name} className="border-slate-800 hover:bg-slate-800/50" data-testid={`campaign-row-${r.name}`}>
                <TableCell className="text-slate-200 font-medium">{r.name}</TableCell>
                <TableCell className="text-slate-400">{r.channel}</TableCell>
                <TableCell className="text-slate-300">{r.count}</TableCell>
                <TableCell className="text-slate-200">{formatCurrency(r.revenue)}</TableCell>
                <TableCell className="text-emerald-400">{formatCurrency(r.margin)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
