import type { MetadataRoute } from "next";
import { SITE_URL, locales } from "@/lib/site";

const priority: Record<string, number> = { en: 1, zh: 0.9, ja: 0.9 };

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: priority[locale],
    alternates: {
      languages: {
        en: `${SITE_URL}/en`,
        "zh-Hans": `${SITE_URL}/zh`,
        ja: `${SITE_URL}/ja`,
        "x-default": `${SITE_URL}/en`,
      },
    },
  }));
}
