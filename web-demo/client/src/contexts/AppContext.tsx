import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

type Screen =
  | "login"
  | "pillbox"
  | "add-medication"
  | "medication-detail"
  | "interactions"
  | "interaction-results"
  | "alive"
  | "alive-history"
  | "emergency-contacts"
  | "caregiver"
  | "settings"
  | "profile"
  | "patient-detail";

// Tab order for directional slide transitions
const TAB_ORDER: Screen[] = ["pillbox", "interactions", "alive", "caregiver", "settings"];

// Map sub-screens to their parent tab
const PARENT_TAB: Record<string, Screen> = {
  "add-medication": "pillbox",
  "medication-detail": "pillbox",
  "interaction-results": "interactions",
  "alive-history": "alive",
  "emergency-contacts": "alive",
  "profile": "settings",
  "patient-detail": "caregiver",
};

export type SlideDirection = "left" | "right" | "up" | "down" | "none";

interface AppState {
  screen: Screen;
  prevScreen: Screen | null;
  slideDirection: SlideDirection;
  navigate: (s: Screen) => void;
  setScreen: (s: Screen) => void;
  seniorMode: boolean;
  setSeniorMode: (v: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  selectedMedicationId: string | null;
  setSelectedMedicationId: (id: string | null) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

const AppContext = createContext<AppState | null>(null);

function getTabIndex(screen: Screen): number {
  const parent = PARENT_TAB[screen] || screen;
  return TAB_ORDER.indexOf(parent);
}

function isSubScreen(screen: Screen): boolean {
  return screen in PARENT_TAB;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreenRaw] = useState<Screen>("login");
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("none");
  const [seniorMode, setSeniorMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const currentScreenRef = useRef<Screen>("login");

  const navigate = useCallback((target: Screen) => {
    const current = currentScreenRef.current;
    if (target === current) return;

    // Determine slide direction
    let direction: SlideDirection = "none";

    const currentIsSubScreen = isSubScreen(current);
    const targetIsSubScreen = isSubScreen(target);
    const currentParent = PARENT_TAB[current] || current;
    const targetParent = PARENT_TAB[target] || target;

    if (current === "login" || target === "login") {
      // Login transitions: fade (no slide)
      direction = "none";
    } else if (currentParent === targetParent) {
      // Same tab: sub-screen navigation (push up / pop down)
      if (targetIsSubScreen && !currentIsSubScreen) {
        direction = "up"; // Going deeper
      } else if (!targetIsSubScreen && currentIsSubScreen) {
        direction = "down"; // Going back
      } else {
        direction = "up";
      }
    } else {
      // Different tabs: horizontal slide based on tab order
      const currentIdx = getTabIndex(current);
      const targetIdx = getTabIndex(target);
      direction = targetIdx > currentIdx ? "left" : "right";
    }

    setPrevScreen(current);
    setSlideDirection(direction);
    currentScreenRef.current = target;
    setScreenRaw(target);
  }, []);

  // Keep setScreen as a simple setter for backward compat (login flow)
  const setScreen = useCallback((s: Screen) => {
    currentScreenRef.current = s;
    setPrevScreen(null);
    setSlideDirection("none");
    setScreenRaw(s);
  }, []);

  return (
    <AppContext.Provider
      value={{
        screen,
        prevScreen,
        slideDirection,
        navigate,
        setScreen,
        seniorMode,
        setSeniorMode,
        isLoggedIn,
        setIsLoggedIn,
        selectedMedicationId,
        setSelectedMedicationId,
        selectedPatientId,
        setSelectedPatientId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
