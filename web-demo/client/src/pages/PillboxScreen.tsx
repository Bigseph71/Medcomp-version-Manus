import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TODAY_DOSES, ADHERENCE_DATA, USER_PROFILE, type DoseEntry } from "@/lib/demo-data";
import { Check, Clock, X, Plus, ChevronRight, Bell, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

function DoseCard({ dose, index, seniorMode, onConfirm }: { dose: DoseEntry; index: number; seniorMode: boolean; onConfirm: (id: string) => void }) {
  const statusConfig = {
    taken: { icon: Check, bg: "bg-[oklch(0.95_0.05_145)]", border: "border-[oklch(0.65_0.17_145)]", text: "text-[oklch(0.35_0.12_145)]", label: "Pris" },
    missed: { icon: X, bg: "bg-[oklch(0.95_0.05_25)]", border: "border-[oklch(0.60_0.22_25)]", text: "text-[oklch(0.40_0.18_25)]", label: "Manqué" },
    pending: { icon: Clock, bg: "bg-[oklch(0.97_0.03_85)]", border: "border-[oklch(0.80_0.15_85)]", text: "text-[oklch(0.40_0.12_85)]", label: "En attente" },
    snoozed: { icon: Bell, bg: "bg-[oklch(0.95_0.04_250)]", border: "border-[oklch(0.60_0.15_250)]", text: "text-[oklch(0.35_0.12_250)]", label: "Reporté" },
  };

  const config = statusConfig[dose.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className={`${config.bg} border-2 ${config.border} ${dose.status === "pending" ? "shadow-md" : "shadow-sm"}`}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} border-2 ${config.border} flex items-center justify-center shrink-0`}>
            <Icon size={seniorMode ? 22 : 18} className={config.text} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${seniorMode ? "text-base" : "text-sm"} text-foreground truncate`}>
              {dose.medicationName}
            </p>
            <p className={`${config.text} ${seniorMode ? "text-sm" : "text-xs"} font-medium`}>
              {dose.time} · {dose.dosage} · {config.label}
            </p>
          </div>
          {dose.status === "pending" && (
            <Button
              size="sm"
              onClick={() => onConfirm(dose.id)}
              className="bg-[oklch(0.65_0.17_145)] hover:bg-[oklch(0.55_0.17_145)] text-white rounded-xl h-10 px-4 font-semibold shrink-0"
            >
              <Check size={16} className="mr-1" />
              Pris
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PillboxScreen() {
  const { navigate, seniorMode } = useApp();
  const [doses, setDoses] = useState(TODAY_DOSES);

  const takenCount = doses.filter((d) => d.status === "taken").length;
  const totalCount = doses.length;
  const adherencePercent = Math.round((takenCount / totalCount) * 100);

  const handleConfirm = (id: string) => {
    setDoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "taken" as const } : d))
    );
    toast.success("Prise confirmée !", { description: "Votre dose a été enregistrée." });
  };

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-muted-foreground text-sm">Bonjour,</p>
          <h1 className={`font-bold text-foreground ${seniorMode ? "text-2xl" : "text-xl"}`}>
            {USER_PROFILE.firstName} {USER_PROFILE.lastName}
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("add-medication")}
          className="h-11 w-11 rounded-xl border-2"
          aria-label="Ajouter un médicament"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* Adherence Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-2 border-[oklch(0.45_0.11_180)]/20 bg-gradient-to-br from-[oklch(0.97_0.02_180)] to-white shadow-md mb-5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <span className={`font-semibold ${seniorMode ? "text-base" : "text-sm"} text-foreground`}>
                  Adhérence aujourd'hui
                </span>
              </div>
              <span className={`font-bold ${seniorMode ? "text-2xl" : "text-xl"} text-primary`}>
                {adherencePercent}%
              </span>
            </div>
            <Progress value={adherencePercent} className="h-3 rounded-full" />
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>{takenCount}/{totalCount} doses prises</span>
              <span>Semaine: {ADHERENCE_DATA.week}% · Mois: {ADHERENCE_DATA.month}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Mini Chart */}
      <div className="flex gap-1.5 mb-5">
        {ADHERENCE_DATA.weeklyData.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="h-16 bg-muted rounded-lg relative overflow-hidden mb-1">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-lg bg-primary/80 transition-all"
                style={{ height: `${d.percent}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>

      {/* Today's Doses */}
      <div className="flex items-center justify-between mb-3">
        <h2 className={`font-bold ${seniorMode ? "text-lg" : "text-base"} text-foreground`}>
          Doses du jour
        </h2>
        <button className="text-xs text-primary font-semibold flex items-center gap-0.5">
          Voir tout <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-2.5 pb-4">
        {doses.map((dose, i) => (
          <DoseCard
            key={dose.id}
            dose={dose}
            index={i}
            seniorMode={seniorMode}
            onConfirm={handleConfirm}
          />
        ))}
      </div>
    </div>
  );
}
