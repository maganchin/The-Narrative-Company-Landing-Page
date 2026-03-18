"use client";

import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-10 flex items-end justify-end p-6 sm:p-10"
      initial={{ opacity: 0, scale: 0.96, filter: "blur(16px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-auto w-full max-w-md">
        <div
          className="mb-4 sm:mb-5 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-lg"
          style={{
            background: "rgba(0,0,0,0.08)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <p
            className="text-xs sm:text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "rgba(0,0,0,0.7)" }}
          >
            I bring ideas to life through visual storytelling, purposeful design,
            and innovative thinking.
          </p>
        </div>

        <motion.div
          className="rounded-2xl p-4 sm:p-5 shadow-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div className="mb-3">
            <span
              className="text-[10px] uppercase tracking-[0.35em]"
              style={{ fontFamily: "var(--font-body)", color: "rgba(0,0,0,0.38)" }}
            >
              Waitlist
            </span>
            <h2
              className="mt-1 text-base sm:text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "rgba(0,0,0,0.9)" }}
            >
              Be among the first to enter the yellow room.
            </h2>
          </div>

          <WaitlistForm ctaLabel="Join the Waitlist" />
        </motion.div>
      </div>
    </motion.div>
  );
}
