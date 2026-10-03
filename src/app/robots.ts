import type { MetadataRoute } from "next";
import { SITE_HOST, SITE_URL } from "@/lib/site";

// AI crawlers we deliberately allow: answer/retrieval bots and training crawlers.
const aiCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot",
  "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended",
  "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot", "meta-externalagent",
  "cohere-ai", "YouBot", "DuckAssistBot", "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/" },
    ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
  ];

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_HOST,
  };
}
