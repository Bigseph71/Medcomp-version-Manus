import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEDICATIONS } from "@/lib/demo-data";
import { ArrowLeft, Pill, Clock, Utensils, Stethoscope, Calendar, Tag } from "lucide-react";
import { motion } from "framer-motion";

export default function MedicationDetailScreen() {
  const { navigate, selectedMedicationId, seniorMode } = useApp();
  const med = MEDICATIONS.find((m) => m.id === selectedMedicationId) || MEDICATIONS[0];

  const details = [
    { icon: Pill, label: "Substance active", value: med.substance },
    { icon: Tag, label: "Code ATC", value: med.atcCode },
    { icon: Clock, label: "Fréquence", value: med.frequency },
    { icon: Clock, label: "Horaires", value: med.times.join(", ") },
    { icon: Utensils, label: "Condition alimentaire", value: med.foodCondition },
    { icon: Stethoscope, label: "Prescrit par", value: med.prescribedBy },
    { icon: Calendar, label: "Début du traitement", value: new Date(med.startDate).toLocaleDateString("fr-FR") },
  ];

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("pillbox")} className="h-10 w-10 rounded-xl border-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Détail du médicament</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 shadow-md mb-5" style={{ borderLeftWidth: "6px", borderLeftColor: med.color }}>
          <CardContent className="p-5">
            <h2 className={`font-bold ${seniorMode ? "text-2xl" : "text-xl"} text-foreground mb-1`}>{med.name}</h2>
            <p className={`${seniorMode ? "text-lg" : "text-base"} font-semibold text-primary`}>{med.dosage}</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-3">
        {details.map((d, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-2">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <d.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                  <p className={`font-semibold ${seniorMode ? "text-base" : "text-sm"}`}>{d.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
