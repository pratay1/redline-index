"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export function WireframeCar({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative w-full ${className}`}
      initial={reduceMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src="/thisisnthardtocodeatall.png"
        alt=""
        width={1600}
        height={700}
        preload
        className="h-auto w-full object-contain"
      />
    </motion.div>
  );
}
