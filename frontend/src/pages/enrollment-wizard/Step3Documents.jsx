import { useData } from "@/context/DataContext";
import { DocumentChecklist } from "@/components/shared/DocumentChecklist";
import { Button } from "@/components/ui/button";

export function Step3Documents({ data, update, onNext, onBack }) {
  const { courses } = useData();
  const course = courses.find((c) => c.id === data.courseId);
  const documents = course?.requiredDocuments || [];

  const toggle = (doc, checked) => update({ documents: { ...data.documents, [doc]: checked } });

  return (
    <div className="space-y-6" data-testid="wizard-step3">
      <p className="text-sm text-slate-400">
        Marque os documentos já recebidos do aluno para o curso <span className="text-slate-200 font-medium">{course?.name}</span>.
      </p>
      <DocumentChecklist documents={documents} values={data.documents} onToggle={toggle} />
      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} className="bg-slate-800 hover:bg-slate-700" data-testid="wizard-back-button">Voltar</Button>
        <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-500" data-testid="wizard-next-button">Continuar</Button>
      </div>
    </div>
  );
}
