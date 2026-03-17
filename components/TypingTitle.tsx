"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TypingTitleProps {
  text: string;
  onComplete?: () => void;
  startDelay?: number;
  charDelay?: number;
  className?: string;
  showCursor?: boolean;
}

export default function TypingTitle({
  text,
  onComplete,
  startDelay = 500,
  charDelay = 65,
  className = "",
  showCursor = true,
}: TypingTitleProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);
  const completedRef = useRef(false);
  const callbackRef = useRef(onComplete);
  callbackRef.current = onComplete;

  // Initial delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  // Typing loop
  useEffect(() => {
    if (!started) return;
    if (count >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        setTimeout(() => callbackRef.current?.(), 280);
      }
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), charDelay);
    return () => clearTimeout(t);
  }, [started, count, text.length, charDelay]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorOn((v) => !v), 520);
    return () => clearInterval(interval);
  }, []);

  const done = count >= text.length;

  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -14, scaleY: 0.5 }}
          animate={
            i < count
              ? { opacity: 1, y: 0, scaleY: 1 }
              : { opacity: 0, y: -14, scaleY: 0.5 }
          }
          transition={{
            type: "spring",
            stiffness: 460,
            damping: 28,
            mass: 0.5,
          }}
          style={{
            display: char === " " ? "inline" : "inline-block",
            whiteSpace: "pre",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}

      {/* Blinking cursor */}
      {showCursor && (
        <motion.span
          className="inline-block rounded-[1px] bg-[#ff2d9b] align-middle"
          style={{ width: "0.07em", height: "0.82em", marginLeft: "0.06em" }}
          animate={{ opacity: cursorOn && !done ? 1 : 0 }}
          transition={{ duration: 0.07 }}
        />
      )}
    </span>
  );
}
