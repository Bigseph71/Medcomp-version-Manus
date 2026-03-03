import { useApp } from "@/contexts/AppContext";
import { Pill, Search, Heart, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { id: "pillbox" as const, label: "Pilulier", icon: Pill },
  { id: "interactions" as const, label: "Interactions", icon: Search },
  { id: "alive" as const, label: "Je vais bien", icon: Heart },
  { id: "caregiver" as const, label: "Soignant", icon: Users },
  { id: "settings" as const, label: "Réglages", icon: Settings },
];

export default function BottomNav() {
  const { screen, navigate, seniorMode } = useApp();

  const activeTab = ["pillbox", "add-medication", "medication-detail"].includes(screen)
    ? "pillbox"
    : ["interactions", "interaction-results"].includes(screen)
      ? "interactions"
      : ["alive", "alive-history", "emergency-contacts"].includes(screen)
        ? "alive"
        : screen;

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
                seniorMode ? "min-w-[64px]" : "min-w-[52px]"
              } ${
                isActive
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={seniorMode ? 28 : 22}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`${
                  seniorMode ? "text-[11px]" : "text-[10px]"
                } font-medium leading-tight`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
