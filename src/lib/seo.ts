import type { Metadata } from "next";
import { SITE_LAST_MODIFIED } from "./build-info";
import { SITE_URL, ogLocale, locales, htmlLang, type Locale } from "./site";

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

/** JSON-LD graph: WebSite + Person + ProfilePage + project ItemList. */
export function buildJsonLd(locale: Locale, messages: Messages): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/${locale}`;
  const personId = `${pageUrl}#person`;
  const websiteId = `${SITE_URL}#website`;

  const knowsAbout = [
    ...messages.skills.cloud,
    ...messages.skills.infrastructure,
    ...messages.skills.tools,
  ]
    .map((item) => item.name)
    .slice(0, 12);

  const latestRole = messages.experience.items[0];

  const projects = messages.projects.items.map((project) => ({
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    keywords: project.tech.join(", "),
    ...(project.link ? { url: project.link } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: "Winson",
        inLanguage: htmlLang[locale],
        publisher: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: messages.hero.name,
        alternateName: ["Winson", "LI YONGJIE", "李永杰"],
        jobTitle: messages.hero.title,
        description: messages.about.content,
        url: pageUrl,
        email: "mailto:mail@winson.dev",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Tokyo",
          addressCountry: "JP",
        },
        sameAs: [
          "https://github.com/winson-030",
          "https://www.linkedin.com/in/winson-dev",
        ],
        knowsAbout,
        worksFor: {
          "@type": "Organization",
          name: latestRole.company,
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: messages.about.education.school,
        },
        hasCredential: messages.certificates.map((cert) => ({
          "@type": "EducationalOccupationalCredential",
          name: cert.name,
          credentialCategory: "certificate",
          recognizedBy: { "@type": "Organization", name: cert.issuer },
          dateCreated: cert.date,
        })),
      },
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profilepage`,
        url: pageUrl,
        name: messages.seo.title,
        description: messages.seo.description,
        inLanguage: htmlLang[locale],
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
        dateModified: SITE_LAST_MODIFIED,
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#projects`,
        name: messages.projects.title,
        itemListElement: projects.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item,
        })),
      },
    ],
  };
}
