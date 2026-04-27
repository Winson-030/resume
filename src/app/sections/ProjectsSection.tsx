"use client";

import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ProjectGrid } from "@/app/ui/components/ProjectCard";
import { Separator } from "@/app/ui/components/Separator";

interface Project {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  highlights?: string[];
}

interface ProjectsSectionProps {
  messages: {
    title: string;
    items: Project[];
  };
}

export function ProjectsSection({ messages }: ProjectsSectionProps) {
  return (
    <section id="projects" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {messages.title}
            </h2>
            <Separator className="w-20 mx-auto" />
          </div>
        </FadeInWhenVisible>

        <ProjectGrid
          projects={messages.items.map((item) => ({
            ...item,
            highlights: item.highlights || [],
          }))}
        />
      </div>
    </section>
  );
}
