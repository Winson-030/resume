import { describe, expect, it } from "vitest";
import { SITE_LAST_MODIFIED } from "@/lib/build-info";
import { SITE_URL, locales } from "@/lib/site";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();

  it("emits one absolute www URL per locale", () => {
    expect(entries).toHaveLength(locales.length);
    expect(entries.map((entry) => entry.url)).toEqual(
      locales.map((locale) => `${SITE_URL}/${locale}`)
    );

    for (const entry of entries) {
      expect(String(entry.url).startsWith(SITE_URL)).toBe(true);
      expect(JSON.stringify(entry)).not.toMatch(/https:\/\/winson\.dev/);
    }
  });

  it("lists all four alternates on every entry", () => {
    const expected = {
      en: `${SITE_URL}/en`,
      "zh-Hans": `${SITE_URL}/zh`,
      ja: `${SITE_URL}/ja`,
      "x-default": `${SITE_URL}/en`,
    };

    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;

      expect(Object.keys(languages).sort()).toEqual(["en", "ja", "x-default", "zh-Hans"]);
      expect(languages).toEqual(expected);
    }
  });

  it("uses the pinned build timestamp so repeated builds match", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect((entry.lastModified as Date).toISOString()).toBe(
        new Date(SITE_LAST_MODIFIED).toISOString()
      );
    }
  });
});
