"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const themes: { value: string; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
];

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const currentTheme = theme || "system";
  const currentIndex = themes.findIndex((t) => t.value === currentTheme);

  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const onChange = () => setPrefersReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const handleThemeChange = (value: string) => {
    if (value === currentTheme) return;
    setTheme(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % themes.length;
      refs.current[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + themes.length) % themes.length;
      refs.current[prev]?.focus();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleThemeChange(themes[index].value);
    }
  };

  return (
    <nav
      className="inline-flex items-center rounded-full border border-foreground/10 bg-background/80 p-0.5 backdrop-blur-sm"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map((t, index) => {
        const Icon = t.icon;
        const isActive = t.value === currentTheme;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${t.label} theme`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleThemeChange(t.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-foreground/10"
                layoutId="theme-pill"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
