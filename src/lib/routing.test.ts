import { describe, expect, it } from "vitest";
import {
  isCrawler,
  localeFromCountry,
  localeInPath,
  needsIpLookup,
  resolveRouting,
} from "./routing";

const CRAWLER = "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)";
const HUMAN = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";

describe("localeFromCountry", () => {
  it("maps CN and JP to their locale", () => {
    expect(localeFromCountry("CN")).toBe("zh");
    expect(localeFromCountry("jp")).toBe("ja");
  });

  it("falls back to the default for unknown or absent countries", () => {
    expect(localeFromCountry("US")).toBe("en");
    expect(localeFromCountry(null)).toBe("en");
    expect(localeFromCountry(undefined)).toBe("en");
  });
});

describe("isCrawler", () => {
  it("matches AI crawlers and social unfurlers", () => {
    expect(isCrawler(CRAWLER)).toBe(true);
    expect(isCrawler("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isCrawler("Twitterbot/1.0")).toBe(true);
  });

  it("does not match a plain browser UA", () => {
    expect(isCrawler(HUMAN)).toBe(false);
    expect(isCrawler("")).toBe(false);
    expect(isCrawler(null)).toBe(false);
  });
});

describe("resolveRouting", () => {
  it("redirects crawlers on / to the default locale", () => {
    expect(
      resolveRouting({ pathname: "/", userAgent: CRAWLER, countryCode: "JP" })
    ).toEqual({ kind: "redirect", locale: "en", source: "crawler" });
  });

  it("redirects humans on / by country", () => {
    expect(
      resolveRouting({ pathname: "/", userAgent: HUMAN, countryCode: "JP" })
    ).toEqual({ kind: "redirect", locale: "ja", source: "geo" });
    expect(
      resolveRouting({ pathname: "/", userAgent: HUMAN, countryCode: "CN" })
    ).toEqual({ kind: "redirect", locale: "zh", source: "geo" });
  });

  it("lets the stored cookie win over GeoIP", () => {
    expect(
      resolveRouting({
        pathname: "/",
        userAgent: HUMAN,
        hasLocaleCookie: true,
        countryCode: "JP",
      })
    ).toEqual({ kind: "pass" });
  });

  it("passes humans through when there is no geo signal", () => {
    expect(resolveRouting({ pathname: "/", userAgent: HUMAN, countryCode: "US" })).toEqual({
      kind: "pass",
    });
    expect(resolveRouting({ pathname: "/", userAgent: HUMAN })).toEqual({ kind: "pass" });
  });

  it("never touches an already localized path", () => {
    for (const pathname of ["/en", "/zh", "/ja", "/en/about", "/ja/projects/1"]) {
      expect(
        resolveRouting({ pathname, userAgent: CRAWLER, countryCode: "JP" })
      ).toEqual({ kind: "pass" });
    }
  });

  it("routes crawlers off-root through next-intl without detection", () => {
    expect(resolveRouting({ pathname: "/about", userAgent: CRAWLER })).toEqual({
      kind: "pass-without-detection",
    });
  });

  it("does not treat similarly named prefixes as localized", () => {
    expect(localeInPath("/english")).toBeUndefined();
    expect(resolveRouting({ pathname: "/english", userAgent: HUMAN })).toEqual({ kind: "pass" });
  });
});

describe("needsIpLookup", () => {
  it("only fires for humans on / with no geo header and no cookie", () => {
    expect(needsIpLookup({ pathname: "/", userAgent: HUMAN })).toBe(true);
    expect(needsIpLookup({ pathname: "/", userAgent: CRAWLER })).toBe(false);
    expect(needsIpLookup({ pathname: "/", userAgent: HUMAN, hasLocaleCookie: true })).toBe(false);
    expect(needsIpLookup({ pathname: "/", userAgent: HUMAN, countryCode: "JP" })).toBe(false);
    expect(needsIpLookup({ pathname: "/en", userAgent: HUMAN })).toBe(false);
  });
});

// Mirrors the literal matcher in src/proxy.ts: "/" plus every path without a
// locale prefix. Next.js statically parses that field, so it cannot be imported
// from here -- keep the two literals in sync.
const PAGE_MATCHER = "/((?!api|_next|_vercel|.*\\..*).*)";

describe("proxy matcher", () => {
  const pageMatcher = new RegExp(`^${PAGE_MATCHER}$`);

  it("skips generated files so robots.txt and sitemap.xml are never redirected", () => {
    expect(pageMatcher.test("/robots.txt")).toBe(false);
    expect(pageMatcher.test("/sitemap.xml")).toBe(false);
    expect(pageMatcher.test("/llms.txt")).toBe(false);
    expect(pageMatcher.test("/llms-full.txt")).toBe(false);
    expect(pageMatcher.test("/favicon.ico")).toBe(false);
  });

  it("skips Next internals and api routes", () => {
    expect(pageMatcher.test("/_next/static/chunk.js")).toBe(false);
    expect(pageMatcher.test("/api/hello")).toBe(false);
  });

  it("still matches real page paths", () => {
    expect(pageMatcher.test("/about")).toBe(true);
    expect(pageMatcher.test("/en")).toBe(true);
  });
});
