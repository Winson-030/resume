"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ChromeBar } from "@/app/ui/components/ChromeBar";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProjectsSectionProps {
  messages: {
    title: string;
    subtitle: string;
    items: Array<{
      name: string;
      description: string;
      tech: string[];
      link?: string;
      highlights?: string[];
    }>;
  };
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
}

export function ProjectsSection({ messages, chrome }: ProjectsSectionProps) {
  return (
    <section id="projects" className="relative min-h-screen bg-background dark:bg-background overflow-hidden">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12">
          {messages.items.map((project, index) => (
            <FadeInWhenVisible key={project.name} delay={0.15 + index * 0.1}>
              <motion.div className="project-card relative" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <div className="project-num">{String(index + 1).padStart(2, "0")}</div>
                <div className="mt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="project-name flex-1">{project.name}</h3>
                    {project.link && (
                      <Link href={project.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                  <p className="project-desc">{project.description}</p>
                  {project.highlights && (
                    <ul className="timeline-highlights mt-4">
                      {project.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                  <div className="tag-grid mt-4">
                    {project.tech.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
