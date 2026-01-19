import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "zh", "ja"],
  defaultLocale: "en",
});

export const config = {
  matcher: ["/", "/(en|zh|ja)/:path*"],
};
