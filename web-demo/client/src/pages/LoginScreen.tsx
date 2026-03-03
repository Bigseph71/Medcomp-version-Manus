import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, Pill, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginScreen() {
  const { setIsLoggedIn, setScreen } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
      setScreen("pillbox");
    }, 800);
  };

  return (
    <div className="phone-frame bg-background">
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[oklch(0.45_0.11_180)] to-[oklch(0.38_0.09_180)] px-6 pt-14 pb-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">MedCom</h1>
            <p className="text-white/80 mt-2 text-base font-[var(--font-body)]">
              Sécurité médicamenteuse & Protection des seniors
            </p>
          </motion.div>
        </div>

        {/* Features */}
        <div className="px-6 -mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="border-2 shadow-lg">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {[
                    { icon: Pill, label: "Pilulier", color: "text-[oklch(0.45_0.11_180)]" },
                    { icon: Shield, label: "Interactions", color: "text-[oklch(0.80_0.15_85)]" },
                    { icon: Heart, label: "Protection", color: "text-[oklch(0.60_0.22_25)]" },
                  ].map((f, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className={`${f.color} mx-auto mb-1`}>
                        <f.icon size={24} className="mx-auto" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="px-6 mt-6 pb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Connexion</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@email.fr"
                defaultValue="jean.dupont@email.fr"
                className="h-12 text-base border-2 focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-1.5 block">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue="demo1234"
                  className="h-12 text-base border-2 focus:border-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-14 text-lg font-semibold rounded-xl bg-[oklch(0.45_0.11_180)] hover:bg-[oklch(0.40_0.11_180)] text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
              En vous connectant, vous acceptez nos conditions d'utilisation
              et notre politique de confidentialité conforme au RGPD.
            </p>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <button className="text-primary font-semibold hover:underline">
                  S'inscrire
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
