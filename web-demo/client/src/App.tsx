import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import AnimatedScreen from "./components/AnimatedScreen";
import LoginScreen from "./pages/LoginScreen";
import PillboxScreen from "./pages/PillboxScreen";
import AddMedicationScreen from "./pages/AddMedicationScreen";
import MedicationDetailScreen from "./pages/MedicationDetailScreen";
import InteractionsScreen from "./pages/InteractionsScreen";
import InteractionResultsScreen from "./pages/InteractionResultsScreen";
import AliveScreen from "./pages/AliveScreen";
import AliveHistoryScreen from "./pages/AliveHistoryScreen";
import EmergencyContactsScreen from "./pages/EmergencyContactsScreen";
import CaregiverScreen from "./pages/CaregiverScreen";
import SettingsScreen from "./pages/SettingsScreen";
import ProfileScreen from "./pages/ProfileScreen";
import PatientDetailScreen from "./pages/PatientDetailScreen";
import BottomNav from "./components/BottomNav";
import { AnimatePresence, motion } from "framer-motion";

function ScreenRouter() {
  const { screen, isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <LoginScreen />
        </motion.div>
      </AnimatePresence>
    );
  }

  const screens: Record<string, React.ReactNode> = {
    pillbox: <PillboxScreen />,
    "add-medication": <AddMedicationScreen />,
    "medication-detail": <MedicationDetailScreen />,
    interactions: <InteractionsScreen />,
    "interaction-results": <InteractionResultsScreen />,
    alive: <AliveScreen />,
    "alive-history": <AliveHistoryScreen />,
    "emergency-contacts": <EmergencyContactsScreen />,
    caregiver: <CaregiverScreen />,
    settings: <SettingsScreen />,
    profile: <ProfileScreen />,
    "patient-detail": <PatientDetailScreen />,
  };

  return (
    <div className="phone-frame bg-background">
      <div className="h-full overflow-hidden relative">
        <AnimatedScreen screenKey={screen}>
          {screens[screen] || <PillboxScreen />}
        </AnimatedScreen>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppProvider>
            <div className="min-h-screen bg-[oklch(0.92_0.01_180)] flex items-start justify-center">
              <Toaster position="top-center" />
              <ScreenRouter />
            </div>
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
