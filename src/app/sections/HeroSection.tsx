"use client";

import type { CSSProperties } from "react";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ChromeBar } from "@/app/ui/components/ChromeBar";
import { WebGLBackground } from "@/app/ui/animations/WebGLBackground";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { useReducedMotion } from "@/app/ui/hooks/useReducedMotion";

interface HeroSectionProps {
  messages: {
    greeting: string;
    name: string;
    subname?: string;
    title: string;
    description: string;
    contact: string;
    download: string;
  };
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
}

export function HeroSection({ messages, chrome }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background dark:bg-background">
      <WebGLBackground />

      <ChromeBar
        labels={{
          topLeft: chrome.topLeft,
          topRight: chrome.topRight,
          bottomLeft: `${messages.name} — ${messages.title}`,
          bottomRight: chrome.bottomRight,
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center min-h-screen">
        <div className="reveal" style={{ "--reveal-delay": "200ms" } as CSSProperties}>
          <p className="font-mono-alt text-sm tracking-[0.12em] uppercase opacity-45 mb-6">
            {messages.greeting}
          </p>
        </div>

        <div className="mb-6">
          <h1 className="h-hero">{messages.name}</h1>
          {messages.subname && (
            <div className="reveal" style={{ "--reveal-delay": "400ms" } as CSSProperties}>
              <p className="text-xl md:text-2xl lg:text-3xl font-sans-zh text-muted-foreground font-light tracking-wide mt-3 opacity-70">
                {messages.subname}
              </p>
            </div>
          )}
        </div>

        <div className="reveal" style={{ "--reveal-delay": "600ms" } as CSSProperties}>
          <p className="lead max-w-xl mt-4 opacity-70">{messages.title}</p>
        </div>

        <div className="reveal" style={{ "--reveal-delay": "800ms" } as CSSProperties}>
          <p className="text-base text-muted-foreground/60 leading-relaxed max-w-lg mt-4 mb-10 font-sans-zh font-light">
            {messages.description}
          </p>
        </div>

        <div className="reveal" style={{ "--reveal-delay": "1000ms" } as CSSProperties}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="https://r.easycv.cn/winsonli_jp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background text-sm tracking-wide hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-opacity"
              aria-label="Download Resume"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {messages.download}
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3 border border-foreground/20 text-sm tracking-wide hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              aria-label="Contact Section"
            >
              {messages.contact}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <FadeInWhenVisible delay={1.5}>
          {!prefersReducedMotion && (
            <div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-muted-foreground/30 to-transparent" />
            </div>
          )}
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
