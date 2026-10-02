// SEO/多语言的单一事实源
// 本文件集中定义站点级配置，包括可用语言、默认语言、HTML lang属性和Open Graph locale

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://winson.dev";

export const locales = ["en", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const htmlLang: Record<Locale, string> = { en: "en", zh: "zh-Hans", ja: "ja" };

export const ogLocale: Record<Locale, string> = { en: "en_US", zh: "zh_CN", ja: "ja_JP" };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
