import { STATUS_LIST } from "@/constants/options";

export function StatusBadge({ status }) {
  const s = STATUS_LIST.find((item) => item.key === status) || STATUS_LIST[0];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${s.badge}`} data-testid={`status-badge-${status}`}>
      {s.label}
    </span>
  );
}
