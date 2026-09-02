export function normalizeCpf(value = "") {
  return String(value).replace(/\D/g, "");
}

export function toStudentRow(student) {
  return {
    full_name: student.fullName?.trim(),
    cpf: normalizeCpf(student.cpf),
    birth_date: student.birthDate || null,
    phone: student.phone?.trim() || null,
    email: student.email?.trim() || null,
    address: student.address?.trim() || null,
    address_number: student.number?.trim() || null,
    address_complement: student.complement?.trim() || null,
    neighborhood: student.neighborhood?.trim() || null,
    city: student.city?.trim() || null,
    state: student.state?.trim().toUpperCase() || null,
    cep: student.zip?.trim() || null,
  };
}

export function fromStudentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    cpf: row.cpf,
    birthDate: row.birth_date,
    phone: row.phone,
    email: row.email,
    address: row.address,
    number: row.address_number,
    complement: row.address_complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    zip: row.cep,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatEnrollmentNumber(value) {
  return String(value).padStart(6, "0");
}
