import { useState } from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { maskCPF, maskPhone, maskCEP } from "@/lib/format";

const FIELDS = [
  { key: "fullName", label: "Nome completo", span: 2 },
  { key: "cpf", label: "CPF", mask: maskCPF },
  { key: "birthDate", label: "Data de nascimento", type: "date" },
  { key: "phone", label: "Telefone com DDD", mask: maskPhone },
  { key: "email", label: "E-mail", type: "email" },
  { key: "address", label: "Endereço", span: 2 },
  { key: "number", label: "Número" },
  { key: "complement", label: "Complemento" },
  { key: "neighborhood", label: "Bairro" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "zip", label: "CEP", mask: maskCEP },
];

export function Step2Student({ data, update, onNext, onBack }) {
  const { courses, findStudentByCpf } = useData();
  const course = courses.find((c) => c.id === data.courseId);
  const extraFields = course?.extraStudentFields || [];
  const [existingStudent, setExistingStudent] = useState(null);

  const setField = (key, value) => update({ student: { ...data.student, [key]: value } });
  const setExtra = (key, value) => update({ extra: { ...data.extra, [key]: value } });
  const findExisting = async () => {
    try { setExistingStudent(await findStudentByCpf(data.student.cpf)); }
    catch (error) { toast.error(error.message || "Não foi possível consultar o CPF."); }
  };
  const reuseExisting = () => {
    if (!existingStudent) return;
    update({ student: { ...data.student, ...existingStudent }, updateExistingStudent: false });
    toast.success("Dados do aluno existente carregados. Nenhum dado será sobrescrito sem sua confirmação.");
  };

  const handleNext = () => {
    if (!data.student.fullName || !data.student.cpf || !data.student.phone) {
      toast.error("Preencha nome, CPF e telefone para continuar.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6" data-testid="wizard-step2">
      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.span === 2 ? "sm:col-span-2 space-y-2" : "space-y-2"}>
            <Label className="text-slate-300">{f.label}</Label>
            <Input
              type={f.type || "text"}
              value={data.student[f.key] || ""}
              onChange={(e) => setField(f.key, f.mask ? f.mask(e.target.value) : e.target.value)}
              onBlur={f.key === "cpf" ? findExisting : undefined}
              className="bg-slate-900 border-slate-800 text-slate-100"
              data-testid={`student-field-${f.key}`}
            />
          </div>
        ))}
      </div>

      {existingStudent && (
        <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-100" data-testid="existing-student-notice">
          <p className="font-semibold">Aluno já cadastrado: {existingStudent.fullName}</p>
          <p className="mt-1 text-xs text-indigo-100/75">Você pode reutilizar os dados existentes. O registro não será sobrescrito automaticamente.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={reuseExisting} className="bg-indigo-600 hover:bg-indigo-500">Usar dados existentes</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => update({ updateExistingStudent: !data.updateExistingStudent })} className="bg-slate-800 hover:bg-slate-700">
              {data.updateExistingStudent ? "Atualização consciente ativada" : "Permitir atualização consciente"}
            </Button>
          </div>
        </div>
      )}

      {extraFields.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Informações adicionais — {course.name}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {extraFields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label className="text-slate-300">{f.label}</Label>
                <Input
                  type={f.type || "text"}
                  value={data.extra[f.key] || ""}
                  onChange={(e) => setExtra(f.key, e.target.value)}
                  className="bg-slate-900 border-slate-800 text-slate-100"
                  data-testid={`extra-field-${f.key}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} className="bg-slate-800 hover:bg-slate-700" data-testid="wizard-back-button">Voltar</Button>
        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500" data-testid="wizard-next-button">Continuar</Button>
      </div>
    </div>
  );
}
