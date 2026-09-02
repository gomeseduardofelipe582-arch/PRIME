import { formatEnrollmentNumber, toStudentRow } from "@/lib/normalizers";
import { requireSupabase, throwIfError } from "@/lib/supabase";
import { getCourse } from "@/services/courseService";
import { getLeadSourceByName } from "@/services/sourceService";

const enrollmentSelect = "*, students(*), courses(*, course_categories(name), course_required_fields(*), course_required_documents(*)), campaigns(*), lead_sources(*), enrollment_documents(*, course_required_documents(*))";

function mapEnrollment(row) {
  const documentRecords = (row.enrollment_documents || []).map((item) => ({
    id: item.id, requiredDocumentId: item.course_required_document_id,
    label: item.course_required_documents?.label || "Documento", status: item.status,
    filePath: item.file_path, originalFilename: item.original_filename, mimeType: item.mime_type,
  }));
  return {
    id: row.id, number: formatEnrollmentNumber(row.enrollment_number), rawNumber: row.enrollment_number,
    createdAt: row.created_at, updatedAt: row.updated_at, studentId: row.student_id, courseId: row.course_id,
    campaignId: row.campaign_id, leadSourceId: row.lead_source_id, status: row.status,
    salePrice: Number(row.sale_price), suggestedPrice: row.suggested_price_snapshot == null ? null : Number(row.suggested_price_snapshot),
    repasse: row.repass_amount_snapshot == null ? null : Number(row.repass_amount_snapshot),
    origin: row.lead_sources?.name || "Não informada", campaign: row.campaigns?.name || "",
    notes: row.internal_notes || "", extra: row.extra_data || {}, sentToSchoolAt: row.sent_to_school_at,
    documents: Object.fromEntries(documentRecords.map((item) => [item.label, item.status === "received"])), documentRecords,
  };
}

export async function listEnrollments() {
  const { data, error } = await requireSupabase().from("enrollments").select(enrollmentSelect).order("created_at", { ascending: false });
  throwIfError(error);
  return data.map(mapEnrollment);
}

export async function getEnrollment(id) {
  const { data, error } = await requireSupabase().from("enrollments").select(enrollmentSelect).eq("id", id).maybeSingle();
  throwIfError(error);
  return data ? mapEnrollment(data) : null;
}

export async function createEnrollment(payload) {
  const [course, source] = await Promise.all([getCourse(payload.courseId), getLeadSourceByName(payload.commercial.origin)]);
  if (!course) throw new Error("Curso não encontrado ou inativo.");
  if (!source) throw new Error("Origem de lead não encontrada. Atualize a página e tente novamente.");
  const documentStatuses = Object.fromEntries(course.requiredDocumentRecords.map((document) => [document.id, Boolean(payload.documents?.[document.label])]));
  const { data, error } = await requireSupabase().rpc("create_enrollment_with_documents", {
    p_student: toStudentRow(payload.student), p_course_id: payload.courseId, p_sale_price: Number(payload.salePrice) || 0,
    p_lead_source_id: source.id, p_campaign_name: payload.commercial.campaign || null,
    p_extra_data: payload.extra || {}, p_internal_notes: payload.commercial.notes || "",
    p_document_statuses: documentStatuses, p_update_existing_student: Boolean(payload.updateExistingStudent),
  });
  throwIfError(error);
  return { id: data.id, number: formatEnrollmentNumber(data.enrollment_number) };
}

export async function updateStatus(id, status) {
  const patch = { status };
  if (status === "matricula_confirmada") patch.confirmed_at = new Date().toISOString();
  if (status === "cancelada") patch.cancelled_at = new Date().toISOString();
  const { error } = await requireSupabase().from("enrollments").update(patch).eq("id", id);
  throwIfError(error);
}

export async function updateDocuments(id, documents, documentRecords) {
  const client = requireSupabase();
  const updates = (documentRecords || []).map((document) => ({
    id: document.id, status: documents?.[document.label] ? "received" : "pending",
  }));
  for (const update of updates) {
    const { error } = await client.from("enrollment_documents").update({ status: update.status }).eq("id", update.id);
    throwIfError(error);
  }
}
