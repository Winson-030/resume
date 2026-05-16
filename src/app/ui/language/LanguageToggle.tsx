"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Language = "en" | "zh" | "ja";

const languages: { code: Language; label: string; full: string }[] = [
  { code: "en", label: "EN", full: "English" },
  { code: "zh", label: "中文", full: "Chinese" },
  { code: "ja", label: "日本語", full: "Japanese" },
];

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const currentLang = (pathname.split("/")[1] as Language) || "en";

  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const onChange = () => setPrefersReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === currentLang) return;

    let newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    if (!pathname.startsWith("/en") && !pathname.startsWith("/zh") && !pathname.startsWith("/ja")) {
      newPath = `/${newLang}${pathname}`;
    }
    if (newPath === `/${newLang}/`) {
      newPath = `/${newLang}`;
    }

    router.push(newPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % languages.length;
      refs.current[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + languages.length) % languages.length;
      refs.current[prev]?.focus();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleLanguageChange(languages[index].code);
    }
  };

  return (
    <nav
      className="inline-flex items-center rounded-full border border-foreground/10 bg-background/80 p-0.5 backdrop-blur-sm"
      role="radiogroup"
      aria-label="Language selection"
    >
      {languages.map((lang, index) => {
        const isActive = lang.code === currentLang;
        return (
          <button
            key={lang.code}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${lang.full}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleLanguageChange(lang.code)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "relative z-10 px-3 py-1.5 text-xs font-mono-alt font-medium tracking-wider rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-foreground/10"
                layoutId="language-pill"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
              />
            )}
            <span className="relative z-10">{lang.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
