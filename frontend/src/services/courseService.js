import { requireSupabase, throwIfError } from "@/lib/supabase";

function parsePositiveInteger(value, label, suffixPattern) {
  const text = String(value ?? "").trim();
  if (!text || text === "Não informado") return null;
  const match = text.match(suffixPattern);
  if (!match || Number(match[1]) < 1) {
    throw new Error(`${label} deve ser um número positivo no formato esperado.`);
  }
  return Number(match[1]);
}

function parseDeadline(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "Não informado") return { minimum_completion_days: null, maximum_completion_days: null };
  const match = text.match(/^(\d+)(?:\s*a\s*(\d+))?\s*dias?$/i);
  if (!match || Number(match[1]) < 1 || (match[2] && Number(match[2]) < Number(match[1]))) {
    throw new Error("Prazo deve usar o formato “X dia(s)” ou “X a Y dias”.");
  }
  const minimum = Number(match[1]);
  return { minimum_completion_days: minimum, maximum_completion_days: match[2] ? Number(match[2]) : minimum };
}

function mapCourse(row) {
  const fields = [...(row.course_required_fields || [])].filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order).map((item) => ({
    id: item.id, key: item.field_key, label: item.label, type: item.field_type, required: item.required,
    placeholder: item.placeholder, helpText: item.help_text, options: item.options || [],
  }));
  const documents = [...(row.course_required_documents || [])].filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order).map((item) => ({
    id: item.id, key: item.document_key, label: item.label, required: item.required, instructions: item.instructions,
  }));
  const min = row.minimum_completion_days;
  const max = row.maximum_completion_days;
  return {
    id: row.id, name: row.name, slug: row.slug, category: row.course_categories?.name || "Sem categoria",
    description: row.description || "", durationHours: row.workload_hours ? `${row.workload_hours}h` : "Não informado",
    deadline: min == null ? "Não informado" : max && max !== min ? `${min} a ${max} dias` : `${min} dia${min === 1 ? "" : "s"}`,
    requirements: row.requirements_text || "Não informado", importantInfo: row.important_notes || "",
    validityDescription: row.validity_description, repasse: row.repass_amount == null ? null : Number(row.repass_amount),
    suggestedPrice: row.suggested_price == null ? null : Number(row.suggested_price),
    extraStudentFields: fields, requiredDocumentRecords: documents, requiredDocuments: documents.map((item) => item.label),
  };
}

export async function listCourses() {
  const { data, error } = await requireSupabase().from("courses").select("*, course_categories(name), course_required_fields(*), course_required_documents(*)").eq("active", true).order("name");
  throwIfError(error);
  return data.map(mapCourse);
}

export async function getCourse(id) {
  const { data, error } = await requireSupabase().from("courses").select("*, course_categories(name), course_required_fields(*), course_required_documents(*)").eq("id", id).maybeSingle();
  throwIfError(error);
  return data ? mapCourse(data) : null;
}

export async function updateCourse(id, patch) {
  const workload = patch.durationHours === undefined
    ? {}
    : { workload_hours: parsePositiveInteger(patch.durationHours, "Carga horária", /^(\d+)\s*h?$/i) };
  const deadline = patch.deadline === undefined ? {} : parseDeadline(patch.deadline);
  const row = {
    ...(patch.name !== undefined && { name: String(patch.name).trim() }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.requirements !== undefined && { requirements_text: patch.requirements }),
    ...(patch.importantInfo !== undefined && { important_notes: patch.importantInfo }),
    ...(patch.repasse !== undefined && { repass_amount: patch.repasse }),
    ...(patch.suggestedPrice !== undefined && { suggested_price: patch.suggestedPrice }),
    ...(patch.active !== undefined && { active: patch.active }),
    ...workload,
    ...deadline,
  };
  if (patch.name !== undefined && !row.name) throw new Error("Nome do curso é obrigatório.");
  const { data, error } = await requireSupabase().from("courses").update(row).eq("id", id).select("*, course_categories(name), course_required_fields(*), course_required_documents(*)").single();
  throwIfError(error);
  return mapCourse(data);
}
