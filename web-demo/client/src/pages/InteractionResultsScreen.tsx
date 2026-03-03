import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INTERACTIONS } from "@/lib/demo-data";
import { ArrowLeft, AlertTriangle, CheckCircle, Info, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    green: { label: "Faible", className: "severity-green" },
    yellow: { label: "Modéré", className: "severity-yellow" },
    red: { label: "Critique", className: "severity-red" },
  }[severity] || { label: severity, className: "" };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
      {severity === "red" && <AlertTriangle size={12} className="mr-1" />}
      {severity === "yellow" && <Info size={12} className="mr-1" />}
      {severity === "green" && <CheckCircle size={12} className="mr-1" />}
      {config.label}
    </span>
  );
}

export default function InteractionResultsScreen() {
  const { navigate, seniorMode } = useApp();

  const summary = {
    total: INTERACTIONS.length,
    critical: INTERACTIONS.filter((i) => i.severity === "red").length,
    moderate: INTERACTIONS.filter((i) => i.severity === "yellow").length,
    low: INTERACTIONS.filter((i) => i.severity === "green").length,
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="outline" size="icon" onClick={() => navigate("interactions")} className="h-10 w-10 rounded-xl border-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Résultats d'analyse</h1>
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 shadow-md mb-5">
          <CardContent className="p-4">
            <p className={`font-bold ${seniorMode ? "text-lg" : "text-base"} mb-3`}>
              {summary.total} interaction{summary.total > 1 ? "s" : ""} détectée{summary.total > 1 ? "s" : ""}
            </p>
            <div className="flex gap-3">
              {[
                { count: summary.critical, label: "Critique", cls: "severity-red" },
                { count: summary.moderate, label: "Modéré", cls: "severity-yellow" },
                { count: summary.low, label: "Faible", cls: "severity-green" },
              ].map((s, i) => (
                <div key={i} className={`flex-1 text-center py-2 rounded-xl ${s.cls}`}>
                  <p className={`font-bold ${seniorMode ? "text-2xl" : "text-xl"}`}>{s.count}</p>
                  <p className="text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interaction Cards */}
      <div className="space-y-3 pb-4">
        {INTERACTIONS.map((interaction, i) => (
          <motion.div
            key={interaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border-2 shadow-sm ${
              interaction.severity === "red" ? "border-[oklch(0.60_0.22_25)]/50" :
              interaction.severity === "yellow" ? "border-[oklch(0.80_0.15_85)]/50" :
              "border-[oklch(0.65_0.17_145)]/50"
            }`}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-bold ${seniorMode ? "text-base" : "text-sm"}`}>
                      {interaction.drugA} + {interaction.drugB}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confiance: {Math.round(interaction.confidenceScore * 100)}%
                    </p>
                  </div>
                  <SeverityBadge severity={interaction.severity} />
                </div>

                {/* Patient Explanation */}
                <div className="bg-accent/50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                    <Info size={12} /> Pour vous
                  </p>
                  <p className={`${seniorMode ? "text-sm" : "text-xs"} text-foreground leading-relaxed`}>
                    {interaction.patientExplanation}
                  </p>
                </div>

                {/* Clinical Explanation */}
                <details className="group">
                  <summary className="text-xs font-semibold text-muted-foreground cursor-pointer flex items-center gap-1 mb-2">
                    <BookOpen size={12} /> Détails cliniques
                  </summary>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {interaction.clinicalExplanation}
                  </p>
                </details>

                {/* Recommendation */}
                <div className="border-t-2 border-border pt-3 mt-2">
                  <p className="text-xs font-semibold text-foreground mb-1">Recommandation :</p>
                  <p className={`${seniorMode ? "text-sm" : "text-xs"} text-foreground leading-relaxed`}>
                    {interaction.recommendation}
                  </p>
                </div>

                {/* Sources */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {interaction.sources.map((s, j) => (
                    <span key={j} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="border-2 border-[oklch(0.80_0.15_85)] bg-[oklch(0.97_0.03_85)] mb-4">
        <CardContent className="p-3">
          <p className="text-xs text-[oklch(0.40_0.12_85)] leading-relaxed">
            <strong>Avertissement :</strong> Cet outil ne remplace pas un avis médical professionnel.
            Consultez toujours votre médecin ou pharmacien avant de modifier votre traitement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
