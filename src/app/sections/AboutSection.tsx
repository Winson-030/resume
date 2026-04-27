"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { CertificateGrid } from "@/app/ui/components/CertificateCard";
import { Card } from "@/app/ui/components/Card";
import { Separator } from "@/app/ui/components/Separator";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

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
  certificates: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  skills: string[];
}

export function AboutSection({ messages, certificates, skills }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {messages.title}
            </h2>
            <Separator className="w-20 mx-auto" />
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <FadeInWhenVisible delay={0.1} direction="left">
            <div className="space-y-8">
              <p className="text-base text-muted-foreground leading-relaxed">
                {messages.content}
              </p>

              <div>
                <h3 className="text-lg font-medium mb-4">{messages.techStack}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2} direction="right">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  {messages.education.title}
                </h3>
                <div className="space-y-2">
                  <p className="text-foreground font-medium">
                    {messages.education.degree}
                  </p>
                  <p className="text-muted-foreground">
                    {messages.education.school}
                  </p>
                  <p className="text-sm text-muted-foreground/70 font-mono">
                    {messages.education.year}
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="flex gap-4">
                  <Link
                    href="https://github.com/winson-030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/winson-dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link
                    href="mailto:mail@winson.dev"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </Link>
                </div>
              </Card>
            </div>
          </FadeInWhenVisible>
        </div>

        <FadeInWhenVisible delay={0.3}>
          <div className="mt-16">
            <h3 className="text-xl font-medium text-center mb-8">Certifications</h3>
            <CertificateGrid
              certificates={certificates.map((cert) => ({
                ...cert,
                icon: undefined,
              }))}
            />
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
