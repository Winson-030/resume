import { CRAWLER_UA_RE, defaultLocale, locales, type Locale } from "./site";

export type RoutingSource = "crawler" | "geo";

export type RoutingDecision =
  | { kind: "pass" }
  | { kind: "pass-without-detection" }
  | { kind: "redirect"; locale: Locale; source: RoutingSource };

export interface RoutingInput {
  pathname: string;
  userAgent?: string | null;
  hasLocaleCookie?: boolean;
  countryCode?: string | null;
}

const COUNTRY_LOCALE: Partial<Record<string, Locale>> = { CN: "zh", JP: "ja" };

/** ISO 3166-1 alpha-2 country code -> locale. Unknown or absent -> default. */
export function localeFromCountry(countryCode?: string | null): Locale {
  if (!countryCode) return defaultLocale;
  return COUNTRY_LOCALE[countryCode.toUpperCase()] ?? defaultLocale;
}

/** The locale already present as a path prefix, if any. */
export function localeInPath(pathname: string): Locale | undefined {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

export function isCrawler(userAgent?: string | null): boolean {
  return CRAWLER_UA_RE.test(userAgent ?? "");
}

export function resolveRouting(input: RoutingInput): RoutingDecision {
  const { pathname, userAgent, hasLocaleCookie, countryCode } = input;

  // Already localized: let next-intl take over untouched.
  if (localeInPath(pathname)) return { kind: "pass" };

  if (pathname === "/") {
    // Crawlers must never be routed by Accept-Language or cookie state.
    if (isCrawler(userAgent)) {
      return { kind: "redirect", locale: defaultLocale, source: "crawler" };
    }

    // An explicit choice already made by the visitor wins over GeoIP.
    if (hasLocaleCookie) return { kind: "pass" };

    const locale = localeFromCountry(countryCode);
    if (locale !== defaultLocale) return { kind: "redirect", locale, source: "geo" };

    return { kind: "pass" };
  }

  // Non-localized sub-path (e.g. /foo). Crawlers get the default locale,
  // humans go through next-intl's normal detection.
  if (isCrawler(userAgent)) return { kind: "pass-without-detection" };

  return { kind: "pass" };
}

/**
 * True when the platform supplied no geo header, so the slower cached
 * ipapi.co lookup is worth attempting.
 */
export function needsIpLookup(input: RoutingInput): boolean {
  return (
    input.pathname === "/" &&
    !isCrawler(input.userAgent) &&
    !input.hasLocaleCookie &&
    !input.countryCode
  );
}
