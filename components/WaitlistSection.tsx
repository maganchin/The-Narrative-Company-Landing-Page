"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  const [submitted, setSubmitted] = useState(false);
  const headingControls = useAnimation();

  useEffect(() => {
    if (submitted) return;

    const triggerBuzz = () => {
      headingControls.start({
        x: [0, -6, 6, -5, 5, -3, 3, 0],
        transition: {
          duration: 1.5,
          ease: "easeInOut",
        },
      });
    };

    const initialTimeout = setTimeout(triggerBuzz, 150);
    const intervalId = setInterval(triggerBuzz, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [submitted, headingControls]);

  return (
    <>
      {/* Mobile-only tagline pinned near the top */}
      {!submitted && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4 sm:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="max-w-xs text-xs leading-snug tracking-[0.12em] text-white mix-blend-difference text-center"
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            You&apos;re the main character in all OUR stories!
          </p>
        </motion.div>
      )}

      <motion.div
        className="pointer-events-none fixed inset-0 z-10 flex items-end justify-end pb-6 px-4 sm:pb-10 sm:px-10"
        initial={{ opacity: 0, scale: 0.96, filter: "blur(16px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-auto w-full max-w-xl flex flex-col items-center sm:items-end gap-3 sm:gap-4">
          {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="bg-transparent"
          >
            <div className="inline-block rounded-3xl px-6 py-4 sm:px-8 sm:py-5">
              <p
                className="text-3xl sm:text-4xl md:text-5xl tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#3c2eff",
                }}
              >
                Congratulations!
              </p>
            </div>
          </motion.div>
          ) : (
            <>
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center sm:items-end text-center sm:text-right gap-1.5 sm:gap-2"
            >
                <motion.span
                className="hidden sm:inline-block text-4xl sm:text-5xl md:text-6xl leading-none pr-1"
                style={{
                  fontFamily:
                    "'Pacifico', 'Comic Sans MS', 'Bradley Hand', cursive",
                  color: "#ffde5b",
                  textShadow: "0 6px 0 #3c2eff",
                }}
                animate={headingControls}
                >
                  waitlist
                </motion.span>
                {/* Desktop / tablet tagline (hidden on phone; phone version is pinned at top) */}
                <p
                  className="hidden sm:block w-full max-w-md text-xs sm:text-sm md:text-base leading-snug tracking-[0.12em]"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: "#fffbc4",
                  }}
                >
                  You&apos;re the main character in all OUR stories!
                </p>
              </motion.div>

              <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
              >
                <WaitlistForm
                  ctaLabel="Join Waitlist"
                  onSuccess={() => setSubmitted(true)}
                />
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
