import type { MetadataRoute } from "next";
import { SITE_HOST, SITE_URL } from "@/lib/site";

// Allow search & answer engines: retrieval bots that enhance user experience.
const allowedCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot",
  "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended",
  "Applebot-Extended", "cohere-ai", "YouBot", "DuckAssistBot", "Timpibot",
];

// Disallow bulk harvesters: non-referral scraping tools that consume resources.
const disallowedCrawlers = [
  "Bytespider", "CCBot", "Amazonbot", "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/" },
    ...allowedCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ...disallowedCrawlers.map((userAgent) => ({ userAgent, disallow: "/" })),
  ];

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_HOST,
  };
}
