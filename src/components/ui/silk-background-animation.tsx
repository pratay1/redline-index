"use client";

import { useEffect, useRef } from "react";

type SilkBackgroundProps = {
  className?: string;
};

/**
 * Fixed full-viewport silk field — darker and quieter than the homepage beams.
 * Renders at a reduced buffer scale, then upscales for soft folds without purple tint.
 */
export function SilkBackground({ className = "" }: SilkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d", { alpha: false });
    if (!bufferCtx) return;

    let time = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let bw = 0;
    let bh = 0;

    const SCALE = 0.32;
    const PATTERN_SCALE = 1.85;
    const SPEED = 0.014;
    const NOISE = 0.55;

    const noise = (x: number, y: number) => {
      const G = 2.71828;
      const rx = G * Math.sin(G * x);
      const ry = G * Math.sin(G * y);
      return (rx * ry * (1 + x)) % 1;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      bw = Math.max(160, Math.floor(width * SCALE));
      bh = Math.max(90, Math.floor(height * SCALE));
      buffer.width = bw;
      buffer.height = bh;
    };

    const paintFrame = (t: number) => {
      const imageData = bufferCtx.createImageData(bw, bh);
      const data = imageData.data;
      const tOffset = SPEED * t;

      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const u = (x / bw) * PATTERN_SCALE;
          const v = (y / bh) * PATTERN_SCALE;

          const texX = u;
          const texY = v + 0.028 * Math.sin(8.0 * texX - tOffset);

          const pattern =
            0.55 +
            0.45 *
              Math.sin(
                5.0 *
                  (texX +
                    texY +
                    Math.cos(3.0 * texX + 5.0 * texY) +
                    0.018 * tOffset) +
                  Math.sin(18.0 * (texX + texY - 0.08 * tOffset)),
              );

          const rnd = noise(x * 0.85, y * 0.85);
          const intensity = Math.max(
            0,
            pattern - (rnd / 15.0) * NOISE,
          );

          // Near-black silk — cooler gray, never purple, darker than beams stage
          const lum = 6 + intensity * 22;
          const r = Math.floor(lum * 0.92);
          const g = Math.floor(lum * 0.94);
          const b = Math.floor(lum);

          const index = (y * bw + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }

      bufferCtx.putImageData(imageData, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(buffer, 0, 0, width, height);

      const veil = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72,
      );
      veil.addColorStop(0, "rgba(0, 0, 0, 0.15)");
      veil.addColorStop(0.55, "rgba(0, 0, 0, 0.45)");
      veil.addColorStop(1, "rgba(0, 0, 0, 0.82)");
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, width, height);

      const bottom = ctx.createLinearGradient(0, height * 0.55, 0, height);
      bottom.addColorStop(0, "rgba(0, 0, 0, 0)");
      bottom.addColorStop(1, "rgba(0, 0, 0, 0.55)");
      ctx.fillStyle = bottom;
      ctx.fillRect(0, 0, width, height);
    };

    resize();
    paintFrame(0);

    if (reduceMotion) {
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    const tick = () => {
      if (!running) return;
      time += 1;
      paintFrame(time);
      animationRef.current = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        if (animationRef.current !== undefined) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }
      if (!running) {
        running = true;
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      resize();
      paintFrame(time);
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full ${className}`}
    />
  );
}

/** Demo-compatible alias from the source component package. */
export const Component = SilkBackground;
