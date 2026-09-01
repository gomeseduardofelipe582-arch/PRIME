import { seedCourses, seedStudents, seedEnrollments, seedCampaigns } from "@/data/seed";

export const KEYS = {
  courses: "crm_courses",
  students: "crm_students",
  enrollments: "crm_enrollments",
  campaigns: "crm_campaigns",
  seeded: "crm_seeded_v1",
};

export function readCollection(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function ensureSeeded() {
  if (localStorage.getItem(KEYS.seeded)) return;
  writeCollection(KEYS.courses, seedCourses);
  writeCollection(KEYS.students, seedStudents);
  writeCollection(KEYS.enrollments, seedEnrollments);
  writeCollection(KEYS.campaigns, seedCampaigns);
  localStorage.setItem(KEYS.seeded, "true");
}

export function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
