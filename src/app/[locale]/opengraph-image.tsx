import { ImageResponse } from "next/og";
import type { Messages } from "@/lib/seo";
import { SITE_HOST, defaultLocale, isLocale, type Locale } from "@/lib/site";
import { getMessages } from "@/i18n/request";
import { CITY_LABEL } from "@/lib/profile";

const size = { width: 1200, height: 630 };
const contentType = "image/png";

async function resolveMessages(
  locale: string
): Promise<{ locale: Locale; messages: Messages }> {
  const resolved: Locale = isLocale(locale) ? locale : defaultLocale;
  return { locale: resolved, messages: await getMessages(resolved) };
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { messages } = await resolveMessages(locale);

  return [{ id: "default", alt: messages.seo.title, size, contentType }];
}

export default async function OpengraphImage() {
  // Latin-only card: satori only ships a Latin fallback font, so CJK headlines
  // would render as blank boxes. Localized text still reaches crawlers and
  // unfurlers through og:image:alt (see generateImageMetadata).
  const { messages } = await resolveMessages("en");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#f1efea", color: "#111111", padding: "64px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", opacity: 0.5 }}>
          <span>{SITE_HOST}</span>
          <span>{CITY_LABEL}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{messages.hero.name.toUpperCase()}</div>
          <div style={{ fontSize: 34, marginTop: 20, opacity: 0.75 }}>{messages.hero.title}</div>
          <div style={{ fontSize: 22, marginTop: 28, opacity: 0.55 }}>
            Cloud-native architecture · CI/CD automation · AI-powered operations
          </div>
        </div>
        <div style={{ display: "flex", height: 4, width: 160, backgroundColor: "#111111" }} />
      </div>
    ),
    size
  );
}
