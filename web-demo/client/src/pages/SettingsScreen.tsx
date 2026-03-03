import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { USER_PROFILE } from "@/lib/demo-data";
import {
  Settings,
  User,
  Eye,
  Bell,
  Shield,
  Globe,
  FileText,
  LogOut,
  ChevronRight,
  Accessibility,
  Fingerprint,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SettingsScreen() {
  const { seniorMode, setSeniorMode, setIsLoggedIn, setScreen, navigate } = useApp();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen("login");
    toast.success("Déconnexion réussie");
  };

  const settingsGroups = [
    {
      title: "Accessibilité",
      items: [
        {
          icon: Accessibility,
          label: "Mode Senior",
          description: "Textes plus grands, boutons plus larges",
          toggle: true,
          value: seniorMode,
          onChange: () => setSeniorMode(!seniorMode),
        },
        {
          icon: Eye,
          label: "Haut contraste",
          description: "Améliore la lisibilité",
          toggle: true,
          value: false,
          onChange: () => toast.info("Fonctionnalité bientôt disponible"),
        },
      ],
    },
    {
      title: "Sécurité",
      items: [
        {
          icon: Fingerprint,
          label: "Authentification biométrique",
          description: "FaceID / Empreinte digitale",
          toggle: true,
          value: true,
          onChange: () => toast.info("Fonctionnalité bientôt disponible"),
        },
        {
          icon: Shield,
          label: "Chiffrement des données",
          description: "AES-256 activé",
          toggle: false,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Rappels de médicaments",
          description: "Push + SMS",
          toggle: true,
          value: true,
          onChange: () => toast.info("Fonctionnalité bientôt disponible"),
        },
        {
          icon: Bell,
          label: "Alertes d'interactions",
          description: "Notifications immédiates",
          toggle: true,
          value: true,
          onChange: () => toast.info("Fonctionnalité bientôt disponible"),
        },
      ],
    },
    {
      title: "Légal & Conformité",
      items: [
        {
          icon: FileText,
          label: "Politique de confidentialité",
          description: "RGPD conforme",
          toggle: false,
        },
        {
          icon: Globe,
          label: "Langue",
          description: "Français",
          toggle: false,
        },
      ],
    },
  ];

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Settings size={20} className="text-primary" />
        <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Réglages</h1>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 shadow-md mb-5 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("profile")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              {USER_PROFILE.firstName[0]}{USER_PROFILE.lastName[0]}
            </div>
            <div className="flex-1">
              <p className={`font-bold ${seniorMode ? "text-lg" : "text-base"}`}>
                {USER_PROFILE.firstName} {USER_PROFILE.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{USER_PROFILE.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {USER_PROFILE.conditions.map((c, i) => (
                  <span key={i} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Groups */}
      <div className="space-y-5 pb-4">
        {settingsGroups.map((group, gi) => (
          <motion.div
            key={gi}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
          >
            <h2 className={`font-bold ${seniorMode ? "text-base" : "text-sm"} text-muted-foreground mb-2 uppercase tracking-wider text-xs`}>
              {group.title}
            </h2>
            <Card className="border-2">
              <CardContent className="p-0 divide-y-2 divide-border">
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors"
                    onClick={item.toggle ? undefined : () => toast.info("Fonctionnalité bientôt disponible")}
                    role={item.toggle ? undefined : "button"}
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${seniorMode ? "text-base" : "text-sm"}`}>{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {item.toggle ? (
                      <Switch checked={item.value} onCheckedChange={item.onChange} />
                    ) : (
                      <ChevronRight size={16} className="text-muted-foreground" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full h-12 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-2 mb-4"
      >
        <LogOut size={18} />
        Se déconnecter
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        MedCom v1.0.0 — Démo interactive
      </p>
    </div>
  );
}
