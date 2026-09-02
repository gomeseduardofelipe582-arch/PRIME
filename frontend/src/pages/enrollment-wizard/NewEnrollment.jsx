import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WizardStepper } from "./WizardStepper";
import { Step1Course } from "./Step1Course";
import { Step2Student } from "./Step2Student";
import { Step3Documents } from "./Step3Documents";
import { Step4Commercial } from "./Step4Commercial";
import { Step5Review } from "./Step5Review";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";

const initialData = {
  courseId: "",
  salePrice: 0,
  student: { fullName: "", cpf: "", birthDate: "", phone: "", email: "", address: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip: "" },
  extra: {},
  documents: {},
  commercial: { origin: "", campaign: "", notes: "" },
  updateExistingStudent: false,
};

export default function NewEnrollment() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const { createEnrollment, courses } = useData();
  const navigate = useNavigate();

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    const course = courses.find((c) => c.id === data.courseId);
    const enrollment = await createEnrollment({
      courseId: data.courseId,
      salePrice: Number(data.salePrice) || 0,
      repasse: course?.repasse || 0,
      student: data.student,
      extra: data.extra,
      documents: data.documents,
      commercial: data.commercial,
      updateExistingStudent: data.updateExistingStudent,
    });
    toast.success(`Matrícula Nº ${enrollment.number} criada com sucesso!`);
    navigate(`/matriculas/${enrollment.id}`);
  };

  return (
    <div data-testid="new-enrollment-page">
      <PageHeader title="Nova Matrícula" subtitle="Preencha os passos abaixo para gerar a matrícula" />
      <div className="max-w-3xl mx-auto">
        <WizardStepper current={step} />
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          {step === 1 && <Step1Course data={data} update={update} onNext={next} />}
          {step === 2 && <Step2Student data={data} update={update} onNext={next} onBack={back} />}
          {step === 3 && <Step3Documents data={data} update={update} onNext={next} onBack={back} />}
          {step === 4 && <Step4Commercial data={data} update={update} onNext={next} onBack={back} />}
          {step === 5 && <Step5Review data={data} onBack={back} onFinish={handleFinish} />}
        </div>
      </div>
    </div>
  );
}
