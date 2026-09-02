import { fromStudentRow, normalizeCpf, toStudentRow } from "@/lib/normalizers";
import { requireSupabase, throwIfError } from "@/lib/supabase";

export async function listStudents() {
  const { data, error } = await requireSupabase().from("students").select("*").order("full_name");
  throwIfError(error);
  return data.map(fromStudentRow);
}

export async function getStudent(id) {
  const { data, error } = await requireSupabase().from("students").select("*").eq("id", id).maybeSingle();
  throwIfError(error);
  return fromStudentRow(data);
}

export async function updateStudent(id, patch) {
  const row = patch.notes === undefined ? toStudentRow(patch) : { notes: patch.notes };
  const { data, error } = await requireSupabase().from("students").update(row).eq("id", id).select().single();
  throwIfError(error);
  return fromStudentRow(data);
}

export async function findStudentByCpf(cpf) {
  const normalized = normalizeCpf(cpf);
  if (normalized.length !== 11) return null;
  const { data, error } = await requireSupabase().from("students").select("*").eq("cpf_normalized", normalized).maybeSingle();
  throwIfError(error);
  return fromStudentRow(data);
}
