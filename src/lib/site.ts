// SEO/多语言的单一事实源
// 本文件集中定义站点级配置，包括可用语言、默认语言、HTML lang属性和Open Graph locale

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.winson.dev";

/** Hostname only (no protocol). Used by robots.txt `Host` and the share card. */
export const SITE_HOST = new URL(SITE_URL).host;

export const locales = ["en", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const htmlLang: Record<Locale, string> = { en: "en", zh: "zh-Hans", ja: "ja" };

export const ogLocale: Record<Locale, string> = { en: "en_US", zh: "zh_CN", ja: "ja_JP" };

/**
 * Build alternate languages map for SEO (hreflang).
 * Derives keys from htmlLang and values from the provided path function.
 */
export function alternateLanguages(path: (locale: Locale) => string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((l) => [htmlLang[l], path(l)])),
    "x-default": path(defaultLocale),
  };
}

/** Cookie next-intl uses to remember an explicit locale choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * User agents that must always be served the stable default locale:
 * classic search engines, AI/answer crawlers and social unfurlers.
 */
export const CRAWLER_UA_RE =
  /(bot|crawler|spider|slurp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|LinkedInBot|WhatsApp|Embedly|Quora Link Preview|SkypeUriPreview|Google-InspectionTool|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|Claude-User|PerplexityBot|Perplexity-User|CCBot|Bytespider|Amazonbot|meta-externalagent|cohere-ai|YouBot|DuckAssistBot|Timpibot|Applebot|Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider)/i;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Public IndexNow key; also served as /<key>.txt to prove ownership. */
export const indexnowKey = "7d41c9f0e3a84b6fa1c2d5e0937b4f18";
