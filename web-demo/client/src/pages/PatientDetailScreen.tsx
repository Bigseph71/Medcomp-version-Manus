import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Heart,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Phone,
  Calendar,
  Droplets,
  Weight,
  Ruler,
  Shield,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

// ─── Patient detail data per patient ID ──────────────────────────────────
interface PatientDetail {
  id: string;
  name: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  bloodType: string;
  weight: number;
  height: number;
  conditions: string[];
  allergies: string[];
  primaryDoctor: string;
  primaryDoctorPhone: string;
  status: "ok" | "warning" | "critical";
  adherence: { today: number; week: number; month: number };
  weeklyData: { day: string; percent: number }[];
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    color: string;
  }[];
  todayDoses: {
    id: string;
    name: string;
    time: string;
    status: "taken" | "missed" | "pending";
    dosage: string;
  }[];
  aliveHistory: {
    date: string;
    time: string;
    status: "confirmed" | "missed";
  }[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    priority: number;
  }[];
  alerts: {
    id: string;
    type: "interaction" | "missed_dose" | "alive_missed" | "adherence_low";
    severity: "yellow" | "red";
    message: string;
    timestamp: string;
  }[];
  interactions: {
    drugA: string;
    drugB: string;
    severity: "green" | "yellow" | "red";
    explanation: string;
  }[];
}

const PATIENT_DETAILS: Record<string, PatientDetail> = {
  "1": {
    id: "1",
    name: "Jean Dupont",
    age: 72,
    gender: "Homme",
    dateOfBirth: "15/03/1954",
    phone: "+33 6 12 34 56 78",
    address: "14 Rue des Lilas, 75013 Paris",
    bloodType: "A+",
    weight: 78,
    height: 175,
    conditions: ["Diabète type 2", "Hypertension", "Hypothyroïdie"],
    allergies: ["Pénicilline", "Aspirine"],
    primaryDoctor: "Dr. Martin",
    primaryDoctorPhone: "+33 1 45 67 89 01",
    status: "ok",
    adherence: { today: 67, week: 87, month: 91 },
    weeklyData: [
      { day: "Lun", percent: 100 },
      { day: "Mar", percent: 75 },
      { day: "Mer", percent: 100 },
      { day: "Jeu", percent: 83 },
      { day: "Ven", percent: 100 },
      { day: "Sam", percent: 67 },
      { day: "Dim", percent: 83 },
    ],
    medications: [
      { id: "1", name: "Metformine", dosage: "500 mg", frequency: "2x/jour", times: ["08:00", "20:00"], color: "#0F766E" },
      { id: "2", name: "Amlodipine", dosage: "5 mg", frequency: "1x/jour", times: ["08:00"], color: "#1D4ED8" },
      { id: "3", name: "Oméprazole", dosage: "20 mg", frequency: "1x/jour", times: ["07:30"], color: "#7C3AED" },
      { id: "4", name: "Atorvastatine", dosage: "10 mg", frequency: "1x/jour", times: ["21:00"], color: "#DC2626" },
      { id: "5", name: "Lévothyroxine", dosage: "75 µg", frequency: "1x/jour", times: ["06:30"], color: "#EA580C" },
    ],
    todayDoses: [
      { id: "d1", name: "Lévothyroxine 75µg", time: "06:30", status: "taken", dosage: "75 µg" },
      { id: "d2", name: "Oméprazole 20mg", time: "07:30", status: "taken", dosage: "20 mg" },
      { id: "d3", name: "Metformine 500mg", time: "08:00", status: "taken", dosage: "500 mg" },
      { id: "d4", name: "Amlodipine 5mg", time: "08:00", status: "taken", dosage: "5 mg" },
      { id: "d5", name: "Metformine 500mg", time: "20:00", status: "pending", dosage: "500 mg" },
      { id: "d6", name: "Atorvastatine 10mg", time: "21:00", status: "pending", dosage: "10 mg" },
    ],
    aliveHistory: [
      { date: "27/02", time: "09:15", status: "confirmed" },
      { date: "26/02", time: "08:42", status: "confirmed" },
      { date: "25/02", time: "09:30", status: "confirmed" },
      { date: "24/02", time: "10:05", status: "confirmed" },
      { date: "23/02", time: "", status: "missed" },
      { date: "22/02", time: "08:20", status: "confirmed" },
    ],
    emergencyContacts: [
      { name: "Marie Dupont", relationship: "Fille", phone: "+33 6 12 34 56 78", priority: 1 },
      { name: "Pierre Dupont", relationship: "Fils", phone: "+33 6 98 76 54 32", priority: 2 },
    ],
    alerts: [],
    interactions: [
      { drugA: "Metformine", drugB: "Amlodipine", severity: "yellow", explanation: "Surveillance glycémique renforcée recommandée." },
      { drugA: "Oméprazole", drugB: "Lévothyroxine", severity: "yellow", explanation: "Espacer les prises d'au moins 4 heures." },
    ],
  },
  "2": {
    id: "2",
    name: "Marguerite Lefèvre",
    age: 84,
    gender: "Femme",
    dateOfBirth: "22/07/1941",
    phone: "+33 6 55 44 33 22",
    address: "8 Avenue Victor Hugo, 75016 Paris",
    bloodType: "O-",
    weight: 62,
    height: 160,
    conditions: ["Insuffisance cardiaque", "Fibrillation auriculaire", "Arthrose"],
    allergies: ["Sulfamides"],
    primaryDoctor: "Dr. Lefèvre",
    primaryDoctorPhone: "+33 1 42 33 44 55",
    status: "warning",
    adherence: { today: 43, week: 78, month: 72 },
    weeklyData: [
      { day: "Lun", percent: 86 },
      { day: "Mar", percent: 71 },
      { day: "Mer", percent: 86 },
      { day: "Jeu", percent: 57 },
      { day: "Ven", percent: 100 },
      { day: "Sam", percent: 71 },
      { day: "Dim", percent: 43 },
    ],
    medications: [
      { id: "1", name: "Warfarine", dosage: "5 mg", frequency: "1x/jour", times: ["18:00"], color: "#DC2626" },
      { id: "2", name: "Bisoprolol", dosage: "2.5 mg", frequency: "1x/jour", times: ["08:00"], color: "#1D4ED8" },
      { id: "3", name: "Furosémide", dosage: "40 mg", frequency: "1x/jour", times: ["07:00"], color: "#0F766E" },
      { id: "4", name: "Digoxine", dosage: "0.125 mg", frequency: "1x/jour", times: ["08:00"], color: "#7C3AED" },
      { id: "5", name: "Ramipril", dosage: "5 mg", frequency: "1x/jour", times: ["08:00"], color: "#EA580C" },
      { id: "6", name: "Paracétamol", dosage: "1g", frequency: "3x/jour", times: ["08:00", "14:00", "20:00"], color: "#64748B" },
      { id: "7", name: "Oméprazole", dosage: "20 mg", frequency: "1x/jour", times: ["07:00"], color: "#7C3AED" },
    ],
    todayDoses: [
      { id: "d1", name: "Furosémide 40mg", time: "07:00", status: "taken", dosage: "40 mg" },
      { id: "d2", name: "Oméprazole 20mg", time: "07:00", status: "taken", dosage: "20 mg" },
      { id: "d3", name: "Bisoprolol 2.5mg", time: "08:00", status: "taken", dosage: "2.5 mg" },
      { id: "d4", name: "Digoxine 0.125mg", time: "08:00", status: "missed", dosage: "0.125 mg" },
      { id: "d5", name: "Ramipril 5mg", time: "08:00", status: "taken", dosage: "5 mg" },
      { id: "d6", name: "Paracétamol 1g", time: "14:00", status: "pending", dosage: "1g" },
      { id: "d7", name: "Warfarine 5mg", time: "18:00", status: "pending", dosage: "5 mg" },
    ],
    aliveHistory: [
      { date: "27/02", time: "07:45", status: "confirmed" },
      { date: "26/02", time: "08:10", status: "confirmed" },
      { date: "25/02", time: "", status: "missed" },
      { date: "24/02", time: "09:00", status: "confirmed" },
      { date: "23/02", time: "08:30", status: "confirmed" },
      { date: "22/02", time: "", status: "missed" },
    ],
    emergencyContacts: [
      { name: "Sophie Lefèvre", relationship: "Fille", phone: "+33 6 11 22 33 44", priority: 1 },
      { name: "Marc Lefèvre", relationship: "Fils", phone: "+33 6 55 66 77 88", priority: 2 },
      { name: "Dr. Lefèvre", relationship: "Médecin", phone: "+33 1 42 33 44 55", priority: 3 },
    ],
    alerts: [
      { id: "a1", type: "missed_dose", severity: "yellow", message: "Digoxine 0.125mg manquée à 08:00", timestamp: "Il y a 4h" },
    ],
    interactions: [
      { drugA: "Warfarine", drugB: "Paracétamol", severity: "yellow", explanation: "Doses élevées de paracétamol peuvent augmenter l'INR. Surveillance recommandée." },
      { drugA: "Digoxine", drugB: "Furosémide", severity: "red", explanation: "Le furosémide peut provoquer une hypokaliémie, augmentant la toxicité de la digoxine." },
    ],
  },
  "3": {
    id: "3",
    name: "Robert Martin",
    age: 69,
    gender: "Homme",
    dateOfBirth: "03/11/1956",
    phone: "+33 6 77 88 99 00",
    address: "25 Rue de la Paix, 69002 Lyon",
    bloodType: "B+",
    weight: 85,
    height: 182,
    conditions: ["Hypercholestérolémie"],
    allergies: [],
    primaryDoctor: "Dr. Bernard",
    primaryDoctorPhone: "+33 4 72 33 44 55",
    status: "ok",
    adherence: { today: 100, week: 95, month: 97 },
    weeklyData: [
      { day: "Lun", percent: 100 },
      { day: "Mar", percent: 100 },
      { day: "Mer", percent: 100 },
      { day: "Jeu", percent: 67 },
      { day: "Ven", percent: 100 },
      { day: "Sam", percent: 100 },
      { day: "Dim", percent: 100 },
    ],
    medications: [
      { id: "1", name: "Rosuvastatine", dosage: "10 mg", frequency: "1x/jour", times: ["21:00"], color: "#DC2626" },
      { id: "2", name: "Aspirine", dosage: "75 mg", frequency: "1x/jour", times: ["08:00"], color: "#1D4ED8" },
      { id: "3", name: "Vitamine D", dosage: "1000 UI", frequency: "1x/jour", times: ["08:00"], color: "#EA580C" },
    ],
    todayDoses: [
      { id: "d1", name: "Aspirine 75mg", time: "08:00", status: "taken", dosage: "75 mg" },
      { id: "d2", name: "Vitamine D 1000UI", time: "08:00", status: "taken", dosage: "1000 UI" },
      { id: "d3", name: "Rosuvastatine 10mg", time: "21:00", status: "pending", dosage: "10 mg" },
    ],
    aliveHistory: [
      { date: "27/02", time: "08:00", status: "confirmed" },
      { date: "26/02", time: "07:55", status: "confirmed" },
      { date: "25/02", time: "08:10", status: "confirmed" },
      { date: "24/02", time: "08:05", status: "confirmed" },
      { date: "23/02", time: "07:50", status: "confirmed" },
      { date: "22/02", time: "08:15", status: "confirmed" },
    ],
    emergencyContacts: [
      { name: "Claire Martin", relationship: "Épouse", phone: "+33 6 11 22 33 44", priority: 1 },
    ],
    alerts: [],
    interactions: [],
  },
  "4": {
    id: "4",
    name: "Simone Bernard",
    age: 91,
    gender: "Femme",
    dateOfBirth: "18/09/1934",
    phone: "+33 6 22 33 44 55",
    address: "3 Place Bellecour, 69002 Lyon",
    bloodType: "AB+",
    weight: 55,
    height: 155,
    conditions: ["Insuffisance rénale chronique", "Diabète type 2", "BPCO", "Ostéoporose"],
    allergies: ["Iode", "Codéine"],
    primaryDoctor: "Dr. Moreau",
    primaryDoctorPhone: "+33 4 78 22 33 44",
    status: "critical",
    adherence: { today: 22, week: 62, month: 58 },
    weeklyData: [
      { day: "Lun", percent: 56 },
      { day: "Mar", percent: 67 },
      { day: "Mer", percent: 78 },
      { day: "Jeu", percent: 44 },
      { day: "Ven", percent: 56 },
      { day: "Sam", percent: 67 },
      { day: "Dim", percent: 22 },
    ],
    medications: [
      { id: "1", name: "Insuline Lantus", dosage: "18 UI", frequency: "1x/jour", times: ["22:00"], color: "#0F766E" },
      { id: "2", name: "Metformine", dosage: "500 mg", frequency: "2x/jour", times: ["08:00", "20:00"], color: "#1D4ED8" },
      { id: "3", name: "Salbutamol", dosage: "100 µg", frequency: "À la demande", times: [], color: "#7C3AED" },
      { id: "4", name: "Alendronate", dosage: "70 mg", frequency: "1x/semaine", times: ["08:00"], color: "#EA580C" },
      { id: "5", name: "Calcium + Vit D", dosage: "500mg/800UI", frequency: "1x/jour", times: ["12:00"], color: "#64748B" },
      { id: "6", name: "Furosémide", dosage: "20 mg", frequency: "1x/jour", times: ["07:00"], color: "#DC2626" },
      { id: "7", name: "Potassium", dosage: "600 mg", frequency: "1x/jour", times: ["08:00"], color: "#0F766E" },
      { id: "8", name: "Oméprazole", dosage: "20 mg", frequency: "1x/jour", times: ["07:00"], color: "#7C3AED" },
      { id: "9", name: "Paracétamol", dosage: "1g", frequency: "3x/jour", times: ["08:00", "14:00", "20:00"], color: "#64748B" },
    ],
    todayDoses: [
      { id: "d1", name: "Furosémide 20mg", time: "07:00", status: "missed", dosage: "20 mg" },
      { id: "d2", name: "Oméprazole 20mg", time: "07:00", status: "missed", dosage: "20 mg" },
      { id: "d3", name: "Metformine 500mg", time: "08:00", status: "taken", dosage: "500 mg" },
      { id: "d4", name: "Potassium 600mg", time: "08:00", status: "taken", dosage: "600 mg" },
      { id: "d5", name: "Paracétamol 1g", time: "08:00", status: "missed", dosage: "1g" },
      { id: "d6", name: "Calcium + Vit D", time: "12:00", status: "pending", dosage: "500mg/800UI" },
      { id: "d7", name: "Paracétamol 1g", time: "14:00", status: "pending", dosage: "1g" },
      { id: "d8", name: "Metformine 500mg", time: "20:00", status: "pending", dosage: "500 mg" },
      { id: "d9", name: "Insuline Lantus 18UI", time: "22:00", status: "pending", dosage: "18 UI" },
    ],
    aliveHistory: [
      { date: "27/02", time: "", status: "missed" },
      { date: "26/02", time: "", status: "missed" },
      { date: "25/02", time: "11:30", status: "confirmed" },
      { date: "24/02", time: "10:45", status: "confirmed" },
      { date: "23/02", time: "", status: "missed" },
      { date: "22/02", time: "09:00", status: "confirmed" },
    ],
    emergencyContacts: [
      { name: "Françoise Bernard", relationship: "Fille", phone: "+33 6 33 44 55 66", priority: 1 },
      { name: "Jean-Paul Bernard", relationship: "Fils", phone: "+33 6 77 88 99 11", priority: 2 },
      { name: "Dr. Moreau", relationship: "Médecin", phone: "+33 4 78 22 33 44", priority: 3 },
    ],
    alerts: [
      { id: "a1", type: "alive_missed", severity: "red", message: "Pas de confirmation de vie depuis 28h", timestamp: "Il y a 28h" },
      { id: "a2", type: "missed_dose", severity: "red", message: "3 doses manquées ce matin (Furosémide, Oméprazole, Paracétamol)", timestamp: "Il y a 5h" },
      { id: "a3", type: "adherence_low", severity: "yellow", message: "Adhérence mensuelle en dessous de 60%", timestamp: "Aujourd'hui" },
    ],
    interactions: [
      { drugA: "Metformine", drugB: "Furosémide", severity: "yellow", explanation: "Le furosémide peut altérer la fonction rénale et augmenter le risque d'acidose lactique." },
      { drugA: "Alendronate", drugB: "Calcium", severity: "yellow", explanation: "Espacer les prises d'au moins 2h. Le calcium réduit l'absorption de l'alendronate." },
      { drugA: "Furosémide", drugB: "Insuline", severity: "yellow", explanation: "Le furosémide peut diminuer la tolérance au glucose et nécessiter un ajustement de l'insuline." },
    ],
  },
};

// ─── Collapsible Section Component ───────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { seniorMode } = useApp();

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 px-1"
      >
        <div className="flex items-center gap-2">
          <Icon size={seniorMode ? 18 : 15} className="text-primary" />
          <span className={`font-bold tracking-wide text-muted-foreground uppercase ${seniorMode ? "text-sm" : "text-xs"}`}>
            {title}
          </span>
          {badge}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "ok" | "warning" | "critical" }) {
  const config = {
    ok: { label: "Stable", bg: "bg-[oklch(0.92_0.08_145)]", text: "text-[oklch(0.35_0.12_145)]", icon: CheckCircle },
    warning: { label: "Attention", bg: "bg-[oklch(0.95_0.07_85)]", text: "text-[oklch(0.40_0.12_85)]", icon: AlertTriangle },
    critical: { label: "Critique", bg: "bg-[oklch(0.93_0.06_25)]", text: "text-[oklch(0.40_0.18_25)]", icon: AlertTriangle },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <c.icon size={12} />
      {c.label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function PatientDetailScreen() {
  const { navigate, seniorMode } = useApp();
  const { selectedPatientId } = useApp() as any;
  const patientId = selectedPatientId || "1";
  const patient = PATIENT_DETAILS[patientId];

  if (!patient) {
    return (
      <div className="px-4 pt-6 text-center">
        <p>Patient introuvable</p>
        <Button variant="outline" onClick={() => navigate("caregiver")} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  const takenDoses = patient.todayDoses.filter((d) => d.status === "taken").length;
  const totalDoses = patient.todayDoses.length;
  const missedDoses = patient.todayDoses.filter((d) => d.status === "missed").length;
  const aliveConfirmed = patient.aliveHistory.filter((a) => a.status === "confirmed").length;
  const aliveMissed = patient.aliveHistory.filter((a) => a.status === "missed").length;

  return (
    <div className="h-full overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[oklch(0.38_0.09_180)] to-[oklch(0.30_0.08_200)] px-4 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("caregiver")}
            className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className={`font-bold text-white ${seniorMode ? "text-xl" : "text-lg"}`}>Dossier patient</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shrink-0">
            {patient.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`font-bold text-white truncate ${seniorMode ? "text-xl" : "text-lg"}`}>{patient.name}</h2>
            </div>
            <p className="text-white/70 text-sm">{patient.age} ans · {patient.gender}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={patient.status} />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Adhérence", value: `${patient.adherence.today}%`, sub: "aujourd'hui" },
            { label: "Médicaments", value: `${patient.medications.length}`, sub: "actifs" },
            { label: "Alertes", value: `${patient.alerts.length}`, sub: patient.alerts.length > 0 ? "actives" : "aucune" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`font-bold text-white ${seniorMode ? "text-xl" : "text-lg"}`}>{stat.value}</p>
              <p className="text-white/50 text-[10px]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Alerts */}
        {patient.alerts.length > 0 && (
          <Section
            title="Alertes actives"
            icon={AlertTriangle}
            defaultOpen={true}
            badge={
              <span className="bg-[oklch(0.60_0.22_25)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                {patient.alerts.length}
              </span>
            }
          >
            <div className="space-y-2">
              {patient.alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-2 ${
                    alert.severity === "red"
                      ? "border-[oklch(0.60_0.22_25)]/40 bg-[oklch(0.99_0.01_25)]"
                      : "border-[oklch(0.80_0.15_85)]/40 bg-[oklch(0.99_0.01_85)]"
                  }`}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        alert.severity === "red" ? "bg-[oklch(0.93_0.06_25)]" : "bg-[oklch(0.95_0.07_85)]"
                      }`}
                    >
                      {alert.type === "alive_missed" ? (
                        <Heart size={16} className={alert.severity === "red" ? "text-[oklch(0.50_0.20_25)]" : "text-[oklch(0.50_0.12_85)]"} />
                      ) : alert.type === "missed_dose" ? (
                        <XCircle size={16} className={alert.severity === "red" ? "text-[oklch(0.50_0.20_25)]" : "text-[oklch(0.50_0.12_85)]"} />
                      ) : (
                        <Activity size={16} className="text-[oklch(0.50_0.12_85)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${seniorMode ? "text-sm" : "text-xs"}`}>{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{alert.timestamp}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Today's Doses */}
        <Section title="Doses du jour" icon={Pill} defaultOpen={true}>
          <Card className="border-2">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${seniorMode ? "text-sm" : "text-xs"}`}>
                  {takenDoses}/{totalDoses} prises
                </span>
                {missedDoses > 0 && (
                  <span className="text-[oklch(0.50_0.20_25)] text-xs font-semibold">{missedDoses} manquée{missedDoses > 1 ? "s" : ""}</span>
                )}
              </div>
              <Progress value={(takenDoses / totalDoses) * 100} className="h-2 mb-3" />
              <div className="space-y-1.5">
                {patient.todayDoses.map((dose) => (
                  <div key={dose.id} className="flex items-center gap-2.5 py-1">
                    <div className="w-5 flex justify-center">
                      {dose.status === "taken" ? (
                        <CheckCircle size={14} className="text-[oklch(0.65_0.17_145)]" />
                      ) : dose.status === "missed" ? (
                        <XCircle size={14} className="text-[oklch(0.60_0.22_25)]" />
                      ) : (
                        <Clock size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <span className={`text-xs text-muted-foreground w-10 shrink-0 ${seniorMode ? "text-sm" : ""}`}>{dose.time}</span>
                    <span className={`flex-1 truncate ${seniorMode ? "text-sm" : "text-xs"} ${dose.status === "missed" ? "text-[oklch(0.50_0.20_25)] line-through" : ""}`}>
                      {dose.name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      dose.status === "taken"
                        ? "bg-[oklch(0.92_0.08_145)] text-[oklch(0.35_0.12_145)]"
                        : dose.status === "missed"
                          ? "bg-[oklch(0.93_0.06_25)] text-[oklch(0.40_0.18_25)]"
                          : "bg-accent text-muted-foreground"
                    }`}>
                      {dose.status === "taken" ? "Pris" : dose.status === "missed" ? "Manqué" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Weekly Adherence */}
        <Section title="Adhérence hebdomadaire" icon={Activity} defaultOpen={true}>
          <Card className="border-2">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Semaine</p>
                    <p className={`font-bold ${seniorMode ? "text-lg" : "text-base"} text-primary`}>{patient.adherence.week}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Mois</p>
                    <p className={`font-bold ${seniorMode ? "text-lg" : "text-base"}`}>{patient.adherence.month}%</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {patient.weeklyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-accent rounded-t-sm relative" style={{ height: "48px" }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-sm transition-all ${
                          d.percent >= 80
                            ? "bg-[oklch(0.65_0.17_145)]"
                            : d.percent >= 60
                              ? "bg-[oklch(0.80_0.15_85)]"
                              : "bg-[oklch(0.60_0.22_25)]"
                        }`}
                        style={{ height: `${(d.percent / 100) * 48}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Medications List */}
        <Section title="Traitements actifs" icon={Pill} defaultOpen={false}>
          <div className="space-y-2">
            {patient.medications.map((med) => (
              <Card key={med.id} className="border-2">
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className="w-2 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: med.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${seniorMode ? "text-sm" : "text-xs"}`}>{med.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {med.dosage} · {med.frequency}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {med.times.length > 0 ? (
                      <p className="text-[10px] text-muted-foreground">{med.times.join(", ")}</p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">À la demande</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Interactions */}
        {patient.interactions.length > 0 && (
          <Section
            title="Interactions détectées"
            icon={Shield}
            defaultOpen={false}
            badge={
              <span className="bg-[oklch(0.95_0.07_85)] text-[oklch(0.40_0.12_85)] text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                {patient.interactions.length}
              </span>
            }
          >
            <div className="space-y-2">
              {patient.interactions.map((inter, i) => (
                <Card
                  key={i}
                  className={`border-2 ${
                    inter.severity === "red"
                      ? "border-[oklch(0.60_0.22_25)]/40 bg-[oklch(0.99_0.01_25)]"
                      : inter.severity === "yellow"
                        ? "border-[oklch(0.80_0.15_85)]/40 bg-[oklch(0.99_0.01_85)]"
                        : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          inter.severity === "red"
                            ? "bg-[oklch(0.60_0.22_25)]"
                            : inter.severity === "yellow"
                              ? "bg-[oklch(0.80_0.15_85)]"
                              : "bg-[oklch(0.65_0.17_145)]"
                        }`}
                      />
                      <p className={`font-semibold ${seniorMode ? "text-sm" : "text-xs"}`}>
                        {inter.drugA} + {inter.drugB}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{inter.explanation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Alive History */}
        <Section title="Confirmation de vie" icon={Heart} defaultOpen={false}>
          <Card className="border-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-[oklch(0.65_0.17_145)]" />
                  <span className="text-xs text-muted-foreground">{aliveConfirmed} confirmées</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle size={12} className="text-[oklch(0.60_0.22_25)]" />
                  <span className="text-xs text-muted-foreground">{aliveMissed} manquées</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {patient.aliveHistory.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1">
                    {entry.status === "confirmed" ? (
                      <CheckCircle size={14} className="text-[oklch(0.65_0.17_145)]" />
                    ) : (
                      <XCircle size={14} className="text-[oklch(0.60_0.22_25)]" />
                    )}
                    <span className={`text-xs ${seniorMode ? "text-sm" : ""}`}>{entry.date}</span>
                    <span className="text-xs text-muted-foreground flex-1">
                      {entry.status === "confirmed" ? entry.time : "Non confirmé"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Patient Info */}
        <Section title="Informations patient" icon={FileText} defaultOpen={false}>
          <Card className="border-2">
            <CardContent className="p-3 space-y-3">
              {[
                { icon: Calendar, label: "Date de naissance", value: patient.dateOfBirth },
                { icon: Phone, label: "Téléphone", value: patient.phone },
                { icon: Droplets, label: "Groupe sanguin", value: patient.bloodType },
                { icon: Weight, label: "Poids", value: `${patient.weight} kg` },
                { icon: Ruler, label: "Taille", value: `${patient.height} cm` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className={`font-medium ${seniorMode ? "text-sm" : "text-xs"}`}>{item.value}</p>
                  </div>
                </div>
              ))}

              {patient.conditions.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">Pathologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.map((c, i) => (
                      <span key={i} className="bg-accent text-accent-foreground text-[10px] font-medium px-2 py-1 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.allergies.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="bg-[oklch(0.93_0.06_25)] text-[oklch(0.40_0.18_25)] text-[10px] font-medium px-2 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* Emergency Contacts */}
        <Section title="Contacts d'urgence" icon={Phone} defaultOpen={false}>
          <div className="space-y-2">
            {patient.emergencyContacts.map((contact, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-xs">{contact.priority}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${seniorMode ? "text-sm" : "text-xs"}`}>{contact.name}</p>
                    <p className="text-[10px] text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <button
                    onClick={() => toast.info(`Appel vers ${contact.name}`, { description: contact.phone })}
                    className="w-9 h-9 rounded-xl bg-[oklch(0.92_0.08_145)] flex items-center justify-center shrink-0"
                  >
                    <Phone size={14} className="text-[oklch(0.40_0.15_145)]" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4 mb-6">
          <Button
            className="w-full h-12 rounded-xl gap-2"
            onClick={() => toast.info("Fonctionnalité bientôt disponible", { description: "L'envoi de messages sera disponible dans la version complète." })}
          >
            <MessageCircle size={18} />
            Envoyer un message
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl gap-2 border-2"
            onClick={() => toast.info("Fonctionnalité bientôt disponible", { description: "L'export de rapport sera disponible dans la version complète." })}
          >
            <FileText size={18} />
            Exporter le rapport
          </Button>
        </div>
      </div>
    </div>
  );
}
