import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Pill, AlertTriangle, CheckCircle, Clock, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PATIENTS = [
  {
    id: "1",
    name: "Jean Dupont",
    age: 72,
    lastAlive: "Il y a 2h",
    adherence: 91,
    alerts: 0,
    status: "ok" as const,
    medications: 5,
  },
  {
    id: "2",
    name: "Marguerite Lefèvre",
    age: 84,
    lastAlive: "Il y a 45min",
    adherence: 78,
    alerts: 1,
    status: "warning" as const,
    medications: 7,
  },
  {
    id: "3",
    name: "Robert Martin",
    age: 69,
    lastAlive: "Il y a 6h",
    adherence: 95,
    alerts: 0,
    status: "ok" as const,
    medications: 3,
  },
  {
    id: "4",
    name: "Simone Bernard",
    age: 91,
    lastAlive: "Il y a 28h",
    adherence: 62,
    alerts: 3,
    status: "critical" as const,
    medications: 9,
  },
];

function StatusDot({ status }: { status: "ok" | "warning" | "critical" }) {
  const colors = {
    ok: "bg-[oklch(0.65_0.17_145)]",
    warning: "bg-[oklch(0.80_0.15_85)]",
    critical: "bg-[oklch(0.60_0.22_25)] animate-pulse",
  };
  return <span className={`w-3 h-3 rounded-full ${colors[status]} inline-block`} />;
}

export default function CaregiverScreen() {
  const { seniorMode, navigate, setSelectedPatientId } = useApp();

  const summary = {
    total: PATIENTS.length,
    ok: PATIENTS.filter((p) => p.status === "ok").length,
    warning: PATIENTS.filter((p) => p.status === "warning").length,
    critical: PATIENTS.filter((p) => p.status === "critical").length,
  };

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Users size={20} className="text-primary" />
        <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Tableau de bord soignant</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Supervision de vos patients</p>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { count: summary.total, label: "Total", icon: Users, bg: "bg-accent", text: "text-primary" },
            { count: summary.ok, label: "OK", icon: CheckCircle, bg: "bg-[oklch(0.95_0.05_145)]", text: "text-[oklch(0.40_0.15_145)]" },
            { count: summary.warning, label: "Alerte", icon: AlertTriangle, bg: "bg-[oklch(0.97_0.03_85)]", text: "text-[oklch(0.40_0.12_85)]" },
            { count: summary.critical, label: "Critique", icon: Activity, bg: "bg-[oklch(0.95_0.05_25)]", text: "text-[oklch(0.40_0.18_25)]" },
          ].map((s, i) => (
            <Card key={i} className={`border-2 ${s.bg}`}>
              <CardContent className="p-2 text-center">
                <s.icon size={16} className={`${s.text} mx-auto mb-0.5`} />
                <p className={`font-bold ${seniorMode ? "text-xl" : "text-lg"} ${s.text}`}>{s.count}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Patient List */}
      <h2 className={`font-bold ${seniorMode ? "text-lg" : "text-base"} mb-3`}>Patients suivis</h2>

      <div className="space-y-3 pb-4">
        {PATIENTS.map((patient, i) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className={`border-2 shadow-sm cursor-pointer hover:shadow-md transition-all ${
                patient.status === "critical"
                  ? "border-[oklch(0.60_0.22_25)]/50 bg-[oklch(0.99_0.01_25)]"
                  : patient.status === "warning"
                    ? "border-[oklch(0.80_0.15_85)]/50"
                    : ""
              }`}
              onClick={() => {
                setSelectedPatientId(patient.id);
                navigate("patient-detail");
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0 text-primary font-bold text-base">
                    {patient.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`font-bold ${seniorMode ? "text-base" : "text-sm"} truncate`}>{patient.name}</p>
                      <StatusDot status={patient.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{patient.age} ans · {patient.medications} médicaments</p>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Heart size={12} className="text-[oklch(0.65_0.17_145)]" />
                        <span className="text-muted-foreground">{patient.lastAlive}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Pill size={12} className="text-primary" />
                        <span className="text-muted-foreground">{patient.adherence}%</span>
                      </div>
                      {patient.alerts > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <AlertTriangle size={12} className="text-[oklch(0.60_0.22_25)]" />
                          <span className="text-[oklch(0.50_0.20_25)] font-semibold">{patient.alerts} alerte{patient.alerts > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Patient */}
      <Button
        variant="outline"
        className="w-full h-12 rounded-xl border-2 border-dashed text-muted-foreground hover:text-primary hover:border-primary"
        onClick={() => toast.info("Fonctionnalité bientôt disponible")}
      >
        + Ajouter un patient
      </Button>
    </div>
  );
}
