"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WaitlistFormProps {
  ctaLabel?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm({ ctaLabel = "Join the Waitlist" }: WaitlistFormProps) {
  const [form, setForm] = useState({ firstName: "", email: "", phone: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.firstName || !form.email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center py-10 flex flex-col items-center gap-4"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FFD65C, #FFC233)" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <motion.path
              d="M5 14l7 7L23 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </svg>
        </motion.div>
        <h3
          className="text-2xl font-black"
          style={{ color: "#FFD65C", fontFamily: "var(--font-display)" }}
        >
          You&apos;re in.
        </h3>
        <p
          className="text-white/40 text-sm max-w-[200px] leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          We&apos;ll reach you when the adventure begins.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3 w-full max-w-sm mx-auto"
    >
      {/* First Name + Phone */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
          disabled={status === "loading"}
          className="input-glow flex-1 px-4 py-3.5 rounded-xl text-sm backdrop-blur-sm disabled:opacity-50"
          style={{ color: "#FFD65C", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,214,92,0.18)", fontFamily: "var(--font-body)" }}
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          disabled={status === "loading"}
          className="input-glow flex-1 px-4 py-3.5 rounded-xl text-sm backdrop-blur-sm disabled:opacity-50"
          style={{ color: "#FFD65C", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,214,92,0.18)", fontFamily: "var(--font-body)" }}
        />
      </div>

      {/* Email */}
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email Address"
        required
        disabled={status === "loading"}
        className="input-glow w-full px-4 py-3.5 rounded-xl text-sm backdrop-blur-sm disabled:opacity-50"
        style={{ color: "#FFD65C", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,214,92,0.18)", fontFamily: "var(--font-body)" }}
      />

      {/* Error message */}
      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-pink-400 text-xs text-center"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {errorMsg}
        </motion.p>
      )}

      {/* CTA Button */}
      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileHover={status !== "loading" ? {
          scale: 1.025,
          boxShadow: "0 0 45px rgba(255,45,155,0.45)",
        } : {}}
        whileTap={status !== "loading" ? { scale: 0.975 } : {}}
        className="relative w-full py-4 px-8 rounded-xl text-white font-black cursor-pointer overflow-hidden mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-display)",
          background: "linear-gradient(135deg, #FFD65C 0%, #FFC233 100%)",
          color: "#1a17ee",
          fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)",
          letterSpacing: "0.14em",
        }}
      >
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ backgroundPositionX: "200%" }}
          whileHover={{ backgroundPositionX: "-50%" }}
          transition={{ duration: 0.55 }}
        />
        <span className="relative z-10 uppercase tracking-[0.14em]">
          {status === "loading" ? "Saving..." : ctaLabel}
        </span>
      </motion.button>

      <p
        className="text-white/20 text-[10px] text-center tracking-wide pt-1"
        style={{ fontFamily: "var(--font-body)" }}
      >
        No spam. Ever.
      </p>
    </motion.form>
  );
}
