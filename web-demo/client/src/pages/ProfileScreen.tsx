import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { USER_PROFILE, EMERGENCY_CONTACTS, type EmergencyContact } from "@/lib/demo-data";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Droplets,
  Ruler,
  Weight,
  Stethoscope,
  AlertCircle,
  Shield,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Star,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Section Component ──────────────────────────────────────────────────────
function ProfileSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  seniorMode,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  seniorMode: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon size={14} className="text-primary" />
          </div>
          <h2
            className={`font-bold uppercase tracking-wider ${
              seniorMode ? "text-sm" : "text-xs"
            } text-muted-foreground group-hover:text-foreground transition-colors`}
          >
            {title}
          </h2>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Info Row ───────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  seniorMode,
  editing,
  editValue,
  onEditChange,
  type = "text",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  seniorMode: boolean;
  editing: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-accent/20 transition-colors rounded-lg">
      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        {editing && onEditChange ? (
          <Input
            value={editValue ?? value}
            onChange={(e) => onEditChange(e.target.value)}
            type={type}
            className="h-9 mt-1 border-2 text-sm focus:border-primary"
          />
        ) : (
          <p
            className={`font-semibold ${
              seniorMode ? "text-base" : "text-sm"
            } text-foreground truncate`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Contact Card ───────────────────────────────────────────────────────────
function ContactCard({
  contact,
  seniorMode,
  editing,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  contact: EmergencyContact;
  seniorMode: boolean;
  editing: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <Card
      className={`border-2 shadow-sm transition-all ${
        contact.priority === 1
          ? "border-primary/30 bg-primary/[0.03]"
          : ""
      }`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {editing && (
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-0.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
            >
              <ChevronUp size={14} />
            </button>
            <GripVertical size={14} className="text-muted-foreground mx-auto" />
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-0.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}
        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0 relative">
          <User size={22} className="text-primary" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
            {contact.priority}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className={`font-bold ${
                seniorMode ? "text-base" : "text-sm"
              } truncate`}
            >
              {contact.name}
            </p>
            {contact.priority === 1 && (
              <Star
                size={13}
                className="text-[oklch(0.80_0.15_85)] fill-[oklch(0.80_0.15_85)] shrink-0"
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{contact.relationship}</p>
          <p
            className={`${
              seniorMode ? "text-sm" : "text-xs"
            } font-medium text-primary mt-0.5`}
          >
            {contact.phone}
          </p>
        </div>
        {editing ? (
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-lg border-2 border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-lg border-2 shrink-0"
            onClick={() =>
              toast.info("Appel simulé", {
                description: `Appel vers ${contact.name}`,
              })
            }
          >
            <Phone size={16} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Profile Screen ────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { navigate, seniorMode } = useApp();
  const [editing, setEditing] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    ...EMERGENCY_CONTACTS,
  ]);

  // Editable profile fields
  const [profile, setProfile] = useState({
    firstName: USER_PROFILE.firstName,
    lastName: USER_PROFILE.lastName,
    email: USER_PROFILE.email,
    phone: USER_PROFILE.phone,
    address: USER_PROFILE.address,
    weight: String(USER_PROFILE.weight),
    height: String(USER_PROFILE.height),
    primaryDoctor: USER_PROFILE.primaryDoctor,
    primaryDoctorPhone: USER_PROFILE.primaryDoctorPhone,
  });

  const updateField = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setEditing(false);
    toast.success("Profil mis à jour", {
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setProfile({
      firstName: USER_PROFILE.firstName,
      lastName: USER_PROFILE.lastName,
      email: USER_PROFILE.email,
      phone: USER_PROFILE.phone,
      address: USER_PROFILE.address,
      weight: String(USER_PROFILE.weight),
      height: String(USER_PROFILE.height),
      primaryDoctor: USER_PROFILE.primaryDoctor,
      primaryDoctorPhone: USER_PROFILE.primaryDoctorPhone,
    });
    setContacts([...EMERGENCY_CONTACTS]);
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.map((c, i) => ({ ...c, priority: i + 1 }));
    });
    toast("Contact supprimé");
  };

  const moveContact = (index: number, direction: "up" | "down") => {
    setContacts((prev) => {
      const arr = [...prev];
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return arr.map((c, i) => ({ ...c, priority: i + 1 }));
    });
  };

  const addContact = () => {
    const newContact: EmergencyContact = {
      id: `e${Date.now()}`,
      name: "Nouveau contact",
      relationship: "À définir",
      phone: "+33 6 00 00 00 00",
      priority: contacts.length + 1,
    };
    setContacts((prev) => [...prev, newContact]);
    toast.info("Contact ajouté", {
      description: "Modifiez ses informations dans la version complète.",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="px-4 pt-6 pb-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("settings")}
            className="h-10 w-10 rounded-xl border-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>
            Mon profil
          </h1>
        </div>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="h-9 rounded-lg border-2 gap-1.5"
          >
            <Edit3 size={14} />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCancel}
              className="h-9 w-9 rounded-lg border-2"
            >
              <X size={16} />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-9 rounded-lg gap-1.5 bg-primary text-white"
            >
              <Save size={14} />
              Sauver
            </Button>
          </div>
        )}
      </div>

      {/* Avatar & Name Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="border-2 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[oklch(0.45_0.11_180)] to-[oklch(0.38_0.09_180)] px-5 py-6">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30 shadow-lg"
                style={{ width: "72px", height: "72px" }}
              >
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <div className="text-white">
                {editing ? (
                  <div className="flex gap-2">
                    <Input
                      value={profile.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className="h-8 w-24 bg-white/20 border-white/30 text-white placeholder:text-white/50 text-sm"
                      placeholder="Prénom"
                    />
                    <Input
                      value={profile.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className="h-8 w-24 bg-white/20 border-white/30 text-white placeholder:text-white/50 text-sm"
                      placeholder="Nom"
                    />
                  </div>
                ) : (
                  <h2
                    className={`font-bold ${
                      seniorMode ? "text-2xl" : "text-xl"
                    }`}
                  >
                    {profile.firstName} {profile.lastName}
                  </h2>
                )}
                <p className="text-white/70 text-sm mt-0.5">
                  {USER_PROFILE.age} ans · {USER_PROFILE.gender}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {USER_PROFILE.conditions.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Personal Information ─────────────────────────────────────── */}
      <ProfileSection
        title="Informations personnelles"
        icon={User}
        seniorMode={seniorMode}
        delay={0.05}
      >
        <Card className="border-2 mb-5">
          <CardContent className="p-1 divide-y divide-border">
            <InfoRow
              icon={Calendar}
              label="Date de naissance"
              value={formatDate(USER_PROFILE.dateOfBirth)}
              seniorMode={seniorMode}
              editing={false}
            />
            <InfoRow
              icon={Mail}
              label="Email"
              value={profile.email}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.email}
              onEditChange={(v) => updateField("email", v)}
              type="email"
            />
            <InfoRow
              icon={Phone}
              label="Téléphone"
              value={profile.phone}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.phone}
              onEditChange={(v) => updateField("phone", v)}
              type="tel"
            />
            <InfoRow
              icon={MapPin}
              label="Adresse"
              value={profile.address}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.address}
              onEditChange={(v) => updateField("address", v)}
            />
            <InfoRow
              icon={FileText}
              label="N° Sécurité sociale"
              value={USER_PROFILE.insuranceNumber}
              seniorMode={seniorMode}
              editing={false}
            />
          </CardContent>
        </Card>
      </ProfileSection>

      {/* ── Medical Information ──────────────────────────────────────── */}
      <ProfileSection
        title="Informations médicales"
        icon={Heart}
        seniorMode={seniorMode}
        delay={0.1}
      >
        <Card className="border-2 mb-5">
          <CardContent className="p-1 divide-y divide-border">
            <InfoRow
              icon={Droplets}
              label="Groupe sanguin"
              value={USER_PROFILE.bloodType}
              seniorMode={seniorMode}
              editing={false}
            />
            <InfoRow
              icon={Weight}
              label="Poids"
              value={`${profile.weight} kg`}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.weight}
              onEditChange={(v) => updateField("weight", v)}
              type="number"
            />
            <InfoRow
              icon={Ruler}
              label="Taille"
              value={`${profile.height} cm`}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.height}
              onEditChange={(v) => updateField("height", v)}
              type="number"
            />
            <div className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[oklch(0.95_0.05_25)] flex items-center justify-center shrink-0">
                  <AlertCircle size={16} className="text-[oklch(0.55_0.20_25)]" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Allergies
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 ml-12">
                {USER_PROFILE.allergies.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.18_25)] px-3 py-1 rounded-full font-semibold border border-[oklch(0.85_0.10_25)]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Heart size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Pathologies
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 ml-12">
                {USER_PROFILE.conditions.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold border border-border"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </ProfileSection>

      {/* ── Primary Doctor ───────────────────────────────────────────── */}
      <ProfileSection
        title="Médecin traitant"
        icon={Stethoscope}
        seniorMode={seniorMode}
        delay={0.15}
      >
        <Card className="border-2 mb-5">
          <CardContent className="p-1 divide-y divide-border">
            <InfoRow
              icon={Stethoscope}
              label="Nom"
              value={profile.primaryDoctor}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.primaryDoctor}
              onEditChange={(v) => updateField("primaryDoctor", v)}
            />
            <InfoRow
              icon={Phone}
              label="Téléphone"
              value={profile.primaryDoctorPhone}
              seniorMode={seniorMode}
              editing={editing}
              editValue={profile.primaryDoctorPhone}
              onEditChange={(v) => updateField("primaryDoctorPhone", v)}
              type="tel"
            />
          </CardContent>
        </Card>
      </ProfileSection>

      {/* ── Emergency Contacts ───────────────────────────────────────── */}
      <ProfileSection
        title="Contacts d'urgence"
        icon={Phone}
        seniorMode={seniorMode}
        delay={0.2}
      >
        <p
          className={`text-muted-foreground ${
            seniorMode ? "text-sm" : "text-xs"
          } mb-3`}
        >
          Contactés par ordre de priorité en cas de non-réponse à la
          confirmation de vie.
        </p>

        <div className="space-y-2.5 mb-4">
          <AnimatePresence>
            {contacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <ContactCard
                  contact={contact}
                  seniorMode={seniorMode}
                  editing={editing}
                  onDelete={() => deleteContact(contact.id)}
                  onMoveUp={() => moveContact(i, "up")}
                  onMoveDown={() => moveContact(i, "down")}
                  isFirst={i === 0}
                  isLast={i === contacts.length - 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="outline"
              onClick={addContact}
              className="w-full h-12 rounded-xl border-2 border-dashed text-muted-foreground hover:text-primary hover:border-primary flex items-center gap-2 mb-5"
            >
              <Plus size={18} />
              Ajouter un contact d'urgence
            </Button>
          </motion.div>
        )}

        {!editing && <div className="mb-5" />}
      </ProfileSection>

      {/* ── GDPR Info ────────────────────────────────────────────────── */}
      <ProfileSection
        title="Données & Confidentialité"
        icon={Shield}
        seniorMode={seniorMode}
        defaultOpen={false}
        delay={0.25}
      >
        <Card className="border-2 border-[oklch(0.80_0.15_85)]/40 bg-[oklch(0.97_0.03_85)] mb-5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield
                size={20}
                className="text-[oklch(0.50_0.12_85)] shrink-0 mt-0.5"
              />
              <div>
                <p
                  className={`font-semibold ${
                    seniorMode ? "text-sm" : "text-xs"
                  } text-[oklch(0.35_0.10_85)] mb-1`}
                >
                  Consentement RGPD actif
                </p>
                <p className="text-[11px] text-[oklch(0.50_0.10_85)] leading-relaxed mb-2">
                  Vous avez donné votre consentement le{" "}
                  {formatDate(USER_PROFILE.gdprConsentDate)}. Vos données de
                  santé sont chiffrées (AES-256) et stockées conformément au
                  RGPD et au règlement MDR.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs rounded-lg border-[oklch(0.80_0.15_85)] text-[oklch(0.40_0.10_85)]"
                    onClick={() =>
                      toast.info("Export de données", {
                        description:
                          "Votre export sera prêt dans la version complète.",
                      })
                    }
                  >
                    Exporter mes données
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs rounded-lg border-destructive/30 text-destructive"
                    onClick={() =>
                      toast.info("Suppression de compte", {
                        description:
                          "Cette fonctionnalité sera disponible dans la version complète.",
                      })
                    }
                  >
                    Supprimer mon compte
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ProfileSection>
    </div>
  );
}
