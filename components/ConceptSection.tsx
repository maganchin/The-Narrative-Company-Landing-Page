"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const cards = [
  {
    number: "01",
    icon: "🎭",
    title: "Choose Your Character",
    description:
      "Step into a world built around you. Pick your hero, define their voice, and begin your journey.",
    accent: "#7b2fff",
    accentSecondary: "#00d4ff",
    panelLabel: "CHARACTER SELECT",
  },
  {
    number: "02",
    icon: "⚡",
    title: "Make Decisions",
    description:
      "Every fork in the road matters. Your instincts, your values, your choices — they shape everything that comes next.",
    accent: "#ff2d9b",
    accentSecondary: "#7b2fff",
    panelLabel: "CHOOSE YOUR PATH",
  },
  {
    number: "03",
    icon: "🌌",
    title: "Watch the Story Unfold",
    description:
      "The narrative bends to your will. Experience a story nobody else will ever live — because it's truly yours.",
    accent: "#00d4ff",
    accentSecondary: "#ff2d9b",
    panelLabel: "YOUR STORY",
  },
];

interface ComicCardProps {
  card: (typeof cards)[0];
  index: number;
}

function ComicCard({ card, index }: ComicCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotate: index % 2 === 0 ? -1 : 1 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{
        y: -8,
        rotate: index % 2 === 0 ? -0.5 : 0.5,
        scale: 1.02,
        boxShadow: `0 20px 60px ${card.accent}30, 0 0 0 1px ${card.accent}40`,
        transition: { duration: 0.25 },
      }}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: `linear-gradient(145deg, rgba(${hexToRgb(card.accent)}, 0.08) 0%, rgba(10,10,26,0.95) 60%)`,
        border: `1.5px solid rgba(${hexToRgb(card.accent)}, 0.25)`,
        boxShadow: `6px 6px 0 rgba(${hexToRgb(card.accentSecondary)}, 0.1), inset 0 0 60px rgba(${hexToRgb(card.accent)}, 0.03)`,
      }}
    >
      {/* Comic panel label */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b"
        style={{
          borderColor: `rgba(${hexToRgb(card.accent)}, 0.2)`,
          background: `rgba(${hexToRgb(card.accent)}, 0.05)`,
        }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: `rgba(${hexToRgb(card.accent)}, 0.7)` }}
        >
          {card.panelLabel}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: `rgba(${hexToRgb(card.accent)}, 0.4)` }}
        >
          #{card.number}
        </span>
      </div>

      {/* Card content */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Icon with glow */}
        <motion.div
          className="text-4xl w-16 h-16 flex items-center justify-center rounded-xl"
          style={{
            background: `radial-gradient(circle, rgba(${hexToRgb(card.accent)}, 0.15) 0%, transparent 70%)`,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {card.icon}
        </motion.div>

        <div>
          <h3
            className="text-xl font-black text-white mb-2 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {card.title}
          </h3>
          <p
            className="text-white/50 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {card.description}
          </p>
        </div>

        {/* Decorative line at bottom */}
        <div className="mt-auto pt-4">
          <motion.div
            className="h-px w-full"
            style={{
              background: `linear-gradient(to right, rgba(${hexToRgb(card.accent)}, 0.4), transparent)`,
            }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.4 }}
          />
        </div>
      </div>

      {/* Corner accent */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
        style={{
          background: `radial-gradient(circle at 100% 100%, rgba(${hexToRgb(card.accent)}, 0.8) 0%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

export default function ConceptSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0a1a 0%, #0d0a1f 50%, #0a0a1a 100%)",
        }}
      />
      <div className="absolute inset-0 z-0 halftone-bg opacity-10" />

      {/* Decorative top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(123,47,255,0.4) 30%, rgba(255,45,155,0.4) 70%, transparent)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-purple-400/60 mb-4"
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            How It Works
          </motion.span>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Every story begins{" "}
            <span
              className="text-gradient"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #ff2d9b 0%, #7b2fff 100%)",
              }}
            >
              with a choice.
            </span>
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <ComicCard key={card.number} card={card} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(0,212,255,0.3) 50%, transparent)",
        }}
      />
    </section>
  );
}
