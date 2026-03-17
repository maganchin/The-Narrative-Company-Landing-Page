"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative py-12 px-6 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "#050510" }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(123,47,255,0.2) 50%, transparent)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          {/* Simple logo mark */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7b2fff, #ff2d9b)",
            }}
          >
            <span className="text-white text-xs font-black" style={{ fontFamily: "var(--font-display)" }}>
              N
            </span>
          </div>
          <span
            className="text-white font-bold text-lg tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Narrative Company
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-white/30 text-sm italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Where every player writes the ending.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex items-center gap-6 pt-2"
        >
          {["Privacy", "Terms", "Contact"].map((link) => (
            <span
              key={link}
              className="text-white/20 text-xs hover:text-white/40 transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {link}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-white/15 text-xs pt-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          © 2025 The Narrative Company. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
}
