"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInWhenVisibleProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const hiddenClasses = {
  up: "opacity-0 translate-y-6",
  down: "opacity-0 -translate-y-6",
  left: "opacity-0 translate-x-6",
  right: "opacity-0 -translate-x-6",
} as const;

export function FadeInWhenVisible({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
}: FadeInWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only elements that are still below the fold are hidden, and only after
    // hydration: the server-rendered HTML is always fully visible.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.95) return;

    setHidden(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHidden(false);
          if (once) observer.disconnect();
        } else if (!once) {
          setHidden(true);
        }
      },
      { rootMargin: "-50px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] ease-[cubic-bezier(0.4,0,0.2,1)]",
        hidden ? hiddenClasses[direction] : "opacity-100 translate-x-0 translate-y-0",
        className
      )}
      style={{
        transitionDuration: `${duration * 1000}ms`,
        transitionDelay: hidden ? "0ms" : `${delay * 1000}ms`,
      }}
    >
      {children}
    </div>
  );
}
