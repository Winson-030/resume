"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ChromeBar } from "@/app/ui/components/ChromeBar";

interface ExperienceSectionProps {
  messages: {
    title: string;
    subtitle: string;
    items: Array<{
      company: string;
      position: string;
      period: string;
      location: string;
      description: string;
      highlights?: string[];
      tags: string[];
    }>;
  };
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
}

export function ExperienceSection({ messages, chrome }: ExperienceSectionProps) {
  return (
    <section id="experience" className="relative min-h-screen bg-muted/50 dark:bg-background overflow-hidden">
      <ChromeBar labels={chrome} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <FadeInWhenVisible delay={0.1}>
          <h2 className="h-xl">{messages.title}</h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.2}>
          <p className="lead mt-4 opacity-55 max-w-lg">
            {messages.subtitle}
          </p>
        </FadeInWhenVisible>

        <div className="magazine-timeline mt-12">
          {messages.items.map((item, index) => (
            <FadeInWhenVisible key={item.company} delay={0.15 + index * 0.1}>
              <motion.div className="timeline-entry" whileHover={{ opacity: 1 }}>
                <div className="timeline-date">{item.period}</div>
                <div className="timeline-company">{item.company}</div>
                <div className="timeline-position">{item.position} · {item.location}</div>
                <div className="timeline-desc">{item.description}</div>
                {item.highlights && (
                  <ul className="timeline-highlights mt-4">
                    {item.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                <div className="tag-grid mt-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
