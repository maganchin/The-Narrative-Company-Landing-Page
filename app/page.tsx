"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import BackgroundEffects from "@/components/BackgroundEffects";
import HoneycombOverlay from "@/components/HoneycombOverlay";
import HeroScene from "@/components/HeroScene";
import WaitlistSection from "@/components/WaitlistSection";

export default function Home() {
  const [scene, setScene] = useState<"hero" | "waitlist">("hero");

  return (
    <main className="relative min-h-screen bg-[#2a27ff] overflow-hidden">
      <BackgroundEffects />
      <HoneycombOverlay />

      <AnimatePresence mode="wait">
        {scene === "hero" ? (
          <HeroScene
            key="hero"
            onTransitionComplete={() => setScene("waitlist")}
          />
        ) : (
          <WaitlistSection key="waitlist" />
        )}
      </AnimatePresence>
    </main>
  );
}
