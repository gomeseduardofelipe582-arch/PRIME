import { SquaresFour, PlusCircle, ClipboardText, Users, GraduationCap, Megaphone, ChartBar, SignOut } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Operação",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: SquaresFour },
      { to: "/matriculas/nova", label: "Nova Matrícula", icon: PlusCircle },
      { to: "/matriculas", label: "Matrículas", icon: ClipboardText },
      { to: "/alunos", label: "Alunos", icon: Users },
    ],
  },
  {
    label: "Catálogo e análise",
    items: [
      { to: "/cursos", label: "Cursos", icon: GraduationCap },
      { to: "/campanhas", label: "Campanhas", icon: Megaphone },
      { to: "/relatorios", label: "Relatórios", icon: ChartBar },
    ],
  },
];

export function Sidebar({ onNavigate }) {
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800/90 bg-slate-900/95" aria-label="Navegação principal">
      <div className="flex items-center gap-3 border-b border-slate-800/90 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white font-display shadow-lg shadow-indigo-950/40">PE</div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-slate-50 font-display">Prime Excelência</p>
          <p className="mt-1 text-xs text-slate-500">Painel do Revendedor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={onNavigate}
                  data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={({ isActive }) => cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80",
                    isActive
                      ? "bg-indigo-500/15 text-indigo-100 shadow-[inset_3px_0_0_#818cf8]"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100",
                  )}
                >
                  <item.icon size={19} weight="duotone" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800/90 p-3">
        <button onClick={logout} data-testid="sidebar-logout-button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70">
          <SignOut size={19} aria-hidden="true" />
          Sair
        </button>
      </div>
    </aside>
  );
}
