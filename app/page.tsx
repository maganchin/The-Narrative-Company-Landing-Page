"use client";

import ThreeBackground from "@/components/ThreeBackground";
import WaitlistSection from "@/components/WaitlistSection";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ThreeBackground />
      <WaitlistSection />
    </main>
  );
}
