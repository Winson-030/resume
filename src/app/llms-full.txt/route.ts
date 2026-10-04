import { type NextRequest } from "next/server";
import { getMessages } from "@/i18n/request";
import { SITE_URL, locales, htmlLang } from "@/lib/site";
import type { Locale } from "@/lib/site";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from "@/lib/profile";

export const dynamic = "force-static";

const languageNames: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
};

export async function GET(request: NextRequest) {
  const entries: string[] = [];

  for (const locale of locales) {
    const messages = await getMessages(locale);
    const pageUrl = `${SITE_URL}/${locale}`;
    const langName = languageNames[locale];
    const htmlLangTag = htmlLang[locale];

    const allSkills = [
      ...messages.skills.cloud.map((s) => s.name),
      ...messages.skills.infrastructure.map((s) => s.name),
      ...messages.skills.tools.map((s) => s.name),
    ];

    const experienceBlocks = messages.experience.items.map((item) => {
      const highlights = item.highlights.map((h) => `  - ${h}`).join("\n");
      return `${item.company} — ${item.position}
  Period: ${item.period}
  Location: ${item.location}
  Description: ${item.description}
  Highlights:
${highlights}`;
    });

    const projectBlocks = messages.projects.items.map((item) => {
      const highlights = item.highlights ? item.highlights.map((h) => `  - ${h}`).join("\n") : "";
      const tech = item.tech ? item.tech.join(", ") : "";
      return `${item.name}
  Description: ${item.description}
  Tech: ${tech}
  ${highlights ? "Highlights:\n" + highlights : ""}`;
    });

    const certBlocks = messages.certificates.map(
      (cert) => `  - ${cert.name} (${cert.issuer}, ${cert.date})`
    );

    const contactSection = `Email: ${EMAIL}
GitHub: ${GITHUB_URL}
LinkedIn: ${LINKEDIN_URL}
Resume (PDF): ${RESUME_URL}`;

    const section = `=== ${langName} (${htmlLangTag}) ===
Page URL: ${pageUrl}

Hero:
  Name: ${messages.hero.name}
  Subname: ${messages.hero.subname}
  Title: ${messages.hero.title}
  Description: ${messages.hero.description}

About:
  ${messages.about.content}

Experience:
${experienceBlocks.join("\n\n")}

Skills:
  ${allSkills.join(", ")}

Projects:
${projectBlocks.join("\n\n")}

Certificates:
${certBlocks.join("\n")}

Contact:
${contactSection}
`;
    entries.push(section);
  }

  const header = `# Full profile index (AI-friendly plain text)
# This file contains up-to-date information about Winson's professional profile in three languages.
# Generated for LLM indexing and retrieval. Last updated: ${new Date().toISOString()}

${entries.join("\n\n")}`;
  return new Response(header, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
