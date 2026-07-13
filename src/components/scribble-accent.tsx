"use client";

import { motion, useReducedMotion } from "motion/react";

export function ScribbleAccent({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 520 120"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-[-2%] top-[92%] h-[0.78em] w-[104%] ${className}`}
    >
      <motion.path
        d="M18 74 C 72 52 88 34 142 48 C 210 66 248 92 318 70 C 372 54 410 28 468 42 C 490 48 504 58 508 66"
        stroke="var(--signal)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.92 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      />
      <motion.path
        d="M36 82 C 96 58 128 40 178 52 C 248 70 286 96 356 78 C 404 66 448 40 494 54"
        stroke="var(--signal-hover)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.55"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
    </svg>
  );
}
