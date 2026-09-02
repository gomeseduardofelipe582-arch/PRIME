import { formatDate, formatTime } from "@/lib/format";

export const SCHOOL_WHATSAPP = "5548996726611";

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function formatAddress(student) {
  const street = [student?.address, student?.number].filter(hasValue).join(", ");
  const neighborhood = hasValue(student?.neighborhood) ? student.neighborhood : "";
  const cityState = [student?.city, student?.state].filter(hasValue).join(" - ");
  const zip = hasValue(student?.zip) ? `CEP ${student.zip}` : "";
  return [street, neighborhood, cityState, zip].filter(Boolean).join(" · ");
}

function isEjaCourse(course) {
  return course?.category === "EJA" || /\beja\b/i.test(course?.name || "");
}

export function getSchoolAdditionalLines(enrollment, student, course) {
  const lines = [];

  if (isEjaCourse(course)) {
    if (hasValue(student?.birthDate)) lines.push(`Data de nascimento: ${formatDate(student.birthDate)}`);
    if (hasValue(student?.address) || hasValue(student?.city) || hasValue(student?.state)) lines.push(`Endereço completo: ${formatAddress(student)}`);
  }

  (course?.extraStudentFields || []).forEach((field) => {
    const value = enrollment?.extra?.[field.key];
    if (hasValue(value)) lines.push(`${field.label}: ${value}`);
  });

  return lines;
}

export function getSchoolDocumentStatus(enrollment, course) {
  const documents = course?.requiredDocuments || [];
  const received = documents.filter((document) => Boolean(enrollment?.documents?.[document]));
  const pending = documents.filter((document) => !enrollment?.documents?.[document]);
  return {
    documents,
    received,
    pending,
    complete: documents.length > 0 && pending.length === 0,
  };
}

export function hasPendingSchoolDocuments(enrollment, course) {
  return getSchoolDocumentStatus(enrollment, course).pending.length > 0;
}

export function generateSchoolEnrollmentReport(enrollment, student, course) {
  const lines = [];
  const additionalLines = getSchoolAdditionalLines(enrollment, student, course);
  const documentStatus = getSchoolDocumentStatus(enrollment, course);

  lines.push("*MATRÍCULA PRIME*");
  lines.push(`Matrícula nº ${enrollment?.number || "—"}`);
  lines.push(`Data: ${formatDate(enrollment?.createdAt)}`);
  lines.push(`Horário: ${formatTime(enrollment?.createdAt)}`);
  lines.push("");
  lines.push("*CURSO*");
  lines.push(`Nome do curso: ${course?.name || "—"}`);
  lines.push(`Categoria: ${course?.category || "—"}`);
  lines.push("");
  lines.push("*DADOS DO ALUNO*");
  lines.push(`Nome completo: ${student?.fullName || "—"}`);
  lines.push(`CPF: ${student?.cpf || "—"}`);
  lines.push(`Telefone: ${student?.phone || "—"}`);
  lines.push(`E-mail: ${student?.email || "—"}`);

  if (additionalLines.length) {
    lines.push("");
    lines.push("*INFORMAÇÕES ADICIONAIS*");
    lines.push(...additionalLines);
  }

  lines.push("");
  lines.push("*DOCUMENTAÇÃO*");
  if (documentStatus.documents.length) {
    documentStatus.documents.forEach((document) => {
      lines.push(`${enrollment?.documents?.[document] ? "✅" : "⏳"} ${document} — ${enrollment?.documents?.[document] ? "Recebido" : "Pendente"}`);
    });
    lines.push("");
    lines.push(documentStatus.complete ? "Documentação completa" : "Documentação pendente");
  } else {
    lines.push("Nenhum documento configurado para este curso.");
  }

  return lines.join("\n");
}

export function buildSummaryText(enrollment, student, course) {
  return generateSchoolEnrollmentReport(enrollment, student, course);
}

export function buildSchoolWhatsAppUrl(enrollment, student, course, schoolWhatsapp = SCHOOL_WHATSAPP) {
  const message = generateSchoolEnrollmentReport(enrollment, student, course);
  return `https://wa.me/${schoolWhatsapp || SCHOOL_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function openSchoolWhatsApp(enrollment, student, course, schoolWhatsapp = SCHOOL_WHATSAPP) {
  const url = buildSchoolWhatsAppUrl(enrollment, student, course, schoolWhatsapp);
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  return url;
}
