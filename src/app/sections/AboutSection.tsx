"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ChromeBar } from "@/app/ui/components/ChromeBar";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

function SocialLink({ href, icon: Icon, ariaLabel }: { href: string; icon: React.ElementType; ariaLabel: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full focus-visible:outline-none"
      aria-label={ariaLabel}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

interface AboutSectionProps {
  messages: {
    title: string;
    content: string;
    techStack: string;
    education: {
      title: string;
      degree: string;
      school: string;
      year: string;
    };
  };
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
  certificates: Array<{ name: string; issuer: string; date: string }>;
  skills: string[];
}

export function AboutSection({ messages, chrome, certificates, skills }: AboutSectionProps) {
  return (
    <section id="about" className="relative min-h-screen bg-background dark:bg-background overflow-hidden">
      <ChromeBar labels={chrome} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <FadeInWhenVisible delay={0.1}>
              <h2 className="h-xl">{messages.title}</h2>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <p className="lead mt-6 opacity-65 font-sans-zh">{messages.content}</p>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="mt-10">
                <h3 className="kicker mb-4">{messages.techStack}</h3>
                <div className="tag-grid">
                  {skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      className="tag"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </FadeInWhenVisible>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <FadeInWhenVisible delay={0.2}>
              <div className="pl-6 border-l border-foreground/10">
                <p className="kicker mb-3">{messages.education.title}</p>
                <p className="text-lg font-serif-zh font-medium">{messages.education.degree}</p>
                <p className="text-sm text-muted-foreground mt-1">{messages.education.school}</p>
                <p className="text-xs font-mono-alt text-muted-foreground/50 mt-2">{messages.education.year}</p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="flex gap-4 pl-6">
                <SocialLink href="https://github.com/winson-030" icon={Github} ariaLabel="GitHub Profile" />
                <SocialLink href="https://www.linkedin.com/in/winson-dev" icon={Linkedin} ariaLabel="LinkedIn Profile" />
                <SocialLink href="mailto:mail@winson.dev" icon={Mail} ariaLabel="Send Email" />
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.4}>
              <div className="space-y-4 mt-8">
                {certificates.map((cert) => (
                  <motion.div
                    key={cert.name}
                    className="pl-4 border-l border-foreground/10 hover:border-foreground/25 transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    <p className="text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cert.issuer} · {cert.date}</p>
                  </motion.div>
                ))}
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </div>
    </section>
  );
}
