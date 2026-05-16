"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ChromeBar } from "@/app/ui/components/ChromeBar";

interface StatsSectionProps {
  messages: {
    title: string;
    subtitle: string;
    items: Array<{ label: string; value: string; note: string }>;
  };
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
}

export function StatsSection({ messages, chrome }: StatsSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center bg-muted/50 dark:bg-background overflow-hidden">
      <ChromeBar labels={chrome} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <FadeInWhenVisible delay={0.1}>
          <h2 className="h-xl">{messages.title}</h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.2}>
          <p className="lead mt-4 opacity-55 max-w-lg">{messages.subtitle}</p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10 mt-12">
          {messages.items.map((stat, index) => (
            <FadeInWhenVisible key={stat.label} delay={0.15 + index * 0.08}>
              <motion.div
                className="stat-card"
                whileHover={{ opacity: 1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-label">{stat.label}</div>
                <div className="stat-nb">{stat.value}</div>
                <div className="stat-note">{stat.note}</div>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
