import { useState } from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { CATEGORIES } from "@/constants/options";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

export default function Courses() {
  const { courses, updateCourse } = useData();
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);

  const openCourse = (course) => {
    setSelected(course);
    setEdit(course);
  };

  const save = async () => {
    await updateCourse(selected.id, edit);
    toast.success("Curso atualizado.");
    setSelected(null);
  };

  return (
    <div data-testid="courses-page">
      <PageHeader title="Cursos" subtitle="Catálogo interno de cursos" />
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const list = courses.filter((c) => c.category === cat);
          if (list.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">{cat}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => openCourse(course)}
                    data-testid={`course-card-${course.id}`}
                    className="text-left rounded-lg border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 hover:bg-slate-800/40 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-100">{course.name}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-4 text-xs">
                      <span className="text-amber-400">Repasse {formatCurrency(course.repasse)}</span>
                      <span className="text-slate-400">Sugerido {formatCurrency(course.suggestedPrice)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto" data-testid="course-detail-sheet">
          {edit && (
            <>
              <SheetHeader><SheetTitle className="text-slate-50">{edit.name}</SheetTitle></SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome</Label>
                  <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Descrição</Label>
                  <Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Carga horária</Label>
                    <Input value={edit.durationHours} onChange={(e) => setEdit({ ...edit, durationHours: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-duration" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Prazo</Label>
                    <Input value={edit.deadline} onChange={(e) => setEdit({ ...edit, deadline: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-deadline" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Requisitos</Label>
                  <Textarea value={edit.requirements} onChange={(e) => setEdit({ ...edit, requirements: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-requirements" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Repasse à escola</Label>
                    <Input type="number" value={edit.repasse} onChange={(e) => setEdit({ ...edit, repasse: Number(e.target.value) })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-repasse" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Preço sugerido</Label>
                    <Input type="number" value={edit.suggestedPrice} onChange={(e) => setEdit({ ...edit, suggestedPrice: Number(e.target.value) })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-suggested-price" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Documentos exigidos</Label>
                  <p className="text-xs text-slate-400">{edit.requiredDocuments.join(", ")}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Observações importantes</Label>
                  <Textarea value={edit.importantInfo} onChange={(e) => setEdit({ ...edit, importantInfo: e.target.value })} className="bg-slate-950 border-slate-800 text-slate-100" data-testid="course-edit-important-info" />
                </div>
                <Button onClick={save} className="w-full bg-indigo-600 hover:bg-indigo-500" data-testid="course-save-button">Salvar alterações</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
