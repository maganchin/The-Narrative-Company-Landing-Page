"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import WaitlistForm from "./WaitlistForm";

const FloatingShape = ({
  className,
  style,
  delay = 0,
  duration = 8,
}: {
  className: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={style}
    animate={{
      y: [0, -30, -10, 0],
      x: [0, 10, -5, 0],
      rotate: [0, 15, -8, 0],
      scale: [1, 1.05, 0.98, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 60%, #3b0764 0%, #1a0533 30%, #0d0d2b 60%, #0a0a1a 100%)",
        }}
      />

      {/* Secondary gradient blobs */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "radial-gradient(circle at 80% 20%, rgba(255,45,155,0.12) 0%, transparent 50%)",
            "radial-gradient(circle at 75% 25%, rgba(255,45,155,0.18) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(255,45,155,0.12) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(0,212,255,0.08) 0%, transparent 45%)",
            "radial-gradient(circle at 15% 75%, rgba(0,212,255,0.12) 0%, transparent 45%)",
            "radial-gradient(circle at 20% 80%, rgba(0,212,255,0.08) 0%, transparent 45%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Halftone dot pattern overlay */}
      <div className="absolute inset-0 z-0 halftone-bg opacity-20" />

      {/* Floating shapes */}
      <FloatingShape
        className="w-64 h-64 -top-16 -right-16 opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(123,47,255,0.6) 0%, transparent 70%)",
        }}
        delay={0}
        duration={9}
      />
      <FloatingShape
        className="w-96 h-96 -bottom-32 -left-32 opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,155,0.5) 0%, transparent 70%)",
        }}
        delay={2}
        duration={11}
      />
      <FloatingShape
        className="w-48 h-48 top-1/4 right-1/4 opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.5) 0%, transparent 70%)",
        }}
        delay={4}
        duration={7}
      />

      {/* Geometric accent shapes */}
      <motion.div
        className="absolute top-24 right-16 w-16 h-16 border-2 border-pink-500/20 rotate-12 hidden md:block"
        animate={{ rotate: [12, 32, 12], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 left-20 w-10 h-10 border-2 border-purple-400/25 rotate-45 hidden md:block"
        animate={{ rotate: [45, 90, 45], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute top-1/3 left-12 w-6 h-6 bg-cyan-400/20 rounded-full hidden md:block"
        animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* Main content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-4xl mx-auto w-full"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-900/20 backdrop-blur-sm text-xs font-medium text-purple-300 mb-8"
        >
          <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          Early Access Launching Soon
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="block text-white">Stories you don&apos;t</span>
          <span className="block text-white">just read.</span>
          <span
            className="block text-gradient"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #7b2fff 0%, #ff2d9b 50%, #ff6b35 100%)",
            }}
          >
            Stories you choose.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg sm:text-xl text-white/55 max-w-lg mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Interactive adventures built for the next generation of storytelling.
        </motion.p>

        {/* Waitlist form */}
        <div className="w-full max-w-md">
          <WaitlistForm ctaLabel="Join the Adventure" />
        </div>

        {/* Social proof nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-8 flex items-center gap-3 text-white/30 text-sm"
        >
          <div className="flex -space-x-2">
            {["#7b2fff", "#ff2d9b", "#00d4ff", "#ff6b35"].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-[#0a0a1a]"
                style={{ backgroundColor: color, opacity: 0.7 }}
              />
            ))}
          </div>
          <span>Join 200+ adventurers on the list</span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
