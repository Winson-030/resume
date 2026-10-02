import type { Metadata } from "next";
import { SITE_URL, ogLocale, locales, type Locale } from "./site";

export type Messages = typeof import("@/i18n/en.json");

/** hreflang map: locale -> language tag used in <link rel="alternate"> */
export const hreflang: Record<Locale, string> = {
  en: "en",
  zh: "zh-Hans",
  ja: "ja",
};

export function buildMetadata(locale: Locale, messages: Messages): Metadata {
  const url = `${SITE_URL}/${locale}`;
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

  return {
    metadataBase: new URL(SITE_URL),
    title: messages.seo.title,
    description: messages.seo.description,
    keywords: messages.seo.keywords,
    authors: [{ name: "LI YONGJIE (Winson)", url: SITE_URL }],
    creator: "LI YONGJIE (Winson)",
    publisher: "LI YONGJIE (Winson)",
    category: "technology",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        "zh-Hans": "/zh",
        ja: "/ja",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "profile",
      siteName: "Winson",
      url,
      title: messages.seo.title,
      description: messages.seo.description,
      locale: ogLocale[locale],
      alternateLocale: locales
        .filter((item) => item !== locale)
        .map((item) => ogLocale[item]),
    },
    twitter: {
      card: "summary_large_image",
      title: messages.seo.title,
      description: messages.seo.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: googleVerification,
      other: bingVerification ? { "msvalidate.01": bingVerification } : {},
    },
  };
}
