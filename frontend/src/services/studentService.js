import { readCollection, writeCollection, KEYS, ensureSeeded } from "@/lib/storage";

export async function listStudents() {
  ensureSeeded();
  return readCollection(KEYS.students, []);
}

export async function getStudent(id) {
  const students = await listStudents();
  return students.find((s) => s.id === id) || null;
}

export async function updateStudent(id, patch) {
  const students = await listStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...patch };
  writeCollection(KEYS.students, students);
  return students[idx];
}
