import { format } from "date-fns";

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}

export function formatDate(iso) {
  if (!iso) return "—";
  return format(new Date(iso), "dd/MM/yyyy");
}

export function formatTime(iso) {
  if (!iso) return "—";
  return format(new Date(iso), "HH:mm");
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm");
}

export function maskCPF(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{4})$/, "$1-$2");
}

export function maskCEP(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}
