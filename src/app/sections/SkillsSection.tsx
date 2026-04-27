"use client";

import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { SkillCategory } from "@/app/ui/components/SkillBar";
import { Separator } from "@/app/ui/components/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/components/Tabs";

interface Skill {
  name: string;
  level: number;
}

interface SkillsSectionProps {
  messages: {
    title: string;
    categories: {
      cloud: string;
      infrastructure: string;
      tools: string;
    };
    cloud: Skill[];
    infrastructure: Skill[];
    tools: Skill[];
  };
}

export function SkillsSection({ messages }: SkillsSectionProps) {
  return (
    <section id="skills" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {messages.title}
            </h2>
            <Separator className="w-20 mx-auto" />
          </div>
        </FadeInWhenVisible>

        <Tabs defaultValue="cloud" className="w-full">
          <FadeInWhenVisible delay={0.1}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="cloud">{messages.categories.cloud}</TabsTrigger>
              <TabsTrigger value="infrastructure">{messages.categories.infrastructure}</TabsTrigger>
              <TabsTrigger value="tools">{messages.categories.tools}</TabsTrigger>
            </TabsList>
          </FadeInWhenVisible>

          <TabsContent value="cloud">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {messages.cloud.map((skill, index) => (
                <SkillCategory
                  key={skill.name}
                  title={skill.name}
                  skills={[
                    { name: "Proficiency", level: skill.level },
                    { name: "Experience", level: Math.max(skill.level - 10, 60) },
                  ]}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="infrastructure">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {messages.infrastructure.map((skill, index) => (
                <SkillCategory
                  key={skill.name}
                  title={skill.name}
                  skills={[
                    { name: "Proficiency", level: skill.level },
                    { name: "Experience", level: Math.max(skill.level - 10, 60) },
                  ]}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {messages.tools.map((skill, index) => (
                <SkillCategory
                  key={skill.name}
                  title={skill.name}
                  skills={[
                    { name: "Proficiency", level: skill.level },
                    { name: "Experience", level: Math.max(skill.level - 10, 60) },
                  ]}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
