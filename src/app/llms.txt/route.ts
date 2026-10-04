import { type NextRequest } from "next/server";
import { getMessages } from "@/i18n/request";
import { SITE_URL } from "@/lib/site";
import { CITY_LABEL, EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from "@/lib/profile";

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const messages = await getMessages("en");

  const allSkills = [
    ...messages.skills.cloud,
    ...messages.skills.infrastructure,
    ...messages.skills.tools,
  ].map((s) => s.name);

  const experienceLines = messages.experience.items.map(
    (item) => `- ${item.company} — ${item.position} (${item.period}, ${item.location})`
  );

  const projectLines = messages.projects.items.map(
    (item) => `- ${item.name}: ${item.description}`
  );

  const body = `# ${messages.hero.name} ${messages.hero.subname} — ${messages.hero.title}

> ${messages.hero.description}

Key facts: based in ${CITY_LABEL} · ${messages.stats.items[0].value} years of experience · 100+ engineering teams served

## Languages
- English: ${SITE_URL}/en
- 简体中文: ${SITE_URL}/zh
- 日本語: ${SITE_URL}/ja

## Core expertise
${allSkills.map((skill) => `- ${skill}`).join("\n")}

## Experience
${experienceLines.join("\n")}

## Projects
${projectLines.join("\n")}

## Contact
- Email: ${EMAIL}
- GitHub: ${GITHUB_URL}
- LinkedIn: ${LINKEDIN_URL}
- Resume (PDF): ${RESUME_URL}

## Full profile
${SITE_URL}/llms-full.txt
`;

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
