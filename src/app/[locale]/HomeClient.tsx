"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/app/ui/theme/ThemeToggle";
import { LanguageToggle } from "@/app/ui/language/LanguageToggle";
import { HeroSection } from "@/app/sections/HeroSection";
import { AboutSection } from "@/app/sections/AboutSection";
import { ExperienceSection } from "@/app/sections/ExperienceSection";
import { SkillsSection } from "@/app/sections/SkillsSection";
import { ProjectsSection } from "@/app/sections/ProjectsSection";
import { ContactSection } from "@/app/sections/ContactSection";
import { PageTransition } from "@/app/ui/components/PageTransition";
import { Menu, X } from "lucide-react";

interface HomeClientProps {
  messages: {
    navigation: {
      about: string;
      experience: string;
      skills: string;
      projects: string;
      contact: string;
    };
    hero: {
      greeting: string;
      name: string;
      title: string;
      description: string;
      contact: string;
      download: string;
    };
    about: {
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
    experience: {
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
    skills: {
      title: string;
      categories: {
        cloud: string;
        infrastructure: string;
        tools: string;
      };
      cloud: Array<{ name: string; level: number }>;
      infrastructure: Array<{ name: string; level: number }>;
      tools: Array<{ name: string; level: number }>;
    };
    projects: {
      title: string;
      items: Array<{
        name: string;
        description: string;
        tech: string[];
        link?: string;
        highlights?: string[];
      }>;
    };
    contact: {
      title: string;
      description: string;
      form: {
        name: string;
        email: string;
        message: string;
        send: string;
      };
    };
    footer: {
      copyright: string;
    };
  };
}

function Navbar({ messages, activeSection }: { messages: HomeClientProps["messages"]; activeSection: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "about", label: messages.navigation.about },
    { id: "experience", label: messages.navigation.experience },
    { id: "skills", label: messages.navigation.skills },
    { id: "projects", label: messages.navigation.projects },
    { id: "contact", label: messages.navigation.contact },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="text-lg font-medium"
              whileHover={{ scale: 1.02 }}
            >
              <Link href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Winson
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-sm transition-colors rounded-full ${
                    activeSection === item.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-secondary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <ThemeToggle />
              <button
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(item.id)}
                    className="text-2xl font-medium text-left py-2"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer({ messages }: { messages: HomeClientProps["messages"] }) {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">{messages.footer.copyright}</p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="https://github.com/winson-030" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
            <Link href="https://www.linkedin.com/in/winson-dev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              LinkedIn
            </Link>
            <Link href="mailto:mail@winson.dev" className="hover:text-foreground transition-colors">
              Email
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function HomeClient({ messages }: HomeClientProps) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "experience", "skills", "projects", "contact"];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const aboutSkills = [
    "Kubernetes", "Docker", "Azure", "AWS", "Terraform",
    "Ansible", "Jenkins", "GitLab CI/CD", "Python", "Bash",
    "Linux", "Cloudflare", "Tailscale", "Prometheus", "Grafana"
  ];

  return (
    <PageTransition>
        <Navbar messages={messages} activeSection={activeSection} />

        <main>
          <HeroSection messages={messages.hero} />

          <AboutSection
            messages={messages.about}
            certificates={messages.certificates}
            skills={aboutSkills}
          />

          <ExperienceSection messages={messages.experience} />

          <SkillsSection messages={messages.skills} />

          <ProjectsSection messages={messages.projects} />

          <ContactSection messages={messages.contact} />
        </main>

        <Footer messages={messages} />
    </PageTransition>
  );
}
