"use client";

import { useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import TypingTitle from "./TypingTitle";

type Phase = "typing" | "subtitle" | "cta" | "melting";

interface HeroSceneProps {
  onTransitionComplete: () => void;
}

export default function HeroScene({ onTransitionComplete }: HeroSceneProps) {
  const [phase, setPhase] = useState<Phase>("typing");
  const contentControls = useAnimation();
  const flashControls = useAnimation();

  const handleTypingComplete = useCallback(() => {
    setPhase("subtitle");
    setTimeout(() => setPhase("cta"), 700);
  }, []);

  const handleMelt = useCallback(async () => {
    setPhase("melting");

    contentControls.start({
      scaleX: [1, 1.06, 4.5],
      scaleY: [1, 0.94, 0.04],
      opacity: [1, 1, 0],
      filter: [
        "blur(0px) brightness(1) saturate(1)",
        "blur(1px) brightness(1.6) saturate(2.5)",
        "blur(45px) brightness(0.3) saturate(0.5)",
      ],
      transition: {
        duration: 0.72,
        times: [0, 0.38, 1],
        ease: [0.25, 0, 0.85, 1],
      },
    });

    setTimeout(async () => {
      await flashControls.start({
        opacity: [0, 1, 0],
        scale: [1, 1.03, 1],
        transition: { duration: 0.38, times: [0, 0.28, 1] },
      });
      onTransitionComplete();
    }, 360);
  }, [contentControls, flashControls, onTransitionComplete]);

  return (
    <motion.div
      className="relative z-10 min-h-screen flex flex-col items-center justify-center overflow-hidden w-full"
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
    >
      {/* Dimensional flash overlay */}
      <motion.div
        animate={flashControls}
        initial={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, #ffffff 0%, #FFD65C 30%, #3330FF 60%, #1a17ee 100%)",
        }}
      />

      {/* Main content */}
      <motion.div
        animate={contentControls}
        className="relative z-10 flex flex-col items-center text-center px-6 sm:px-10 select-none w-full"
        style={{ maxWidth: "min(100vw, 100%)" }}
      >
        {/* THE — small eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-2 flex items-center gap-3"
        >
          <span className="block w-8 h-px" style={{ background: "rgba(255,214,92,0.35)" }} />
          <span
            className="text-[10px] tracking-[0.5em] uppercase"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,214,92,0.5)" }}
          >
            the
          </span>
          <span className="block w-8 h-px" style={{ background: "rgba(255,214,92,0.35)" }} />
        </motion.div>

        {/* Narrative Company — both on the same line */}
        <h1
          className="leading-none w-full"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(1.6rem, 7.5vw, 7rem)",
            lineHeight: 0.95,
            color: "#FFD65C",
            textShadow: "3px 3px 0px #1a10cc, 1px 1px 0px #0d0899",
            letterSpacing: "0.01em",
          }}
        >
          {phase === "typing" ? (
            <TypingTitle
              key="full"
              text="Narrative Company"
              onComplete={handleTypingComplete}
              startDelay={550}
              charDelay={55}
            />
          ) : (
            "Narrative Company"
          )}
        </h1>

        {/* Subtitle */}
        {(phase === "subtitle" || phase === "cta" || phase === "melting") && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,214,92,0.55)" }}
          >
            A new personalized game lab that brings the nostalgia back to casual games.
          </motion.p>
        )}

        {/* CTA */}
        {(phase === "cta" || phase === "melting") && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <motion.button
              onClick={handleMelt}
              disabled={phase === "melting"}
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(255,214,92,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="relative px-12 py-4 rounded-full font-bold cursor-pointer overflow-hidden"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                background: "linear-gradient(135deg, #FFD65C 0%, #FFC233 100%)",
                color: "#1a17ee",
                fontSize: "clamp(0.9rem, 1.6vw, 1rem)",
                letterSpacing: "0.06em",
              }}
            >
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPositionX: "200%" }}
                whileHover={{ backgroundPositionX: "-50%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">Enter the Story →</span>
            </motion.button>

            <motion.span
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: "rgba(255,214,92,0.3)", fontFamily: "var(--font-body)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              waitlist open
            </motion.span>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll nudge */}
      {phase === "cta" && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-px h-10 origin-top"
            style={{
              background: "linear-gradient(to bottom, rgba(255,214,92,0.4), transparent)",
            }}
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
