"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.div
      ref={sectionRef}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.96, filter: "blur(20px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Parallax background accent */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 40% 55%, rgba(255,214,92,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto">

        {/* Giant typographic headline */}
        <div className="w-full mb-8 sm:mb-12">
          {/* JOIN */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(3rem, 17vw, 14rem)",
                lineHeight: 0.88,
                color: "#FFD65C",
              }}
            >
              JOIN
            </h2>
          </motion.div>

          {/* THE STORY — pushed right */}
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(1.5rem, 8.5vw, 7rem)",
                lineHeight: 0.88,
                color: "#FFD65C",
                textShadow: "3px 3px 0px #1a10cc, 1px 1px 0px #0d0899",
              }}
            >
              THE STORY.
            </h2>
          </motion.div>
        </div>

        {/* Divider accent */}
        <motion.div
          className="flex items-center gap-4 mb-10 sm:mb-12"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          <div
            className="h-px flex-1 max-w-[80px]"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,214,92,0.35))" }}
          />
          <span
            className="text-[10px] tracking-[0.45em] uppercase"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,214,92,0.3)" }}
          >
            waitlist
          </span>
          <div
            className="h-px flex-1 max-w-[80px]"
            style={{ background: "linear-gradient(to left, transparent, rgba(255,214,92,0.35))" }}
          />
        </motion.div>

        {/* Form */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <WaitlistForm ctaLabel="Join the Waitlist" />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-0 left-0 right-0 pb-8 pt-6 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(to right, transparent, rgba(255,214,92,0.2) 50%, transparent)",
          }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FFD65C, #FFC233)" }}
          >
            <span
              className="text-[10px] font-black"
              style={{ fontFamily: "var(--font-display)", color: "#1a17ee" }}
            >
              N
            </span>
          </div>
          <span
            className="text-xs font-medium tracking-wide"
            style={{ fontFamily: "var(--font-body)", color: "rgba(255,214,92,0.4)" }}
          >
            The Narrative Company
          </span>
        </div>
        <p
          className="text-[10px] italic"
          style={{ fontFamily: "var(--font-body)", color: "rgba(255,214,92,0.2)" }}
        >
          Where every player writes the ending.
        </p>
      </motion.footer>
    </motion.div>
  );
}
