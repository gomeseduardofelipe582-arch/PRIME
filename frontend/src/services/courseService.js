import { readCollection, writeCollection, KEYS, ensureSeeded } from "@/lib/storage";

export async function listCourses() {
  ensureSeeded();
  return readCollection(KEYS.courses, []);
}

export async function getCourse(id) {
  const courses = await listCourses();
  return courses.find((c) => c.id === id) || null;
}

export async function updateCourse(id, patch) {
  const courses = await listCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  courses[idx] = { ...courses[idx], ...patch };
  writeCollection(KEYS.courses, courses);
  return courses[idx];
}
