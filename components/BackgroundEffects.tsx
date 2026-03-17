"use client";

import { motion } from "framer-motion";

function hexPoints(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
}

interface HexProps {
  size: number;
  color: string;
  duration: number;
  delay?: number;
  className?: string;
}

function RotatingHex({ size, color, duration, delay = 0, className = "" }: HexProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{ width: size, height: size, transformOrigin: "center center" }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
        <polygon points={hexPoints(size)} fill="none" stroke={color} strokeWidth="1" />
      </svg>
    </motion.div>
  );
}

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base blue gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #3d3aff 0%, #2a27ff 45%, #1a17ee 100%)",
        }}
      />

      {/* Animated color blobs — blue & gold tones */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 55%, rgba(255,214,92,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 25% 50%, rgba(255,214,92,0.16) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 55%, rgba(255,214,92,0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 80% 35%, rgba(255,214,92,0.07) 0%, transparent 45%)",
            "radial-gradient(circle at 75% 30%, rgba(255,214,92,0.12) 0%, transparent 45%)",
            "radial-gradient(circle at 80% 35%, rgba(255,214,92,0.07) 0%, transparent 45%)",
          ],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3.5 }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 50% 90%, rgba(13,8,153,0.5) 0%, transparent 55%)",
            "radial-gradient(circle at 50% 95%, rgba(13,8,153,0.6) 0%, transparent 55%)",
            "radial-gradient(circle at 50% 90%, rgba(13,8,153,0.5) 0%, transparent 55%)",
          ],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      {/* Concentric hexagonal portal — gold tinted */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[900, 650, 460, 310, 190, 100].map((size, i) => (
          <RotatingHex
            key={size}
            size={size}
            color={
              i % 2 === 0
                ? `rgba(255,214,92,${0.06 + i * 0.006})`
                : `rgba(255,255,255,${0.04 + i * 0.004})`
            }
            duration={100 - i * 10}
            delay={i * 2.5}
            className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        ))}
      </div>

      {/* Accent hexagons */}
      <RotatingHex size={200} color="rgba(255,214,92,0.1)" duration={38} delay={1.5} className="top-[8%] left-[4%]" />
      <RotatingHex size={140} color="rgba(255,255,255,0.07)" duration={28} delay={4} className="bottom-[12%] right-[6%]" />
      <RotatingHex size={90} color="rgba(255,214,92,0.14)" duration={22} delay={0} className="top-[20%] right-[12%]" />
      <RotatingHex size={70} color="rgba(255,255,255,0.08)" duration={18} delay={6} className="bottom-[30%] left-[10%]" />

      {/* Halftone dot overlay */}
      <div className="absolute inset-0 halftone opacity-[0.04]" />

      {/* Vignette — deeper blue at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(13,8,153,0.55) 100%)",
        }}
      />
    </div>
  );
}
