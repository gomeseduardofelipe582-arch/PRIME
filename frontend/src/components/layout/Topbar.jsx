import { List } from "@phosphor-icons/react";

export function Topbar({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800/90 bg-slate-900/80 px-4 py-3 lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold text-white font-display shadow-lg shadow-indigo-950/30">PE</div>
        <span className="truncate text-sm font-semibold text-slate-100 font-display">Prime Excelência</span>
      </div>
      <button type="button" onClick={onMenuClick} aria-label="Abrir menu de navegação" data-testid="topbar-menu-button" className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80">
        <List size={22} aria-hidden="true" />
      </button>
    </header>
  );
}
