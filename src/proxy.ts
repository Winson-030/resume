import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getLocaleFromIP } from "./lib/geoip";
import { CRAWLER_UA_RE, LOCALE_COOKIE, defaultLocale, locales } from "./lib/site";

const intlMiddleware = createMiddleware({ locales, defaultLocale });

// Crawlers must never be routed by Accept-Language or cookie state.
const intlMiddlewareForCrawlers = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
});

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") ?? "";
  const isCrawler = CRAWLER_UA_RE.test(userAgent);

  const existingLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // Already localized: let next-intl take over untouched.
  if (existingLocale) {
    return intlMiddleware(request);
  }

  if (isCrawler) {
    return intlMiddlewareForCrawlers(request);
  }

  if (pathname === "/") {
    // An explicit choice already made by the visitor wins over GeoIP.
    if (request.cookies.has(LOCALE_COOKIE)) {
      return intlMiddleware(request);
    }

    try {
      const detectedLocale = await getLocaleFromIP(request, defaultLocale);

      if (detectedLocale !== defaultLocale) {
        const response = NextResponse.redirect(
          new URL(`/${detectedLocale}`, request.url)
        );
        // Never let a CDN or proxy cache one visitor's geo redirect for others.
        response.headers.set("Cache-Control", "private, no-store, must-revalidate");
        response.headers.set("Vary", "User-Agent, Accept-Language");
        return response;
      }
    } catch (error) {
      console.warn("Geo locale detection failed, using default locale:", error);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // "/" plus every path without a locale prefix; dotted paths (robots.txt,
  // sitemap.xml, llms.txt, favicon) and Next internals are skipped.
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
