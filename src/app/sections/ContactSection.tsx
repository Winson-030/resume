"use client";

import { FadeInWhenVisible } from "@/app/ui/animations/FadeInWhenVisible";
import { ChromeBar } from "@/app/ui/components/ChromeBar";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SocialLink } from "./SocialLink";

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
  chrome: {
    topLeft: string;
    topRight: string;
    bottomLeft?: string;
    bottomRight: string;
  };
}

export function ContactSection({ messages, chrome }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="relative min-h-screen bg-background dark:bg-background flex items-center overflow-hidden">
      <ChromeBar labels={chrome} />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <FadeInWhenVisible delay={0.1}>
              <h2 className="h-xl">{messages.title}</h2>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <p className="lead mt-6 opacity-65 max-w-md">{messages.description}</p>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="mt-10 flex items-center gap-6">
                {[
                  { href: "https://github.com/winson-030", icon: Github, ariaLabel: "GitHub Profile" },
                  { href: "https://www.linkedin.com/in/winson-dev", icon: Linkedin, ariaLabel: "LinkedIn Profile" },
                  { href: "mailto:mail@winson.dev", icon: Mail, ariaLabel: "Send Email" },
                ].map(({ href, icon: Icon, ariaLabel }) => (
                  <SocialLink key={href} href={href} icon={Icon} ariaLabel={ariaLabel} />
                ))}
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.4}>
              <div className="mt-10">
                <Link
                  href="https://r.easycv.cn/winsonli_jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                  aria-label="Download Resume PDF"
                >
                  Download Resume (PDF)
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </FadeInWhenVisible>
          </div>

          <FadeInWhenVisible delay={0.2}>
            <div className="pl-6 border-l border-foreground/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {(["name", "email"] as const).map((field) => (
                  <div key={field}>
                    <label className="kicker block mb-2">{messages.form[field]}</label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full bg-transparent border-b border-foreground/15 pb-2 text-lg font-serif-zh focus:border-foreground/40 outline-none transition-colors"
                      placeholder={messages.form[field]}
                    />
                  </div>
                ))}
                <div>
                  <label className="kicker block mb-2">{messages.form.message}</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full bg-transparent border-b border-foreground/15 pb-2 text-lg font-serif-zh focus:border-foreground/40 outline-none transition-colors resize-none"
                    placeholder={messages.form.message}
                  />
                </div>
                <motion.button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background text-sm tracking-wide hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-opacity"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Submit Contact Form"
                >
                  {messages.form.send}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                {submitted && (
                  <p className="text-sm text-muted-foreground mt-4 font-sans-zh">✓ Message sent!</p>
                )}
              </form>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
}
