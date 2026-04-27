"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/app/ui/components/Button";
import { TypewriterText } from "@/app/ui/animations/TypewriterText";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ArrowRight, Download } from "lucide-react";
import { ParticleBackground } from "@/app/ui/animations/ParticleBackground";

interface HeroSectionProps {
  messages: {
    greeting: string;
    name: string;
    title: string;
    description: string;
    contact: string;
    download: string;
  };
}

export function HeroSection({ messages }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInWhenVisible delay={0.1}>
          <p className="text-sm text-muted-foreground mb-4 tracking-wide uppercase">
            {messages.greeting}
          </p>
        </FadeInWhenVisible>

        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight">
            <TypewriterText
              text={messages.name}
              speed={100}
              delay={300}
              className="block"
            />
          </h1>
        </div>

        <FadeInWhenVisible delay={1.2}>
          <h2 className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-6">
            {messages.title}
          </h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={1.4}>
          <p className="text-base text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto mb-10">
            {messages.description}
          </p>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={1.6}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="https://r.easycv.cn/winson" target="_blank">
                <Button size="lg" className="group text-base px-8">
                  <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                  {messages.download}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="#contact">
                <Button size="lg" variant="outline" className="group text-base px-8">
                  {messages.contact}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={2}>
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-muted-foreground/50 to-transparent" />
          </motion.div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
