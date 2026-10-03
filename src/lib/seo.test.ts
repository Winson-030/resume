import { describe, expect, it } from "vitest";
import en from "@/i18n/en.json";
import ja from "@/i18n/ja.json";
import zh from "@/i18n/zh.json";
import { SITE_LAST_MODIFIED } from "./build-info";
import { buildJsonLd, buildMetadata, type Messages } from "./seo";
import { SITE_HOST, SITE_URL, locales, type Locale } from "./site";

const catalogues: Record<Locale, Messages> = { en, zh, ja };

function metadataFor(locale: Locale) {
  return buildMetadata(locale, catalogues[locale]);
}

describe("SITE_URL", () => {
  it("uses the www origin unless explicitly overridden", () => {
    expect(SITE_URL).toBe(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.winson.dev");
    expect(SITE_HOST).toBe(new URL(SITE_URL).host);
  });
});

describe("buildMetadata", () => {
  it("points canonical, hreflang and og:url at the same origin", () => {
    for (const locale of locales) {
      const metadata = metadataFor(locale);
      const languages = metadata.alternates?.languages as Record<string, string>;

      expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
      expect(metadata.alternates?.canonical).toBe(`/${locale}`);
      expect(Object.keys(languages).sort()).toEqual(["en", "ja", "x-default", "zh-Hans"]);
      // Languages are relative paths, metadataBase handles the absolute URL
      expect(languages.en).toBe("/en");
      expect(languages["x-default"]).toBe("/en");
      expect(metadata.openGraph?.url).toBe(`${SITE_URL}/${locale}`);
      expect(JSON.stringify(metadata)).not.toMatch(/https:\/\/winson\.dev/);
    }
  });

  it("keeps the share card and robots hints", () => {
    const metadata = metadataFor("en");

    // Use type assertion since Twitter type is a union and card only exists on specific variants
    const twitter = metadata.twitter as { card?: string } | undefined;
    expect(twitter?.card).toBe("summary_large_image");
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });
});

describe("buildJsonLd", () => {
  it("emits a complete graph with the pinned build timestamp", () => {
    for (const locale of locales) {
      const jsonLd = buildJsonLd(locale, catalogues[locale]);
      const serialized = JSON.stringify(jsonLd);
      const graph = (jsonLd as { "@graph": Array<Record<string, unknown>> })["@graph"];
      const profilePage = graph.find((node) => node["@type"] === "ProfilePage");

      expect(graph.map((node) => node["@type"])).toEqual([
        "WebSite",
        "Person",
        "ProfilePage",
        "ItemList",
      ]);
      expect(profilePage?.dateModified).toBe(SITE_LAST_MODIFIED);
      expect(serialized).not.toContain("undefined");
      expect(serialized).toContain(`${SITE_URL}/${locale}`);
      expect(serialized).not.toMatch(/https:\/\/winson\.dev/);
    }
  });
});
