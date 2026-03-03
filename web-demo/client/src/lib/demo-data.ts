// ─── MedCom Demo Data ─────────────────────────────────────────────────────
// Données simulées pour la démo interactive

export interface Medication {
  id: string;
  name: string;
  substance: string;
  dosage: string;
  frequency: string;
  times: string[];
  foodCondition: string;
  prescribedBy: string;
  startDate: string;
  atcCode: string;
  color: string;
}

export interface DoseEntry {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  status: "taken" | "missed" | "pending" | "snoozed";
  dosage: string;
}

export interface Interaction {
  id: string;
  drugA: string;
  drugB: string;
  severity: "green" | "yellow" | "red";
  clinicalExplanation: string;
  patientExplanation: string;
  recommendation: string;
  confidenceScore: number;
  sources: string[];
}

export interface AliveCheck {
  id: string;
  confirmedAt: string;
  batteryLevel: number;
  networkStatus: string;
  status: "confirmed" | "missed" | "pending";
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export const MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Metformine",
    substance: "Metformine HCl",
    dosage: "500 mg",
    frequency: "2x/jour",
    times: ["08:00", "20:00"],
    foodCondition: "Pendant le repas",
    prescribedBy: "Dr. Martin",
    startDate: "2025-06-15",
    atcCode: "A10BA02",
    color: "#0F766E",
  },
  {
    id: "2",
    name: "Amlodipine",
    substance: "Amlodipine bésylate",
    dosage: "5 mg",
    frequency: "1x/jour",
    times: ["08:00"],
    foodCondition: "Indifférent",
    prescribedBy: "Dr. Lefèvre",
    startDate: "2025-03-01",
    atcCode: "C08CA01",
    color: "#1D4ED8",
  },
  {
    id: "3",
    name: "Oméprazole",
    substance: "Oméprazole",
    dosage: "20 mg",
    frequency: "1x/jour",
    times: ["07:30"],
    foodCondition: "Avant le repas",
    prescribedBy: "Dr. Martin",
    startDate: "2025-09-10",
    atcCode: "A02BC01",
    color: "#7C3AED",
  },
  {
    id: "4",
    name: "Atorvastatine",
    substance: "Atorvastatine calcique",
    dosage: "10 mg",
    frequency: "1x/jour",
    times: ["21:00"],
    foodCondition: "Indifférent",
    prescribedBy: "Dr. Lefèvre",
    startDate: "2024-11-20",
    atcCode: "C10AA05",
    color: "#DC2626",
  },
  {
    id: "5",
    name: "Lévothyroxine",
    substance: "Lévothyroxine sodique",
    dosage: "75 µg",
    frequency: "1x/jour",
    times: ["06:30"],
    foodCondition: "À jeun, 30min avant repas",
    prescribedBy: "Dr. Dubois",
    startDate: "2024-01-05",
    atcCode: "H03AA01",
    color: "#EA580C",
  },
];

export const TODAY_DOSES: DoseEntry[] = [
  { id: "d1", medicationId: "5", medicationName: "Lévothyroxine 75µg", time: "06:30", status: "taken", dosage: "75 µg" },
  { id: "d2", medicationId: "3", medicationName: "Oméprazole 20mg", time: "07:30", status: "taken", dosage: "20 mg" },
  { id: "d3", medicationId: "1", medicationName: "Metformine 500mg", time: "08:00", status: "taken", dosage: "500 mg" },
  { id: "d4", medicationId: "2", medicationName: "Amlodipine 5mg", time: "08:00", status: "taken", dosage: "5 mg" },
  { id: "d5", medicationId: "1", medicationName: "Metformine 500mg", time: "20:00", status: "pending", dosage: "500 mg" },
  { id: "d6", medicationId: "4", medicationName: "Atorvastatine 10mg", time: "21:00", status: "pending", dosage: "10 mg" },
];

export const INTERACTIONS: Interaction[] = [
  {
    id: "i1",
    drugA: "Metformine",
    drugB: "Amlodipine",
    severity: "yellow",
    clinicalExplanation: "L'amlodipine peut réduire l'effet hypoglycémiant de la metformine par antagonisme pharmacodynamique. Mécanisme : les inhibiteurs calciques peuvent altérer la sécrétion d'insuline.",
    patientExplanation: "Votre médicament pour la tension pourrait légèrement réduire l'efficacité de votre traitement pour le diabète.",
    recommendation: "Surveillance glycémique renforcée recommandée. Contrôle de la glycémie à jeun toutes les 2 semaines.",
    confidenceScore: 0.87,
    sources: ["Thesaurus ANSM 2024", "EMA SmPC Metformine"],
  },
  {
    id: "i2",
    drugA: "Oméprazole",
    drugB: "Lévothyroxine",
    severity: "yellow",
    clinicalExplanation: "L'oméprazole réduit l'acidité gastrique, ce qui peut diminuer l'absorption de la lévothyroxine. Impact clinique : réduction possible de 20-30% de la biodisponibilité.",
    patientExplanation: "Votre médicament pour l'estomac peut réduire l'absorption de votre traitement thyroïdien.",
    recommendation: "Espacer les prises d'au moins 4 heures. Prendre la lévothyroxine à jeun, 30 minutes avant l'oméprazole. Contrôle TSH dans 6 semaines.",
    confidenceScore: 0.92,
    sources: ["FDA Drug Safety Communication 2023", "Thesaurus ANSM 2024"],
  },
  {
    id: "i3",
    drugA: "Atorvastatine",
    drugB: "Amlodipine",
    severity: "green",
    clinicalExplanation: "L'amlodipine peut augmenter légèrement les concentrations plasmatiques d'atorvastatine via l'inhibition du CYP3A4. Augmentation estimée de 18% de l'AUC.",
    patientExplanation: "L'association de ces deux médicaments est généralement bien tolérée. Risque faible.",
    recommendation: "Pas d'ajustement nécessaire aux doses actuelles. Surveillance standard des enzymes hépatiques.",
    confidenceScore: 0.94,
    sources: ["EMA SmPC Atorvastatine", "British National Formulary"],
  },
];

export const ALIVE_HISTORY: AliveCheck[] = [
  { id: "a1", confirmedAt: "2026-02-27T09:15:00Z", batteryLevel: 85, networkStatus: "wifi", status: "confirmed" },
  { id: "a2", confirmedAt: "2026-02-26T08:42:00Z", batteryLevel: 72, networkStatus: "4g", status: "confirmed" },
  { id: "a3", confirmedAt: "2026-02-25T09:30:00Z", batteryLevel: 91, networkStatus: "wifi", status: "confirmed" },
  { id: "a4", confirmedAt: "2026-02-24T10:05:00Z", batteryLevel: 45, networkStatus: "wifi", status: "confirmed" },
  { id: "a5", confirmedAt: "", batteryLevel: 0, networkStatus: "", status: "missed" },
  { id: "a6", confirmedAt: "2026-02-22T08:20:00Z", batteryLevel: 88, networkStatus: "wifi", status: "confirmed" },
  { id: "a7", confirmedAt: "2026-02-21T09:00:00Z", batteryLevel: 67, networkStatus: "4g", status: "confirmed" },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "e1", name: "Marie Dupont", relationship: "Fille", phone: "+33 6 12 34 56 78", priority: 1 },
  { id: "e2", name: "Pierre Dupont", relationship: "Fils", phone: "+33 6 98 76 54 32", priority: 2 },
  { id: "e3", name: "Dr. Martin", relationship: "Médecin traitant", phone: "+33 1 45 67 89 01", priority: 3 },
];

export const ADHERENCE_DATA = {
  today: 67,
  week: 87,
  month: 91,
  weeklyData: [
    { day: "Lun", percent: 100 },
    { day: "Mar", percent: 75 },
    { day: "Mer", percent: 100 },
    { day: "Jeu", percent: 83 },
    { day: "Ven", percent: 100 },
    { day: "Sam", percent: 67 },
    { day: "Dim", percent: 83 },
  ],
};

export const USER_PROFILE = {
  firstName: "Jean",
  lastName: "Dupont",
  dateOfBirth: "1954-03-15",
  age: 72,
  gender: "Homme",
  email: "jean.dupont@email.fr",
  phone: "+33 6 12 34 56 78",
  address: "14 Rue des Lilas, 75013 Paris",
  bloodType: "A+",
  weight: 78,
  height: 175,
  allergies: ["Pénicilline", "Aspirine"],
  conditions: ["Diabète type 2", "Hypertension", "Hypothyroïdie"],
  primaryDoctor: "Dr. Martin",
  primaryDoctorPhone: "+33 1 45 67 89 01",
  insuranceNumber: "1 54 03 75 013 042 67",
  gdprConsent: true,
  gdprConsentDate: "2025-06-15",
};
