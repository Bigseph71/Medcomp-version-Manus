import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, ScanBarcode, Camera, Keyboard } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AddMedicationScreen() {
  const { navigate, seniorMode } = useApp();

  const handleAdd = () => {
    toast.success("Médicament ajouté !", { description: "Metformine 500mg a été ajouté à votre pilulier." });
    navigate("pillbox");
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("pillbox")} className="h-10 w-10 rounded-xl border-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Ajouter un médicament</h1>
      </div>

      {/* Search Methods */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Search, label: "Rechercher", desc: "Par nom" },
          { icon: ScanBarcode, label: "Code-barres", desc: "Scanner" },
          { icon: Camera, label: "Ordonnance", desc: "Photo OCR" },
        ].map((method, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card
              className="border-2 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
              onClick={() => toast.info("Fonctionnalité bientôt disponible", { description: "Cette fonctionnalité sera disponible dans la version complète." })}
            >
              <CardContent className="p-3 text-center">
                <method.icon size={seniorMode ? 28 : 24} className="mx-auto mb-1.5 text-primary" />
                <p className={`font-semibold ${seniorMode ? "text-sm" : "text-xs"}`}>{method.label}</p>
                <p className="text-[10px] text-muted-foreground">{method.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Manual Entry */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-2 mb-4">
          <Keyboard size={18} className="text-primary" />
          <h2 className={`font-bold ${seniorMode ? "text-lg" : "text-base"}`}>Saisie manuelle</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Nom du médicament</Label>
            <Input placeholder="Ex: Metformine" className="h-12 border-2 text-base" defaultValue="Metformine" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Dosage</Label>
              <Input placeholder="500" className="h-12 border-2 text-base" defaultValue="500" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Unité</Label>
              <Input placeholder="mg" className="h-12 border-2 text-base" defaultValue="mg" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Fréquence</Label>
            <div className="grid grid-cols-3 gap-2">
              {["1x/jour", "2x/jour", "3x/jour"].map((f, i) => (
                <Button key={f} variant={i === 1 ? "default" : "outline"} className={`h-11 border-2 rounded-xl ${i === 1 ? "bg-primary text-white" : ""}`}>
                  {f}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Condition alimentaire</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Pendant le repas", "Avant le repas", "Après le repas", "Indifférent"].map((c, i) => (
                <Button key={c} variant={i === 0 ? "default" : "outline"} size="sm" className={`h-10 border-2 rounded-xl text-xs ${i === 0 ? "bg-primary text-white" : ""}`}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Médecin prescripteur (optionnel)</Label>
            <Input placeholder="Dr. Martin" className="h-12 border-2 text-base" />
          </div>

          <Button onClick={handleAdd} className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white mt-2">
            Ajouter le médicament
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
