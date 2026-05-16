"use client";

import {motion} from "framer-motion";
import {FadeInWhenVisible} from "@/app/ui/animations/FadeInWhenVisible";
import {ChromeBar} from "@/app/ui/components/ChromeBar";
import {useReducedMotion} from "@/app/ui/hooks/useReducedMotion";

interface Skill {
  name: string;
}

interface SkillsSectionProps {
  messages: {
    title: string;
    subtitle: string;
    categories: {
      cloud: string;
      infrastructure: string;
      tools: string;
    };
    cloud: Skill[];
    infrastructure: Skill[];
    tools: Skill[];
  };
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
}

function SkillPipeline({ title, skills, delay = 0, prefersReducedMotion = false }: { title: string; skills: Skill[]; delay?: number; prefersReducedMotion?: boolean }) {
  return (
    <div className="pipeline-section">
      <div className="font-sans-zh font-medium tracking-tight text-sm opacity-40 uppercase tracking-[0.08em] mb-4">{title}</div>
      <div className="pipeline">
        {skills.map((skill, i) => (
          <FadeInWhenVisible key={skill.name} delay={delay + i * 0.08}>
            <motion.div 
              className="step" 
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ outline: 'none' }}
            >
              <div 
                className="step-title font-serif-zh font-medium" 
                tabIndex={0} 
                role="article" 
                aria-label={`Skill: ${skill.name}`}
              >
                {skill.name}
              </div>
            </motion.div>
          </FadeInWhenVisible>
        ))}
      </div>
    </div>
  );
}

export function SkillsSection({ messages, chrome }: SkillsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const totalSkills = 
    messages.cloud.length + 
    messages.infrastructure.length + 
    messages.tools.length;
  const delayBase = 0.3;

  return (
    <section id="skills" className="relative min-h-screen bg-muted/50 dark:bg-background overflow-hidden">
      <ChromeBar labels={chrome} />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <FadeInWhenVisible delay={delayBase}>
          <h2 className="h-xl font-sans-zh font-medium tracking-tight">{messages.title}</h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={delayBase + 0.1}>
          <p className="lead mt-4 opacity-55 max-w-lg">
            {messages.subtitle}
          </p>
        </FadeInWhenVisible>

        <div className="mt-12">
          <SkillPipeline 
            title={messages.categories.cloud} 
            skills={messages.cloud} 
            delay={delayBase + 0.2}
            prefersReducedMotion={prefersReducedMotion}
          />
          <SkillPipeline 
            title="Infrastructure & DevOps" 
            skills={messages.infrastructure} 
            delay={delayBase + 0.3}
            prefersReducedMotion={prefersReducedMotion}
          />
          <SkillPipeline 
            title="Tools & Practices" 
            skills={messages.tools} 
            delay={delayBase + 0.4}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>
    </section>
  );
}
