"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WaitlistFormProps {
  ctaLabel?: string;
  onSuccess?: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm({
  ctaLabel = "Join the Waitlist",
  onSuccess,
}: WaitlistFormProps) {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phone: "",
    npcPersonality: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    email?: string;
    phone?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: typeof fieldErrors = {};
    if (!form.firstName.trim()) {
      nextErrors.firstName = "Tell us your name so we know who the hero is.";
    }

    const phonePattern = /^[0-9()+\-\s]{7,}$/;
    if (!form.phone.trim() || !phonePattern.test(form.phone.trim())) {
      nextErrors.phone = "Add a real phone number so we can actually reach you.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = "Drop in a valid email (with an @ and a dot).";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

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
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const hasPrimaryFieldsFilled =
    form.firstName.trim() && form.phone.trim() && form.email.trim();

  if (status === "success") {
    return null;
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      noValidate
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      {/* Name + Phone (square-ish grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Name"
          disabled={status === "loading"}
          className="border-b-2 border-[#3c2eff] bg-transparent px-1 py-2 text-base outline-none placeholder:text-[#3c2eff]/80"
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#3c2eff",
          }}
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
          inputMode="tel"
          disabled={status === "loading"}
          className="border-b-2 border-[#3c2eff] bg-transparent px-1 py-2 text-base outline-none placeholder:text-[#3c2eff]/80"
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#3c2eff",
          }}
        />
      </div>

      {(fieldErrors.firstName || fieldErrors.phone) && (
        <p
          className="text-[11px] sm:text-xs text-red-500"
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {fieldErrors.firstName ?? fieldErrors.phone}
        </p>
      )}

      {/* Email */}
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        disabled={status === "loading"}
        className="border-b-2 border-[#3c2eff] bg-transparent px-1 py-2 text-base outline-none placeholder:text-[#3c2eff]/80"
        style={{
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#3c2eff",
        }}
      />

      {fieldErrors.email && (
        <p
          className="text-[11px] sm:text-xs text-red-500"
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {fieldErrors.email}
        </p>
      )}

      {/* NPC Question */}
      {hasPrimaryFieldsFilled && (
        <div className="mt-1 space-y-1">
          <p
            className="text-sm sm:text-base"
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "#3c2eff",
            }}
          >
            If you were an NPC – what would be your personality?
          </p>
          <textarea
            name="npcPersonality"
            value={form.npcPersonality}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, npcPersonality: e.target.value }))
            }
            rows={1}
            disabled={status === "loading"}
            className="w-full border-b-2 border-[#3c2eff] bg-transparent px-1 py-1.5 text-base leading-tight outline-none resize-none placeholder:text-[#3c2eff]/60"
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "#3c2eff",
            }}
            placeholder="Egotistical mean girl, super smart but sweet nerd..."
          />
        </div>
      )}

      {/* Error message */}
      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs text-center"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {errorMsg}
        </motion.p>
      )}

      {/* CTA Button */}
      {hasPrimaryFieldsFilled && (
        <motion.button
          type="submit"
          disabled={status === "loading"}
          whileHover={
            status !== "loading"
              ? {
                  scale: 1.025,
                  boxShadow: "0 0 35px rgba(60,46,255,0.45)",
                }
              : {}
          }
          whileTap={status !== "loading" ? { scale: 0.975 } : {}}
          className="relative w-full py-3.5 px-8 rounded-full font-semibold cursor-pointer overflow-hidden mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            fontFamily: "var(--font-display)",
            background: "#3c2eff",
            color: "#fffbc4",
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
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
      )}
    </motion.form>
  );
}
