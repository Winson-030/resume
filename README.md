# Winson's personal website project

## How to run the project locally

1. Clone this repo
2. change `src/i18n/*.json`
3. run `npm run dev`

`Now done! Enjoy! :)`

## SEO / GEO operations

Per-locale metadata, structured data and AI-crawler files ship with the site so
that both classic search engines and generative engines can index it.

Generated endpoints:

| Path                     | What it is                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| `/robots.txt`            | allows every crawler and names the AI crawlers explicitly          |
| `/sitemap.xml`           | the three localized pages with `xhtml:link` alternates             |
| `/llms.txt`              | short English index written for LLMs                               |
| `/llms-full.txt`         | full en/zh/ja profile as plain text, generated from `src/i18n`     |
| `/<locale>/opengraph-image` | 1200x630 share card rendered with `next/og`                     |

Environment variables (all optional):

- `NEXT_PUBLIC_SITE_URL` - canonical origin, defaults to `https://winson.dev`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Search Console verification token
- `NEXT_PUBLIC_BING_SITE_VERIFICATION` - Bing Webmaster `msvalidate.01` token
- `GEOIP_CACHE_TTL` - seconds an IP to locale mapping stays cached (default 3600)

Routing contract:

- crawlers and social unfurlers always receive a stable `307 /en` from `/`
- human visitors are routed by country (`x-vercel-ip-country`, then
  `cf-ipcountry`, then the ipapi.co fallback) and an existing `NEXT_LOCALE`
  cookie wins over GeoIP
- geo redirects are sent with `Cache-Control: private, no-store`

Manual steps after a deploy:

1. Google Search Console: verify the property, submit `/sitemap.xml`, then
   inspect `/en`, `/zh` and `/ja`.
2. Bing Webmaster Tools: same, then run `npm run indexnow` to push the URLs.
3. Validate the structured data with the Rich Results Test and the Schema
   Markup Validator.
