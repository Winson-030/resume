"use client";

import { motion } from "framer-motion";
import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { Card } from "@/app/ui/components/Card";
import { ContactForm } from "@/app/ui/components/ContactForm";
import { Separator } from "@/app/ui/components/Separator";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

interface ContactSectionProps {
  messages: {
    title: string;
    description: string;
    form: {
      name: string;
      email: string;
      message: string;
      send: string;
    };
  };
}

export function ContactSection({ messages }: ContactSectionProps) {
  return (
    <section id="contact" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {messages.title}
            </h2>
            <Separator className="w-20 mx-auto" />
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <FadeInWhenVisible delay={0.1} direction="left" className="h-full">
            <Card className="p-6 h-full flex flex-col border-transparent shadow-none">
              <div className="space-y-8 flex-1">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {messages.description}
                </p>

                <div className="space-y-4">
                  <h3 className="font-medium">Connect with me</h3>
                  <div className="flex gap-4">
                    <Link
                      href="https://github.com/winson-030"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </motion.div>
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/winson-dev"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </motion.div>
                    </Link>
                    <Link href="mailto:mail@winson.dev">
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                      </motion.div>
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Email</h3>
                  <Link
                    href="mailto:mail@winson.dev"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    mail@winson.dev
                  </Link>
                </div>
              </div>
            </Card>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2} direction="right" className="h-full">
            <Card className="p-6 h-full">
              <ContactForm labels={messages.form} />
            </Card>
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
}
