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

  it("leaves hreflang to the page <head> so the file stays schema-valid", () => {
    // The sitemaps.org XSD allows foreign-namespace elements only after
    // <priority> and needs an xhtml schema to resolve them, so <xhtml:link>
    // here can never pass strict validation. buildMetadata() emits the
    // alternates in <head> instead.
    for (const entry of entries) {
      expect(entry.alternates).toBeUndefined();
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
