import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALIVE_HISTORY } from "@/lib/demo-data";
import { ArrowLeft, CheckCircle, XCircle, Battery, Wifi } from "lucide-react";
import { motion } from "framer-motion";

export default function AliveHistoryScreen() {
  const { navigate, seniorMode } = useApp();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  };
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="outline" size="icon" onClick={() => navigate("alive")} className="h-10 w-10 rounded-xl border-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Historique</h1>
      </div>

      <div className="space-y-2.5">
        {ALIVE_HISTORY.map((check, i) => (
          <motion.div key={check.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`border-2 ${check.status === "confirmed" ? "border-[oklch(0.65_0.17_145)]/30" : "border-[oklch(0.60_0.22_25)]/30"}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  check.status === "confirmed" ? "bg-[oklch(0.95_0.05_145)]" : "bg-[oklch(0.95_0.05_25)]"
                }`}>
                  {check.status === "confirmed" ? (
                    <CheckCircle size={20} className="text-[oklch(0.45_0.15_145)]" />
                  ) : (
                    <XCircle size={20} className="text-[oklch(0.50_0.20_25)]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${seniorMode ? "text-base" : "text-sm"}`}>
                    {check.status === "confirmed" ? "Confirmé" : "Manqué"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(check.confirmedAt)} à {formatTime(check.confirmedAt)}
                  </p>
                </div>
                {check.status === "confirmed" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Battery size={14} /> {check.batteryLevel}%
                    <Wifi size={14} /> {check.networkStatus}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
