import { useState } from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { CATEGORIES } from "@/constants/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Step1Course({ data, update, onNext }) {
  const { courses } = useData();
  const [category, setCategory] = useState(() => courses.find((c) => c.id === data.courseId)?.category || "");
  const selectedCourse = courses.find((c) => c.id === data.courseId);

  const coursesInCategory = courses.filter((c) => c.category === category);

  const selectCourse = (course) => {
    update({ courseId: course.id, salePrice: course.suggestedPrice, documents: {}, extra: {} });
  };

  const margin = (Number(data.salePrice) || 0) - (selectedCourse?.repasse || 0);

  const handleNext = () => {
    if (!data.courseId) {
      toast.error("Selecione um curso para continuar.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6" data-testid="wizard-step1">
      <div className="space-y-2">
        <Label className="text-slate-300">Categoria</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              data-testid={`category-option-${cat}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors",
                category === cat ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {category && (
        <div className="space-y-2">
          <Label className="text-slate-300">Curso</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {coursesInCategory.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => selectCourse(course)}
                data-testid={`course-option-${course.id}`}
                className={cn(
                  "text-left rounded-lg border p-4 transition-colors",
                  data.courseId === course.id ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                )}
              >
                <p className="text-sm font-semibold text-slate-100">{course.name}</p>
                <p className="text-xs text-slate-500 mt-1">{course.durationHours} · {course.deadline}</p>
              </button>
            ))}
            {coursesInCategory.length === 0 && <p className="text-xs text-slate-500">Nenhum curso cadastrado nesta categoria.</p>}
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-5 space-y-4" data-testid="course-info-card">
          <div>
            <p className="text-sm font-semibold text-slate-100">{selectedCourse.name}</p>
            <p className="text-xs text-slate-400 mt-1">{selectedCourse.description}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div><p className="text-slate-500">Carga horária</p><p className="text-slate-200 font-medium mt-0.5">{selectedCourse.durationHours}</p></div>
            <div><p className="text-slate-500">Prazo</p><p className="text-slate-200 font-medium mt-0.5">{selectedCourse.deadline}</p></div>
            <div><p className="text-slate-500">Repasse à escola</p><p className="text-amber-400 font-medium mt-0.5">{formatCurrency(selectedCourse.repasse)}</p></div>
            <div><p className="text-slate-500">Preço sugerido</p><p className="text-slate-200 font-medium mt-0.5">{formatCurrency(selectedCourse.suggestedPrice)}</p></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-2">
              <Label className="text-slate-300">Preço de venda (editável)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.salePrice}
                onChange={(e) => update({ salePrice: e.target.value })}
                className="bg-slate-900 border-slate-800 text-slate-100"
                data-testid="sale-price-input"
              />
            </div>
            <div>
              <Label className="text-slate-300">Margem estimada</Label>
              <p className={cn("text-2xl font-bold font-display mt-2", margin >= 0 ? "text-emerald-400" : "text-rose-400")} data-testid="estimated-margin-value">
                {formatCurrency(margin)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500" data-testid="wizard-next-button">Continuar</Button>
      </div>
    </div>
  );
}
