"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Project {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  highlights?: string[];
}

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={project.link || "#"} target="_blank" rel="noopener noreferrer" className="block h-full">
        <div className="relative h-full bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:shadow-primary/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-mono text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              {String(index + 1).padStart(2, "0")}
            </div>
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 45 }}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
            </motion.div>
          </div>

          <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {project.description}
          </p>

          {project.highlights && project.highlights.length > 0 && (
            <ul className="space-y-1 mb-4">
              {project.highlights.map((highlight, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground/80 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2 mt-auto">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={project.name} project={project} index={index} />
      ))}
    </div>
  );
}
