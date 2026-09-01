import { formatDate, formatTime } from "@/lib/format";

export function buildSummaryText(enrollment, student, course) {
  const lines = [];
  lines.push(`*MATRÍCULA Nº ${enrollment.number}*`);
  lines.push(`Data: ${formatDate(enrollment.createdAt)} | Horário: ${formatTime(enrollment.createdAt)}`);
  lines.push("");
  lines.push("*CURSO*");
  lines.push(course?.name || "-");
  lines.push("");
  lines.push("*DADOS DO ALUNO*");
  lines.push(`Nome: ${student?.fullName || "-"}`);
  lines.push(`CPF: ${student?.cpf || "-"}`);
  lines.push(`Telefone: ${student?.phone || "-"}`);
  lines.push(`E-mail: ${student?.email || "-"}`);

  const extraEntries = (course?.extraStudentFields || []).filter((f) => enrollment.extra?.[f.key]);
  if (extraEntries.length > 0) {
    lines.push("");
    lines.push("*INFORMAÇÕES ADICIONAIS*");
    extraEntries.forEach((f) => lines.push(`${f.label}: ${enrollment.extra[f.key]}`));
  }

  lines.push("");
  lines.push("*DOCUMENTAÇÃO*");
  const docs = course?.requiredDocuments || [];
  docs.forEach((doc) => lines.push(`${enrollment.documents?.[doc] ? "✅" : "⏳"} ${doc}`));
  const complete = docs.length > 0 && docs.every((doc) => enrollment.documents?.[doc]);
  lines.push("");
  lines.push(complete ? "Documentação completa" : "Documentação pendente");

  return lines.join("\n");
}
