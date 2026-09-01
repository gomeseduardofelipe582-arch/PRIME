import { List } from "@phosphor-icons/react";

export function Topbar({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white font-display">PE</div>
        <span className="text-sm font-semibold text-slate-100 font-display">Prime Excelência</span>
      </div>
      <button onClick={onMenuClick} data-testid="topbar-menu-button" className="text-slate-300 p-2">
        <List size={24} />
      </button>
    </header>
  );
}
