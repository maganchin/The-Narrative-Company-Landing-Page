"use client";

import { useEffect, useRef, useCallback } from "react";

const HEX_SIZE = 36; // radius of each hexagon
const GAP = 2;
const GLOW_RADIUS = 160; // px — how far the illumination spreads from cursor
const FADE_SPEED = 0.07; // how quickly glows decay per frame

interface HexCell {
  x: number;
  y: number;
  glow: number; // 0–1
}

function hexCorners(cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }) as [number, number][];
}

function hexPath(corners: [number, number][]): Path2D {
  const p = new Path2D();
  p.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < 6; i++) p.lineTo(corners[i][0], corners[i][1]);
  p.closePath();
  return p;
}

export default function HoneycombOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<HexCell[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });

  // Build grid of hex cell centers
  const buildGrid = useCallback((w: number, h: number) => {
    const cells: HexCell[] = [];
    const r = HEX_SIZE;
    const colW = r * Math.sqrt(3) + GAP;
    const rowH = r * 1.5 + GAP * 0.5;
    const cols = Math.ceil(w / colW) + 2;
    const rows = Math.ceil(h / rowH) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offset = row % 2 === 0 ? 0 : colW / 2;
        cells.push({
          x: col * colW + offset,
          y: row * rowH,
          glow: 0,
        });
      }
    }
    cellsRef.current = cells;
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    dimRef.current = { w, h };
    buildGrid(w, h);
  }, [buildGrid]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { w, h } = dimRef.current;
    ctx.clearRect(0, 0, w, h);

    const mouse = mouseRef.current;
    const cells = cellsRef.current;
    const r = HEX_SIZE - GAP;

    for (const cell of cells) {
      // Update glow based on mouse distance
      if (mouse) {
        const dx = cell.x - mouse.x;
        const dy = cell.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = Math.max(0, 1 - dist / GLOW_RADIUS);
        cell.glow = Math.max(cell.glow, target);
      }

      // Decay
      cell.glow = Math.max(0, cell.glow - FADE_SPEED);

      if (cell.glow < 0.004) continue;

      const corners = hexCorners(cell.x, cell.y, r);
      const path = hexPath(corners);

      // Fill: very subtle illumination
      const alpha = cell.glow * 0.18;
      ctx.fillStyle = `rgba(123,47,255,${alpha})`;
      ctx.fill(path);

      // Stroke: glowing edge
      const strokeAlpha = cell.glow * 0.55;
      // Color shifts from purple → pink at closer distances
      const pinkBlend = cell.glow;
      const rVal = Math.round(123 + pinkBlend * (255 - 123));
      const gVal = Math.round(47 + pinkBlend * (45 - 47));
      const bVal = Math.round(255 + pinkBlend * (155 - 255));
      ctx.strokeStyle = `rgba(${rVal},${gVal},${bVal},${strokeAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke(path);
    }

    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleResize, render]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
      aria-hidden
    />
  );
}
