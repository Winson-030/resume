"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface SkillBarProps {
  name: string;
  percentage: number;
  delay?: number;
  color?: string;
}

export function SkillBar({ name, percentage, delay = 0, color }: SkillBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const duration = 1000;
        const steps = 60;
        const increment = percentage / steps;
        let current = 0;

        const interval = setInterval(() => {
          current += increment;
          if (current >= percentage) {
            setDisplayPercentage(percentage);
            clearInterval(interval);
          } else {
            setDisplayPercentage(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(interval);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, percentage, delay]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{name}</span>
        <motion.span
          className="text-sm font-mono text-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: delay + 0.3 }}
        >
          {displayPercentage}%
        </motion.span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            background: color
              ? undefined
              : "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)",
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{
            duration: 1,
            delay,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>
    </div>
  );
}

interface SkillCategoryProps {
  title: string;
  skills: { name: string; level: number }[];
  delay?: number;
}

export function SkillCategory({ title, skills, delay = 0 }: SkillCategoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/20 transition-colors duration-300"
    >
      <h3 className="font-medium text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            percentage={skill.level}
            delay={delay + index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
}
