"use client";

import { useState } from "react";
import ThreeBackground from "@/components/ThreeBackground";
import WaitlistSection from "@/components/WaitlistSection";
import GlassManScene from "@/components/GlassManScene";

type Scene = "home" | "guessing";

export default function Home() {
  const [scene, setScene] = useState<Scene>("home");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ThreeBackground hideCube={scene !== "home"} disableCursorEffects={scene !== "home"} />
      {scene === "home" && (
        <WaitlistSection onStartGuessing={() => setScene("guessing")} />
      )}
      {scene === "guessing" && (
        <GlassManScene onPop={() => setScene("home")} />
      )}
    </main>
  );
}
