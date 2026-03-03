import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EMERGENCY_CONTACTS } from "@/lib/demo-data";
import { ArrowLeft, Phone, Plus, User, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function EmergencyContactsScreen() {
  const { navigate, seniorMode } = useApp();

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="outline" size="icon" onClick={() => navigate("alive")} className="h-10 w-10 rounded-xl border-2">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className={`font-bold ${seniorMode ? "text-xl" : "text-lg"}`}>Contacts d'urgence</h1>
        </div>
        <Button
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-xl border-2"
          onClick={() => toast.info("Fonctionnalité bientôt disponible")}
        >
          <Plus size={20} />
        </Button>
      </div>

      <p className={`text-muted-foreground ${seniorMode ? "text-sm" : "text-xs"} mb-4`}>
        Ces personnes seront contactées par ordre de priorité si vous ne confirmez pas votre état dans les délais.
      </p>

      <div className="space-y-3">
        {EMERGENCY_CONTACTS.map((contact, i) => (
          <motion.div key={contact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-2 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 relative">
                  <User size={24} className="text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {contact.priority}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`font-bold ${seniorMode ? "text-base" : "text-sm"}`}>{contact.name}</p>
                    {contact.priority === 1 && <Star size={14} className="text-[oklch(0.80_0.15_85)] fill-[oklch(0.80_0.15_85)]" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                  <p className={`${seniorMode ? "text-sm" : "text-xs"} font-medium text-primary mt-0.5`}>{contact.phone}</p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-xl border-2 shrink-0"
                  onClick={() => toast.info("Appel simulé", { description: `Appel vers ${contact.name}` })}
                >
                  <Phone size={18} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
