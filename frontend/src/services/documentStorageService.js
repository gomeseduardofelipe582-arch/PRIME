import { requireSupabase, throwIfError } from "@/lib/supabase";

const BUCKET = "enrollment-documents";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function extensionFor(file) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png", "webp"].includes(fromName) ? fromName : null;
}

export async function uploadEnrollmentDocument({ enrollmentId, enrollmentDocumentId, file }) {
  if (!(file instanceof File)) throw new Error("Selecione um arquivo válido.");
  if (file.size > MAX_BYTES) throw new Error("O arquivo deve ter no máximo 10 MB.");
  if (!ALLOWED_MIME_TYPES.has(file.type) || !extensionFor(file)) throw new Error("Envie somente PDF, JPG, PNG ou WEBP.");
  const client = requireSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  throwIfError(authError);
  if (!user) throw new Error("Sessão expirada.");
  const extension = extensionFor(file);
  const path = `${user.id}/${enrollmentId}/${enrollmentDocumentId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  throwIfError(uploadError);
  const { error: rowError } = await client.from("enrollment_documents").update({
    status: "received", file_path: path, original_filename: file.name, mime_type: file.type, uploaded_at: new Date().toISOString(),
  }).eq("id", enrollmentDocumentId);
  throwIfError(rowError);
  return path;
}

export async function createEnrollmentDocumentSignedUrl(path) {
  const { data, error } = await requireSupabase().storage.from(BUCKET).createSignedUrl(path, 60);
  throwIfError(error);
  return data.signedUrl;
}
