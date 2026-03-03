import { AnimatePresence, motion } from "framer-motion";
import { useApp, type SlideDirection } from "@/contexts/AppContext";
import type { ReactNode } from "react";

const slideVariants = {
  // Horizontal: left means content slides from right to left (new screen enters from right)
  left: {
    initial: { x: "100%", opacity: 0.5 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-30%", opacity: 0 },
  },
  // Horizontal: right means content slides from left to right (new screen enters from left)
  right: {
    initial: { x: "-100%", opacity: 0.5 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "30%", opacity: 0 },
  },
  // Vertical: up means pushing a sub-screen (enters from bottom)
  up: {
    initial: { y: "60%", opacity: 0, scale: 0.95 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: "-15%", opacity: 0, scale: 0.98 },
  },
  // Vertical: down means popping back (enters from top)
  down: {
    initial: { y: "-30%", opacity: 0, scale: 0.98 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: "40%", opacity: 0, scale: 0.95 },
  },
  // No direction: simple fade
  none: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const fadeTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

interface AnimatedScreenProps {
  screenKey: string;
  children: ReactNode;
}

export default function AnimatedScreen({ screenKey, children }: AnimatedScreenProps) {
  const { slideDirection } = useApp();
  const variant = slideVariants[slideDirection] || slideVariants.none;
  const isSpring = slideDirection === "left" || slideDirection === "right";

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={screenKey}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={isSpring ? springTransition : fadeTransition}
        className="h-full w-full overflow-y-auto pb-20"
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
