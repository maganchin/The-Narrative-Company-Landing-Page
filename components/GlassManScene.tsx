"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// Display sizing (keeps Pin.png aspect ratio — no squish)
const PIN_DISPLAY_W = 112;
// Start with a fallback; we auto-detect the true tip from Pin.png alpha.
const FALLBACK_NEEDLE_X_RATIO = 0.66;
const FALLBACK_NEEDLE_Y_RATIO = 0.92;

// Strict: very small scan around the exact tip.
const BALLOON_SCAN_RADIUS_NATURAL_PX = 2;

const isBalloonRedPixel = (r: number, g: number, b: number, a: number) => {
  if (a < 60) return false;
  const redDominance = r - g > 45 && r - b > 45;
  const brightEnough = r > 130;
  const notPinkGlow = g < 130 && b < 130;
  return brightEnough && redDominance && notPinkGlow;
};

interface Props {
  onPop: () => void;
}

export default function GlassManScene({ onPop }: Props) {
  const glassManRef = useRef<HTMLImageElement>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const hasPoppedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const needleTipRatioRef = useRef({
    x: FALLBACK_NEEDLE_X_RATIO,
    y: FALLBACK_NEEDLE_Y_RATIO,
  });
  // Keep onPop in a ref so callbacks never go stale
  const onPopRef = useRef(onPop);
  onPopRef.current = onPop;

  const popTimeoutRef = useRef<number | null>(null);

  const [pinDims, setPinDims] = useState<{ w: number; h: number } | null>(null);
  const [pinPos, setPinPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [popOverlayVisible, setPopOverlayVisible] = useState(false);
  const [popAt, setPopAt] = useState<{ x: number; y: number } | null>(null);

  // Load Pin.png once so we can scale it without squishing.
  useEffect(() => {
    const img = new Image();
    img.src = "/Pin.png";
    img.onload = () => {
      const naturalW = img.naturalWidth || 1;
      const naturalH = img.naturalHeight || 1;
      const displayW = PIN_DISPLAY_W;
      const displayH = (displayW * naturalH) / naturalW;

      // Auto-detect needle tip from image alpha: bottom-most visible pixel.
      // If multiple pixels share the same Y, choose the right-most one.
      const pinCanvas = document.createElement("canvas");
      pinCanvas.width = naturalW;
      pinCanvas.height = naturalH;
      const pinCtx = pinCanvas.getContext("2d", { willReadFrequently: true });
      if (pinCtx) {
        pinCtx.drawImage(img, 0, 0);
        const rgba = pinCtx.getImageData(0, 0, naturalW, naturalH).data;
        let bestX = -1;
        let bestY = -1;
        for (let y = 0; y < naturalH; y++) {
          for (let x = 0; x < naturalW; x++) {
            const i = (y * naturalW + x) * 4;
            const alpha = rgba[i + 3];
            if (alpha < 40) continue;
            if (y > bestY || (y === bestY && x > bestX)) {
              bestY = y;
              bestX = x;
            }
          }
        }
        if (bestX >= 0 && bestY >= 0) {
          needleTipRatioRef.current = {
            x: bestX / naturalW,
            y: bestY / naturalH,
          };
        }
      }

      setPinDims({ w: displayW, h: displayH });
      setPinPos({
        x: window.innerWidth / 2 - displayW / 2,
        y: window.innerHeight - displayH - 60,
      });
    };
  }, []);

  // Draw the GlassMan image onto an offscreen canvas for pixel sampling.
  // willReadFrequently: true is critical for perf when sampling on every drag frame.
  const setupOffscreenCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    offscreenCtxRef.current = ctx;
  }, []);

  // On each drag frame, map the pin tip's screen coords into image pixel coords
  // and sample the RGBA value. Red pixels (balloon) trigger the pop.
  const checkCollision = useCallback((tipX: number, tipY: number) => {
    if (!glassManRef.current || !offscreenCtxRef.current || hasPoppedRef.current) return;

    const rect = glassManRef.current.getBoundingClientRect();
    // Map screen position → natural image pixel coordinates
    const scaleX = glassManRef.current.naturalWidth / rect.width;
    const scaleY = glassManRef.current.naturalHeight / rect.height;
    const px = Math.round((tipX - rect.left) * scaleX);
    const py = Math.round((tipY - rect.top) * scaleY);

    // Out of image bounds — no collision
    if (
      px < 0 || py < 0 ||
      px >= glassManRef.current.naturalWidth ||
      py >= glassManRef.current.naturalHeight
    ) return;

    // Scan a small region around the needle tip so we don't miss tiny offsets
    const radius = BALLOON_SCAN_RADIUS_NATURAL_PX;
    const x0 = Math.max(0, px - radius);
    const y0 = Math.max(0, py - radius);
    const x1 = Math.min(glassManRef.current.naturalWidth - 1, px + radius);
    const y1 = Math.min(glassManRef.current.naturalHeight - 1, py + radius);

    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;

    const data = offscreenCtxRef.current.getImageData(x0, y0, w, h).data;
    let redCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (isBalloonRedPixel(r, g, b, a)) {
        redCount += 1;
      }
    }
    // Require a dense red patch to avoid "near miss" and thin red string hits.
    if (redCount < 6) return;

    hasPoppedRef.current = true;
    setPopAt({ x: tipX, y: tipY });
    setPopOverlayVisible(true);
    setIsDragging(false);
    isDraggingRef.current = false;

    if (popTimeoutRef.current) window.clearTimeout(popTimeoutRef.current);
    popTimeoutRef.current = window.setTimeout(() => {
      onPopRef.current();
    }, 170);
  }, []);

  const handlePinPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!pinPos) return;
      if (hasPoppedRef.current) return;
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      setHasInteracted(true);
      dragOffsetRef.current = {
        x: e.clientX - pinPos.x,
        y: e.clientY - pinPos.y,
      };
    },
    [pinPos]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (hasPoppedRef.current) return;

      if (!pinDims) return;

      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;

      // Constrain pin to viewport
      newX = Math.max(0, Math.min(window.innerWidth - pinDims.w, newX));
      newY = Math.max(0, Math.min(window.innerHeight - pinDims.h, newY));

      setPinPos({ x: newX, y: newY });

      // Needle tip point inside the displayed pin box
      const tipX = newX + pinDims.w * needleTipRatioRef.current.x;
      const tipY = newY + pinDims.h * needleTipRatioRef.current.y;
      checkCollision(tipX, tipY);
    },
    [checkCollision, pinDims]
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Handle already-cached images that won't fire onLoad
  useEffect(() => {
    const img = glassManRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setupOffscreenCanvas(img);
    }
  }, [setupOffscreenCanvas]);

  return (
    <motion.div
      className="fixed inset-0 z-20"
      style={{ touchAction: "none" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {popOverlayVisible && popAt && (
        <motion.div
          className="absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.08 }}
          style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
        >
          <motion.div
            className="absolute"
            style={{ left: popAt.x, top: popAt.y, width: 18, height: 18 }}
            initial={{ scale: 0.2, opacity: 0.85 }}
            animate={{ scale: 5.5, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
        </motion.div>
      )}

      {/* GlassMan — centered, no pointer events so it doesn't block pin dragging */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.img
          ref={glassManRef}
          src="/glassMan.png"
          alt="GlassMan"
          className="max-h-[70vh] max-w-[70vw] object-contain select-none"
          draggable={false}
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 0.95, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          onLoad={(e) => setupOffscreenCanvas(e.currentTarget as HTMLImageElement)}
        />
      </div>

      {/* Draggable pin — drops in with a spring, then follows pointer */}
      {pinPos && pinDims && (
        <motion.img
          src="/Pin.png"
          alt="Pin"
          className="absolute select-none"
          draggable={false}
          style={{
            left: pinPos.x,
            top: pinPos.y,
            width: pinDims.w,
            height: pinDims.h,
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
            userSelect: "none",
          }}
          // Entrance: drop in from above using transform (doesn't fight left/top)
          initial={{ y: -160, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 190,
            damping: 16,
            delay: 0.45,
          }}
          onPointerDown={handlePinPointerDown}
        />
      )}

      {/* Drag hint to make interaction obvious */}
      {!hasInteracted && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bottom-20 z-30 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p
            className="text-[#3c2eff] text-sm sm:text-base tracking-[0.08em]"
            style={{
              fontFamily: "var(--font-tagline)",
              textShadow: "0 2px 0 rgba(255,222,91,0.45)",
            }}
          >
            drag the pin
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
