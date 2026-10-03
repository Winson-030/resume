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

- `NEXT_PUBLIC_SITE_URL` - canonical origin, defaults to `https://www.winson.dev`. Must match the origin the edge actually serves (the apex domain currently 308-redirects to www, so canonical/hreflang/sitemap must use the www origin).
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Search Console verification token
- `NEXT_PUBLIC_BING_SITE_VERIFICATION` - Bing Webmaster `msvalidate.01` token
- `GEOIP_CACHE_TTL` - seconds an IP to locale mapping stays cached (default 3600)
- `INDEXNOW_KEY_FILE` - overrides the IndexNow key file inside public/ (default is `<key>.txt`)
- `SITE_LAST_MODIFIED` - optional: pin sitemap lastmod / JSON-LD dateModified. Defaults to the last git commit date, then to build time.

Routing contract:

- crawlers and social unfurlers always receive a stable `307 /en` from `/`
- human visitors are routed by country (`x-vercel-ip-country`, then
  `cf-ipcountry`, then the ipapi.co fallback) and an existing `NEXT_LOCALE`
  cookie wins over GeoIP
- geo redirects are sent with `Cache-Control: private, no-store`

### Verification

Run `npm run verify` for typecheck + lint + test + build.

npm is the de-facto package manager for this repository (`package-lock.json` is present; `bun.lock` is kept but should not be used).

Manual steps after a deploy:

1. Vercel environment variables: set `NEXT_PUBLIC_SITE_URL=https://www.winson.dev` plus the Google / Bing verification tokens from `.env.example`.
2. Google Search Console: verify the **www** property, submit `https://www.winson.dev/sitemap.xml`, then inspect `/en`, `/zh` and `/ja` and confirm the canonical is the www URL.
3. Bing Webmaster Tools: same, then run `NEXT_PUBLIC_SITE_URL=https://www.winson.dev npm run indexnow`.
4. Validate the structured data with the Rich Results Test and the Schema Markup Validator.
5. Smoke check the generated files:

   curl -sS https://www.winson.dev/robots.txt
   curl -sS https://www.winson.dev/sitemap.xml | grep -c 'https://winson.dev'   # must print 0
   curl -sSI -A GPTBot https://www.winson.dev/ | head -1                        # 307
