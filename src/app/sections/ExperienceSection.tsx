"use client";

import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { Timeline } from "@/app/ui/components/Timeline";
import { Separator } from "@/app/ui/components/Separator";

interface ExperienceSectionProps {
  messages: {
    title: string;
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
}

export function ExperienceSection({ messages }: ExperienceSectionProps) {
  const timelineItems = messages.items.map((item) => ({
    title: item.position,
    subtitle: item.company,
    period: item.period,
    location: item.location,
    description: item.description,
    highlights: item.highlights,
    tags: item.tags,
  }));

  return (
    <section id="experience" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {messages.title}
            </h2>
            <Separator className="w-20 mx-auto" />
          </div>
        </FadeInWhenVisible>

        <Timeline items={timelineItems} />
      </div>
    </section>
  );
}
