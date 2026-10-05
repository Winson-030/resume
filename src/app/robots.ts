import type { MetadataRoute } from "next";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import { AI_SEARCH_CRAWLERS, AI_BULK_SCRAPERS } from "@/lib/edge-policy.mjs";

export default function robots(): MetadataRoute.Robots {
  const allowedCrawlers = AI_SEARCH_CRAWLERS;
  const disallowedCrawlers = AI_BULK_SCRAPERS;

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
