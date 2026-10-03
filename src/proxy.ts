import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getCountryFromHeaders, getLocaleFromIP } from "./lib/geoip";
import { LOCALE_COOKIE, defaultLocale, locales, type Locale } from "./lib/site";
import { needsIpLookup, resolveRouting } from "./lib/routing";

const intlMiddleware = createMiddleware({ locales, defaultLocale });

// Crawlers must never be routed by Accept-Language or cookie state.
const intlMiddlewareForCrawlers = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
});

function redirectTo(request: NextRequest, locale: Locale, noStore: boolean) {
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);

  if (noStore) {
    // Never let a CDN or proxy cache one visitor's geo redirect for others.
    response.headers.set("Cache-Control", "private, no-store, must-revalidate");
  }

  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent");
  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE);
  const countryCode = getCountryFromHeaders(request);
  const input = { pathname, userAgent, hasLocaleCookie, countryCode };

  const decision = resolveRouting(input);

  if (decision.kind === "redirect") {
    return redirectTo(request, decision.locale, decision.source === "geo");
  }

  if (decision.kind === "pass-without-detection") {
    return intlMiddlewareForCrawlers(request);
  }

  // No geo header on "/" and no explicit choice yet: fall back to the cached
  // ipapi.co lookup, which is slower but only runs on the root path.
  if (needsIpLookup(input)) {
    try {
      const detected = await getLocaleFromIP(request, defaultLocale);

      if (detected !== defaultLocale && locales.includes(detected as Locale)) {
        return redirectTo(request, detected as Locale, true);
      }
    } catch (error) {
      console.warn("Geo locale detection failed, using default locale:", error);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
