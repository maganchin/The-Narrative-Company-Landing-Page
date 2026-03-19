"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function AnswerScreen() {
  const [answer, setAnswer] = useState("");

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#3c2eff] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="flex flex-col items-center gap-8 px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
          <p
            className="text-[#ffde5b] text-3xl sm:text-4xl md:text-5xl tracking-tight text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            your answer?
          </p>

        <div className="flex flex-col items-center gap-1 w-72 sm:w-96">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-transparent text-[#ffde5b] text-xl text-center outline-none pb-2 placeholder-[#ffde5b]/20"
            style={{ fontFamily: "var(--font-tagline)" }}
            autoFocus
          />
          {/* Animated underline */}
          <motion.div
            className="w-full h-px bg-[#ffde5b]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.75, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
