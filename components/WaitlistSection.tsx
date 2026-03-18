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
      {/* Mobile-only tagline — plain div with blend, animation nested inside */}
      {!submitted && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-20 flex justify-center px-4 sm:hidden mix-blend-difference">
          <motion.p
            className="max-w-xs text-[13px] leading-snug tracking-[0.12em] text-center"
            style={{
              fontFamily: "var(--font-tagline)",
              color: "#c3cd3b",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            You&apos;re the main character in all OUR stories!
          </motion.p>
        </div>
      )}

      {/* Main waitlist area — plain div with blend on mobile, motion inside */}
      <div className="pointer-events-none fixed inset-0 z-10 flex items-end justify-end pb-6 px-4 sm:pb-10 sm:px-10 mix-blend-difference sm:mix-blend-normal">
        <motion.div
          className="pointer-events-auto w-full max-w-xl flex flex-col items-center sm:items-end gap-3 sm:gap-4"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {submitted ? (
            <div className="bg-transparent">
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
            </div>
          ) : (
            <>
              <div className="w-full flex flex-col items-center sm:items-end text-center sm:text-right gap-1.5 sm:gap-2">
                <motion.span
                  className="hidden sm:inline-block text-4xl sm:text-5xl md:text-6xl leading-none pr-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#ffde5b",
                    textShadow: "0 6px 0 #3c2eff",
                  }}
                  animate={headingControls}
                >
                  waitlist
                </motion.span>
                <p
                  className="hidden sm:block w-full max-w-md text-xs sm:text-sm md:text-base leading-snug tracking-[0.12em]"
                  style={{
                    fontFamily: "var(--font-tagline)",
                    color: "#fffbc4",
                  }}
                >
                  You&apos;re the main character in all OUR stories!
                </p>
              </div>

              <div className="w-full max-w-md">
                <WaitlistForm
                  ctaLabel="Join Waitlist"
                  onSuccess={() => setSubmitted(true)}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
