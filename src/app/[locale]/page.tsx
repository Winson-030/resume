import Link from "next/link";
import { getMessages } from "@/i18n/request";
import { ThemeToggle } from "@/app/ui/theme/ThemeToggle";
import { LanguageToggle } from "@/app/ui/language/LanguageToggle";
import { Button } from "@/app/ui/components/Button";
import { Card } from "@/app/ui/components/Card";
import { Badge } from "@/app/ui/components/Badge";
import { Separator } from "@/app/ui/components/Separator";
import { ContactForm } from "@/app/ui/components/ContactForm";
import { PageTransition } from "@/app/ui/components/PageTransition";
import { ArrowRight, Github, Linkedin, Mail, Download } from "lucide-react";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale);
  return {
    title: `Winson - ${messages.hero.title}`,
    description: messages.hero.description,
  };
}



export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-lg font-normal">Winson</div>

              <div className="hidden md:flex items-center space-x-6">
                <a href="#about" className="text-sm hover:text-primary transition-colors">
                  {messages.navigation.about}
                </a>
                <a href="#experience" className="text-sm hover:text-primary transition-colors">
                  {messages.navigation.experience}
                </a>
                <a href="#skills" className="text-sm hover:text-primary transition-colors">
                  {messages.navigation.skills}
                </a>
                <a href="#projects" className="text-sm hover:text-primary transition-colors">
                  {messages.navigation.projects}
                </a>
                <a href="#contact" className="text-sm hover:text-primary transition-colors">
                  {messages.navigation.contact}
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <LanguageToggle />
                <ThemeToggle />
                <Link href="https://www.linkedin.com/in/winson-dev" target="_blank" className="hidden sm:inline-flex">
                  <Button size="icon" aria-label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-3">

              {messages.hero.greeting}

            </p>
            <h1 className="text-4xl md:text-6xl font-normal mb-4">

              {messages.hero.name}
            </h1>

            <h2 className="text-xl md:text-2xl text-muted-foreground mb-6">
              {messages.hero.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              {messages.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="https://r.easycv.cn/winson" target="_blank">
                <Button size="lg" className="text-sm px-6 py-3">
                  <Download className="mr-2 h-4 w-4" />
                  {messages.hero.download}
                </Button>
              </Link>
              <Link href="#contact">
                <Button size="lg" variant="outline" className="text-sm px-6 py-3">
                  <ArrowRight className="mr-2 h-3 w-3" />
                  {messages.hero.contact}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal mb-3">{messages.about.title}</h2>
              <Separator className="w-20 mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {messages.about.content}
                </p>

                <div className="space-y-3">
                  <h3 className="text-lg font-normal">{messages.about.techStack}</h3>
                  <div className="flex flex-wrap gap-2">
                    {messages.skills.frontend.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-normal mb-3">{messages.about.education.title}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm">{messages.about.education.degree}</p>
                    <p className="text-sm text-muted-foreground">{messages.about.education.school}</p>
                    <p className="text-xs text-muted-foreground">{messages.about.education.year}</p>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <a href="https://github.com/winson-030" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="h-4 w-4" />
                    </a>
                    <a href="https://www.linkedin.com/in/winson-dev" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href="mailto:mail@winson.dev" className="text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal mb-3">{messages.experience.title}</h2>
              <Separator className="w-20 mx-auto" />
            </div>

            <div className="space-y-6">
              {messages.experience.items.map((exp, index) => (
                <Card key={index} className="p-6 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-normal">{exp.position}</h3>
                      <p className="text-sm text-primary">{exp.company}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.period}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal mb-3">{messages.skills.title}</h2>
              <Separator className="w-20 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-normal mb-5">{messages.skills.categories.frontend}</h3>
                <div className="space-y-3">
                  {messages.skills.frontend.map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{skill}</span>
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${messages.skills.progress.frontend}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-normal mb-5">{messages.skills.categories.backend}</h3>
                <div className="space-y-3">
                  {messages.skills.backend.map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{skill}</span>
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${messages.skills.progress.backend}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-normal mb-5">{messages.skills.categories.tools}</h3>
                <div className="space-y-3">
                  {messages.skills.tools.map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{skill}</span>
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${messages.skills.progress.tools}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal mb-3">{messages.projects.title}</h2>
              <Separator className="w-20 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages.projects.items.map((project, index) => (
                <Card key={index} className="p-5 hover:shadow-sm transition-shadow">
                  <div className="h-36 bg-muted rounded-md mb-5 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      <ArrowRight className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="text-lg font-normal mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full text-sm">
                    View Project
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal mb-3">{messages.contact.title}</h2>
              <Separator className="w-20 mx-auto" />
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  {messages.contact.description}
                </p>

                <ContactForm labels={messages.contact.form} />
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 px-4 sm:px-6 lg:px-8 bg-muted border-t border-border">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs text-muted-foreground">{messages.footer.copyright}</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
