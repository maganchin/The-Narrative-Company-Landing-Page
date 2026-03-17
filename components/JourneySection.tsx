"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const pathNodes = [
  { id: "A", label: "Begin", x: "50%", y: "5%", primary: true },
  { id: "B", label: "Left Path", x: "25%", y: "35%" },
  { id: "C", label: "Right Path", x: "75%", y: "35%" },
  { id: "D", label: "Dark Forest", x: "15%", y: "65%" },
  { id: "E", label: "Hidden City", x: "40%", y: "68%" },
  { id: "F", label: "Ancient Tower", x: "62%", y: "65%" },
  { id: "G", label: "The End", x: "85%", y: "65%", accent: true },
];

const stats = [
  { value: "∞", label: "Possible storylines" },
  { value: "100+", label: "Decision points" },
  { value: "Your", label: "Unique ending" },
];

export default function JourneySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 overflow-hidden"
    >
      {/* Deep cinematic background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #1a0533 0%, #0a0a1a 70%)",
          y: bgY,
        }}
      />

      {/* Atmospheric glows */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7b2fff 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #ff2d9b 0%, transparent 70%)",
        }}
      />

      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(123,47,255,0.3) 50%, transparent)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            ref={contentRef}
            className="flex flex-col gap-8"
          >
            <motion.span
              className="text-xs font-bold tracking-[0.3em] uppercase text-cyan-400/60"
              initial={{ opacity: 0, x: -20 }}
              animate={contentInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              The Journey
            </motion.span>

            <motion.h2
              className="text-4xl sm:text-5xl font-black leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 30 }}
              animate={contentInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="text-white">Your choices</span>
              <br />
              <span
                className="text-gradient"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #00d4ff 0%, #7b2fff 60%, #ff2d9b 100%)",
                }}
              >
                shape the world.
              </span>
            </motion.h2>

            <motion.p
              className="text-white/50 text-lg leading-relaxed max-w-lg"
              style={{ fontFamily: "var(--font-body)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={contentInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              No two adventures are the same. Every decision changes what
              happens next — the alliances you forge, the paths you discover,
              the ending only you will ever see.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={contentInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col gap-1 p-4 rounded-xl"
                  style={{
                    background: "rgba(123,47,255,0.07)",
                    border: "1px solid rgba(123,47,255,0.15)",
                  }}
                  whileHover={{
                    background: "rgba(123,47,255,0.12)",
                    borderColor: "rgba(123,47,255,0.3)",
                  }}
                >
                  <span
                    className="text-2xl font-black text-gradient"
                    style={{
                      fontFamily: "var(--font-display)",
                      backgroundImage:
                        "linear-gradient(135deg, #7b2fff, #ff2d9b)",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-white/40 text-xs leading-tight"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Quote / pull text */}
            <motion.div
              className="relative pl-5 border-l-2 border-pink-500/40"
              initial={{ opacity: 0, x: -20 }}
              animate={contentInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <p
                className="text-white/60 text-sm italic leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                &ldquo;The story doesn&apos;t happen to you — you write it with every
                choice.&rdquo;
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Branching path visualization */}
          <BranchingPathViz contentInView={contentInView} />
        </div>
      </div>
    </section>
  );
}

function BranchingPathViz({ contentInView }: { contentInView: boolean }) {
  return (
    <motion.div
      className="relative h-80 lg:h-96 w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={contentInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Background panel */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(123,47,255,0.06) 0%, rgba(0,0,0,0.4) 100%)",
          border: "1.5px solid rgba(123,47,255,0.2)",
        }}
      >
        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="smallGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(123,47,255,0.5)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>

      {/* SVG branching paths */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pathGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7b2fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff2d9b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="pathGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7b2fff" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {contentInView && (
          <>
            {/* Root to level 1 */}
            <motion.line
              x1="200" y1="30" x2="120" y2="110"
              stroke="url(#pathGrad1)" strokeWidth="1.5" strokeDasharray="4 3"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.line
              x1="200" y1="30" x2="280" y2="110"
              stroke="url(#pathGrad2)" strokeWidth="1.5" strokeDasharray="4 3"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
            {/* Level 1 to level 2 */}
            <motion.line
              x1="120" y1="110" x2="60" y2="200"
              stroke="url(#pathGrad1)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            />
            <motion.line
              x1="120" y1="110" x2="170" y2="200"
              stroke="url(#pathGrad1)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
            <motion.line
              x1="280" y1="110" x2="240" y2="200"
              stroke="url(#pathGrad2)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            />
            <motion.line
              x1="280" y1="110" x2="330" y2="200"
              stroke="url(#pathGrad2)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            />
          </>
        )}

        {/* Nodes */}
        {contentInView && [
          { cx: 200, cy: 30, r: 10, color: "#ff2d9b", label: "Begin", delay: 0.2 },
          { cx: 120, cy: 110, r: 7, color: "#7b2fff", label: "Path A", delay: 0.45 },
          { cx: 280, cy: 110, r: 7, color: "#00d4ff", label: "Path B", delay: 0.5 },
          { cx: 60, cy: 200, r: 5, color: "#7b2fff", label: "", delay: 0.65 },
          { cx: 170, cy: 200, r: 5, color: "#ff2d9b", label: "", delay: 0.7 },
          { cx: 240, cy: 200, r: 5, color: "#00d4ff", label: "", delay: 0.72 },
          { cx: 330, cy: 200, r: 5, color: "#7b2fff", label: "", delay: 0.75 },
        ].map((node, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: node.delay }}
          >
            {/* Outer glow ring */}
            <circle
              cx={node.cx} cy={node.cy} r={node.r + 4}
              fill="none" stroke={node.color} strokeWidth="1" opacity="0.2"
            />
            {/* Main node */}
            <circle
              cx={node.cx} cy={node.cy} r={node.r}
              fill={node.color} opacity="0.8"
              filter="url(#glow)"
            />
            {/* Label */}
            {node.label && (
              <text
                x={node.cx} y={node.cy - node.r - 6}
                textAnchor="middle" fill="white" fontSize="8"
                fontFamily="var(--font-body)" opacity="0.5"
              >
                {node.label}
              </text>
            )}
          </motion.g>
        ))}

        {/* Floating label */}
        {contentInView && (
          <motion.text
            x="200" y="270"
            textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9"
            fontFamily="var(--font-body)" letterSpacing="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            YOUR PATH IS UNIQUE
          </motion.text>
        )}
      </svg>

      {/* Floating label overlay */}
      <div className="absolute top-4 left-4">
        <span
          className="text-[9px] font-bold tracking-[0.2em] uppercase"
          style={{ color: "rgba(123,47,255,0.5)" }}
        >
          Story Map
        </span>
      </div>
    </motion.div>
  );
}
