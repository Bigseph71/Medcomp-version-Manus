import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Clock, History, Phone, Battery, Wifi, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AliveScreen() {
  const { navigate, seniorMode } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [pressing, setPressing] = useState(false);

  const handleConfirm = () => {
    setPressing(true);
    setTimeout(() => {
      setConfirmed(true);
      setPressing(false);
      toast.success("Confirmation envoyée !", {
        description: "Vos proches ont été informés que vous allez bien.",
      });
    }, 600);
  };

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className={`font-bold ${seniorMode ? "text-2xl" : "text-xl"} text-foreground`}>
          Confirmation de vie
        </h1>
        <p className={`text-muted-foreground ${seniorMode ? "text-base" : "text-sm"} mt-1`}>
          Confirmez que vous allez bien
        </p>
      </div>

      {/* Senior Illustration */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-5">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/99955022/NGFvRfTFnJq8UurqmiLfoY/medcom-senior-2Ey6R4Lq6fB83iJiFDsmGC.webp"
          alt="Senior utilisant l'application"
          className="w-40 h-40 rounded-2xl mx-auto object-cover shadow-lg border-2 border-white"
        />
      </motion.div>

      {/* Big Alive Button */}
      <div className="flex justify-center mb-6">
        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.button
              key="alive-btn"
              onClick={handleConfirm}
              onTouchStart={() => setPressing(true)}
              onTouchEnd={() => setPressing(false)}
              className={`alive-pulse w-48 h-48 rounded-full bg-gradient-to-br from-[oklch(0.65_0.17_145)] to-[oklch(0.55_0.15_145)] text-white flex flex-col items-center justify-center shadow-xl border-4 border-white transition-transform ${
                pressing ? "scale-95" : "hover:scale-105"
              } ${seniorMode ? "w-56 h-56" : ""}`}
              whileTap={{ scale: 0.92 }}
              aria-label="Confirmer que je vais bien"
            >
              <Heart size={seniorMode ? 56 : 48} fill="white" className="mb-2" />
              <span className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>
                Je vais bien
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="confirmed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-48 h-48 rounded-full bg-gradient-to-br from-[oklch(0.65_0.17_145)] to-[oklch(0.50_0.15_145)] text-white flex flex-col items-center justify-center shadow-xl border-4 border-white ${
                seniorMode ? "w-56 h-56" : ""
              }`}
            >
              <CheckCircle size={seniorMode ? 56 : 48} className="mb-2" />
              <span className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>
                Confirmé !
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Info */}
      <Card className="border-2 shadow-sm mb-4">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <Clock size={18} className="mx-auto text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground">Prochaine</p>
              <p className={`font-bold ${seniorMode ? "text-sm" : "text-xs"}`}>
                {confirmed ? "Demain 09:00" : "Aujourd'hui"}
              </p>
            </div>
            <div>
              <Battery size={18} className="mx-auto text-[oklch(0.65_0.17_145)] mb-1" />
              <p className="text-[10px] text-muted-foreground">Batterie</p>
              <p className={`font-bold ${seniorMode ? "text-sm" : "text-xs"}`}>85%</p>
            </div>
            <div>
              <Wifi size={18} className="mx-auto text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground">Réseau</p>
              <p className={`font-bold ${seniorMode ? "text-sm" : "text-xs"}`}>WiFi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("alive-history")}
          className="h-14 rounded-xl border-2 flex items-center gap-2"
        >
          <History size={18} />
          <span className={seniorMode ? "text-base" : "text-sm"}>Historique</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("emergency-contacts")}
          className="h-14 rounded-xl border-2 flex items-center gap-2"
        >
          <Phone size={18} />
          <span className={seniorMode ? "text-base" : "text-sm"}>Contacts</span>
        </Button>
      </div>

      {/* Escalation Info */}
      <Card className="border-2 border-[oklch(0.80_0.15_85)]/50 bg-[oklch(0.97_0.03_85)] mt-4">
        <CardContent className="p-3">
          <p className={`font-semibold ${seniorMode ? "text-sm" : "text-xs"} text-[oklch(0.40_0.12_85)] mb-1`}>
            Workflow d'escalation actif
          </p>
          <p className="text-[11px] text-[oklch(0.50_0.12_85)] leading-relaxed">
            Si vous ne confirmez pas dans les 24h : notification push → SMS à vos proches →
            appel automatique → transmission GPS → alerte d'urgence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
