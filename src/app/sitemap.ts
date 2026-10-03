import type { MetadataRoute } from "next";
import { SITE_LAST_MODIFIED } from "@/lib/build-info";
import { SITE_URL, locales } from "@/lib/site";

const priority: Record<string, number> = { en: 1, zh: 0.9, ja: 0.9 };

const languages = {
  en: `${SITE_URL}/en`,
  "zh-Hans": `${SITE_URL}/zh`,
  ja: `${SITE_URL}/ja`,
  "x-default": `${SITE_URL}/en`,
};

export default function sitemap(): MetadataRoute.Sitemap {
  // Same commit -> same lastmod, so crawlers can trust the signal.
  const lastModified = new Date(SITE_LAST_MODIFIED);

  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: priority[locale],
    alternates: { languages },
  }));
}
