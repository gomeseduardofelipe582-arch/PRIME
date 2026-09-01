import { NavLink } from "react-router-dom";
import { SquaresFour, PlusCircle, ClipboardText, Users, GraduationCap, Megaphone, ChartBar, SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { to: "/matriculas/nova", label: "Nova Matrícula", icon: PlusCircle },
  { to: "/matriculas", label: "Matrículas", icon: ClipboardText },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/cursos", label: "Cursos", icon: GraduationCap },
  { to: "/campanhas", label: "Campanhas", icon: Megaphone },
  { to: "/relatorios", label: "Relatórios", icon: ChartBar },
];

export function Sidebar({ onNavigate }) {
  const { logout } = useAuth();
  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white font-display">PE</div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-50 font-display">Prime Excelência</p>
          <p className="text-xs text-slate-500">Painel do Revendedor</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavigate}
            data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
              )
            }
          >
            <item.icon size={20} weight="duotone" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={logout}
          data-testid="sidebar-logout-button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/80 hover:text-rose-400 transition-colors"
        >
          <SignOut size={20} />
          Sair
        </button>
      </div>
    </div>
  );
}
