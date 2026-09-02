import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function Step4Commercial({ data, update, onNext, onBack }) {
  const { campaigns, leadSources } = useData();
  const commercial = data.commercial;
  const setCommercial = (patch) => update({ commercial: { ...commercial, ...patch } });

  const handleNext = () => {
    if (!commercial.origin) {
      toast.error("Selecione a origem do lead para continuar.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6" data-testid="wizard-step4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Origem do lead</Label>
          <Select value={commercial.origin} onValueChange={(v) => setCommercial({ origin: v })}>
            <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-100" data-testid="lead-origin-select">
              <SelectValue placeholder="Selecione a origem" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              {leadSources.map((source) => (
                <SelectItem key={source.id} value={source.name} data-testid={`lead-origin-option-${source.slug}`}>{source.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Campanha</Label>
          <Input
            placeholder="Ex: MOPP Facebook Setembro"
            value={commercial.campaign}
            onChange={(e) => setCommercial({ campaign: e.target.value })}
            className="bg-slate-900 border-slate-800 text-slate-100"
            data-testid="campaign-input"
          />
        </div>
      </div>

      {campaigns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {campaigns.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCommercial({ campaign: c.name })}
              data-testid={`campaign-suggestion-${c.id}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition-colors",
                commercial.campaign === c.name ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-slate-300">Observações internas</Label>
        <p className="text-xs text-slate-500">Este campo não aparece no resumo enviado à escola.</p>
        <Textarea
          value={commercial.notes}
          onChange={(e) => setCommercial({ notes: e.target.value })}
          className="bg-slate-900 border-slate-800 text-slate-100"
          rows={3}
          data-testid="internal-notes-textarea"
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} className="bg-slate-800 hover:bg-slate-700" data-testid="wizard-back-button">Voltar</Button>
        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500" data-testid="wizard-next-button">Continuar</Button>
      </div>
    </div>
  );
}
