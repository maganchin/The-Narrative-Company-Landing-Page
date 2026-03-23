"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import WaitlistForm from "./WaitlistForm";

type WaitlistState = "initial" | "congrats" | "guessOffer";

interface Props {
  onStartGuessing: () => void;
}

export default function WaitlistSection({ onStartGuessing }: Props) {
  const [state, setState] = useState<WaitlistState>("initial");
  const headingControls = useAnimation();

  useEffect(() => {
    if (state !== "initial") return;

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
  }, [state, headingControls]);

  // Immediately reveal the guess offer after congrats (no extra delay)
  useEffect(() => {
    if (state !== "congrats") return;
    setState("guessOffer");
  }, [state]);

  return (
    <>
      {state === "initial" && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-20 flex justify-center px-4 sm:hidden">
          <motion.p
            className="max-w-xs text-[13px] leading-snug tracking-[0.12em] text-center max-sm:mix-blend-difference sm:mix-blend-normal"
            style={{
              fontFamily: "var(--font-tagline)",
              color: "#3c2eff",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            You&apos;re the main character in all OUR stories!
          </motion.p>
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 z-10 flex items-end justify-end pb-6 px-4 sm:pb-10 sm:px-10">
        <motion.div
          className={`pointer-events-auto w-full max-w-xl flex flex-col gap-3 sm:gap-4 ${
            state === "initial" ? "items-center sm:items-end" : "items-center"
          }`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {state === "congrats" || state === "guessOffer" ? (
            <div className="flex flex-col items-center gap-5">
              <div className="inline-block rounded-3xl px-6 py-4 sm:px-8 sm:py-5">
                <p
                  className="text-3xl sm:text-4xl md:text-5xl tracking-tight max-sm:mix-blend-difference sm:mix-blend-normal max-sm:[text-shadow:none] sm:[text-shadow:0_4px_0_#ffde5b]"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#3c2eff",
                  }}
                >
                  Congratulations!
                </p>
              </div>

              {state === "guessOffer" && (
                <motion.div
                  className="flex flex-col items-center gap-3 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.p
                    className="text-sm sm:text-base tracking-[0.1em] max-sm:mix-blend-difference sm:mix-blend-normal"
                    style={{
                      fontFamily: "var(--font-tagline)",
                      color: "#3c2eff",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    do you want to try guessing the game?
                  </motion.p>

                  <motion.button
                    onClick={onStartGuessing}
                    className="px-7 py-3 rounded-2xl text-sm sm:text-base tracking-[0.06em] mix-blend-normal"
                    style={{
                      fontFamily: "var(--font-tagline)",
                      backgroundColor: "#3c2eff",
                      color: "#ffde5b",
                    }}
                    initial={{ opacity: 0, scale: 0.3, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 11,
                      delay: 0,
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    yes i&apos;m impatient
                  </motion.button>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <div className="w-full flex flex-col items-center sm:items-end text-center sm:text-right gap-1.5 sm:gap-2">
                <motion.span
                  className="hidden sm:inline-block text-[2.6rem] sm:text-[3.1rem] md:text-[3.8rem] leading-none pr-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#ffde5b",
                    textShadow:
                      "0 4px 0 #3c2eff, 1px 4px 0 #3c2eff, -1px 4px 0 #3c2eff",
                  }}
                  animate={headingControls}
                >
                  waitlist
                </motion.span>
                <p
                  className="hidden sm:block w-full max-w-md text-xs sm:text-sm md:text-base leading-snug tracking-[0.12em]"
                  style={{
                    fontFamily: "var(--font-tagline)",
                    color: "#3c2eff",
                  }}
                >
                  You&apos;re the main character in all OUR stories!
                </p>
              </div>

              <div className="w-full max-w-md">
                <WaitlistForm
                  ctaLabel="Join Waitlist"
                  onSuccess={() => setState("congrats")}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
