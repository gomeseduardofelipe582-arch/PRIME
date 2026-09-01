import { readCollection, writeCollection, KEYS, ensureSeeded, generateId } from "@/lib/storage";

export async function listEnrollments() {
  ensureSeeded();
  return readCollection(KEYS.enrollments, []);
}

export async function getEnrollment(id) {
  const list = await listEnrollments();
  return list.find((e) => e.id === id) || null;
}

export async function createEnrollment(payload) {
  ensureSeeded();
  const students = readCollection(KEYS.students, []);
  const enrollments = readCollection(KEYS.enrollments, []);
  const campaigns = readCollection(KEYS.campaigns, []);

  let student = students.find((s) => s.cpf === payload.student.cpf);
  if (student) {
    const nonEmptyUpdates = Object.fromEntries(Object.entries(payload.student).filter(([, v]) => v !== "" && v != null));
    const idx = students.findIndex((s) => s.id === student.id);
    student = { ...student, ...nonEmptyUpdates };
    students[idx] = student;
  } else {
    student = { id: generateId("std"), notes: "", ...payload.student };
    students.push(student);
  }

  const campaignName = payload.commercial.campaign?.trim();
  if (campaignName && !campaigns.find((c) => c.name.toLowerCase() === campaignName.toLowerCase())) {
    campaigns.push({ id: generateId("cmp"), name: campaignName, channel: payload.commercial.origin });
  }

  const maxNumber = enrollments.reduce((max, e) => Math.max(max, Number(e.number) || 0), 0);
  const number = String(maxNumber + 1).padStart(6, "0");
  const enrollment = {
    id: generateId("enr"),
    number,
    createdAt: new Date().toISOString(),
    studentId: student.id,
    courseId: payload.courseId,
    salePrice: Number(payload.salePrice) || 0,
    repasse: Number(payload.repasse) || 0,
    origin: payload.commercial.origin,
    campaign: campaignName || "",
    notes: payload.commercial.notes || "",
    documents: payload.documents || {},
    extra: payload.extra || {},
    status: "novo_cadastro",
  };
  enrollments.push(enrollment);

  writeCollection(KEYS.students, students);
  writeCollection(KEYS.campaigns, campaigns);
  writeCollection(KEYS.enrollments, enrollments);
  return enrollment;
}

export async function updateStatus(id, status) {
  const enrollments = await listEnrollments();
  const idx = enrollments.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  enrollments[idx] = { ...enrollments[idx], status };
  writeCollection(KEYS.enrollments, enrollments);
  return enrollments[idx];
}

export async function updateDocuments(id, documents) {
  const enrollments = await listEnrollments();
  const idx = enrollments.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  enrollments[idx] = { ...enrollments[idx], documents };
  writeCollection(KEYS.enrollments, enrollments);
  return enrollments[idx];
}
