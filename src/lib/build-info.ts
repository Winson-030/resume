/**
 * Build timestamp shared by sitemap.xml and the ProfilePage JSON-LD.
 * next.config.ts injects NEXT_PUBLIC_SITE_LAST_MODIFIED at build time so two
 * builds of the same commit produce the same value.
 *
 * The fallback only applies outside a Next build (e.g. unit tests).
 */
export const SITE_LAST_MODIFIED =
  process.env.NEXT_PUBLIC_SITE_LAST_MODIFIED ?? new Date().toISOString();
