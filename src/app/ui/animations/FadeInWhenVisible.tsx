"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface FadeInWhenVisibleProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function FadeInWhenVisible({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
}: FadeInWhenVisibleProps) {
  const prefersReducedMotion = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  })[0];

  const directions = {
    up: { y: prefersReducedMotion ? 0 : 40, x: 0 },
    down: { y: prefersReducedMotion ? 0 : -40, x: 0 },
    left: { x: prefersReducedMotion ? 0 : 40, y: 0 },
    right: { x: prefersReducedMotion ? 0 : -40, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once, margin: "-50px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
