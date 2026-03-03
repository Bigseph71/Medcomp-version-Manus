import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEDICATIONS } from "@/lib/demo-data";
import { Search, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function InteractionsScreen() {
  const { navigate, seniorMode } = useApp();
  const [selected, setSelected] = useState<string[]>(MEDICATIONS.map((m) => m.id));

  const toggleMed = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Search size={20} className="text-primary" />
          <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Interactions</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Vérifiez les interactions entre vos médicaments
        </p>
      </div>

      {/* Illustration */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="border-2 border-[oklch(0.80_0.15_85)]/30 bg-gradient-to-br from-[oklch(0.97_0.03_85)] to-white mb-5 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/99955022/NGFvRfTFnJq8UurqmiLfoY/medcom-interaction-BAm5tdgPwi6KEzuuJuD5F9.webp"
              alt="Drug interaction analysis"
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div>
              <p className={`font-semibold ${seniorMode ? "text-base" : "text-sm"} text-foreground`}>
                Moteur d'analyse
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sélectionnez les médicaments à vérifier. Notre moteur de règles déterministe analysera les interactions potentielles.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Medication Selection */}
      <h2 className={`font-bold ${seniorMode ? "text-lg" : "text-base"} mb-3`}>
        Vos médicaments ({selected.length} sélectionnés)
      </h2>

      <div className="space-y-2.5 mb-5">
        {MEDICATIONS.map((med, i) => {
          const isSelected = selected.includes(med.id);
          return (
            <motion.div key={med.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className={`border-2 cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-accent/50 shadow-md" : "hover:border-muted-foreground/30"
                }`}
                onClick={() => toggleMed(med.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                      isSelected ? "bg-primary border-primary" : "bg-muted border-border"
                    }`}
                  >
                    {isSelected && <Check size={18} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${seniorMode ? "text-base" : "text-sm"}`}>{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.dosage} · {med.atcCode}</p>
                  </div>
                  <div className="w-3 h-8 rounded-full" style={{ backgroundColor: med.color + "30" }} />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Check Button */}
      <Button
        onClick={() => navigate("interaction-results")}
        disabled={selected.length < 2}
        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
      >
        <AlertTriangle size={20} />
        Vérifier les interactions
        <ArrowRight size={20} />
      </Button>

      {selected.length < 2 && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          Sélectionnez au moins 2 médicaments
        </p>
      )}
    </div>
  );
}
