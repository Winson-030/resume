import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getLocaleFromIP } from "./lib/geoip";

const locales = ["en", "zh", "ja"] as const;
const defaultLocale = "en";

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Check if URL already contains a valid locale
  // Pattern: /en/*, /zh/*, /ja/*
  const existingLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // If URL already has a valid locale, let it pass through
  if (existingLocale) {
    return intlMiddleware(request);
  }

  // For root path (/) or paths without locale, detect based on IP
  if (pathname === "/") {
    try {
      const detectedLocale = await getLocaleFromIP(request, defaultLocale);

      // Only redirect if detected locale differs from default
      if (detectedLocale !== defaultLocale) {
        const redirectUrl = new URL(`/${detectedLocale}`, request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // If detected locale is default (en), pass through
      return intlMiddleware(request);
    } catch (error) {
      // On any error, fall back to default behavior
      console.warn("IP detection failed, using default locale:", error);
      return intlMiddleware(request);
    }
  }

  // For other paths (e.g., static files, API routes), let them pass through
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|zh|ja)/:path*"],
};
