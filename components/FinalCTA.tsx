"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale: bgScale }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, #3b0764 0%, #1a0533 40%, #0a0a1a 80%)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 70% 30%, rgba(255,45,155,0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse at 65% 35%, rgba(255,45,155,0.22) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 30%, rgba(255,45,155,0.15) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 70%, rgba(0,212,255,0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 25% 65%, rgba(0,212,255,0.12) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 70%, rgba(0,212,255,0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </motion.div>

      {/* Halftone overlay */}
      <div className="absolute inset-0 z-0 halftone-bg opacity-15" />

      {/* Large decorative text backdrop */}
      <div
        className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none"
        aria-hidden
      >
        <span
          className="text-[20vw] font-black opacity-[0.025] select-none whitespace-nowrap"
          style={{ fontFamily: "var(--font-display)", color: "#7b2fff" }}
        >
          CHOOSE
        </span>
      </div>

      {/* Floating geometric accents */}
      <motion.div
        className="absolute top-16 right-12 w-20 h-20 border border-pink-500/15 rounded-full hidden md:block"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-16 w-12 h-12 border border-purple-400/20 rotate-45 hidden md:block"
        animate={{ rotate: [45, 90, 45], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,45,155,0.4) 30%, rgba(123,47,255,0.4) 70%, transparent)",
        }}
      />

      <div
        ref={contentRef}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center gap-8"
      >
        {/* Section label */}
        <motion.span
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-pink-400/60"
          initial={{ opacity: 0, y: -10 }}
          animate={contentInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="w-8 h-px bg-pink-500/40" />
          Early Access
          <span className="w-8 h-px bg-pink-500/40" />
        </motion.span>

        {/* Headline */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={contentInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="text-white">Be among the</span>
          <br />
          <span
            className="text-gradient"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #ff2d9b 0%, #7b2fff 50%, #00d4ff 100%)",
            }}
          >
            first explorers.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-white/50 text-lg leading-relaxed max-w-md"
          style={{ fontFamily: "var(--font-body)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={contentInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          Join the waitlist for early access to our first interactive adventure.
          Your story is waiting.
        </motion.p>

        {/* Form */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={contentInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <WaitlistForm ctaLabel="Join the Story" />
        </motion.div>

        {/* Features list */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 pt-2"
          initial={{ opacity: 0 }}
          animate={contentInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {[
            "✦ Early access",
            "✦ Exclusive content",
            "✦ Shape the product",
          ].map((item) => (
            <span
              key={item}
              className="text-white/30 text-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
