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
- `INDEXNOW_KEY_FILE` - overrides the IndexNow key file inside public/ (default is `<key>.txt`)
- `SITE_LAST_MODIFIED` - optional: pin sitemap lastmod / JSON-LD dateModified. Defaults to the last git commit date, then to build time.

Edge contract:

- `/` is answered by Cloudflare, never by the origin. Single Redirect rules, all 307, evaluated in order and **first match wins** (so `me`/`resume` sit above the apex catch-all):
  - `(http.host in {"winson.dev" "www.winson.dev"}) and http.request.uri.path eq "/me"` → `https://bonjour.bio/winson` (query preserved)
  - `(http.host in {"winson.dev" "www.winson.dev"}) and http.request.uri.path eq "/resume"` → `https://r.easycv.cn/winsonli_jp` (query dropped)
  - `(http.host in {"winson.dev" "www.winson.dev"}) and http.request.uri.path eq "/" and not http.user_agent contains "bot" and ip.src.country eq "CN"` → `https://www.winson.dev/zh`
  - the same with `ip.src.country eq "JP"` → `https://www.winson.dev/ja`
  - `(http.host in {"winson.dev" "www.winson.dev"}) and http.request.uri.path eq "/" and (http.user_agent contains "bot" or (ip.src.country ne "CN" and ip.src.country ne "JP"))` → `https://www.winson.dev/en`
  - `http.host eq "winson.dev"` → 308, `concat("https://www.winson.dev", http.request.uri.path)`
- The repository contains no middleware/proxy; the origin fallback for `/` is the next.config `redirects()` entry → `/en` (307).
- Cloudflare cache rules, in this order. This phase is the opposite of the redirect phase: **last matching rule wins** (confirmed the hard way, putting the bypass first silently served HTML to client-navigation requests):
  - assets and generated SEO files: `starts_with(http.request.uri.path, "/_next/static/") or http.request.uri.path in {"/robots.txt" "/sitemap.xml" "/llms.txt" "/llms-full.txt"} or http.request.uri.path contains "/opengraph-image/"` → eligible for cache; Edge TTL: ignore cache-control, 1 day; Cache Key: ignore query string.
  - HTML: `http.host eq "www.winson.dev" and not starts_with(http.request.uri.path, "/_next/")` → eligible for cache; Edge TTL: ignore cache-control, 1 hour; Browser TTL: respect origin; Cache Key: **ignore query string**, so `?anything` cannot bust the cache and force origin fetches.
  - cache bypass: `http.host eq "www.winson.dev" and any(http.request.headers["rsc"][*] eq "1")` → bypass. Next.js client-navigation payloads share the page path with the HTML and must never be served the cached HTML. Verified in a real browser: the language toggle soft-navigates and the payload stays `text/x-component`.
- Cloudflare WAF custom rules, both host-scoped to `{winson.dev www.winson.dev}`, action Block:
  - `http.user_agent contains "Bytespider" or http.user_agent contains "CCBot" or http.user_agent contains "Amazonbot" or http.user_agent contains "meta-externalagent"`
  - `http.request.uri.path contains ".php" or http.request.uri.path contains "/wp-" or http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path contains "xmlrpc"`
  - This phase also carries a pre-existing `managed_challenge` rule for `cloud.winson.dev` (home server); it is deliberately left alone.
- Cloudflare: Security Level `Medium`, Browser Integrity Check on, Bot Fight Mode **off** (on Free it cannot be exempted and would challenge the answer-engine crawlers the site keeps).
- Cloudflare rate limiting (Free includes 1 rule; counting is per IP per colo, period and mitigation both 10 s): expression `http.host in {"winson.dev" "www.winson.dev"}`, `characteristics = ["ip.src" "cf.colo.id"]`, `requests_per_period = 50`, `mitigation_timeout = 10` → block.
- HTML is cached at the edge for up to 1 hour and there is no purge automation, so an edit can take up to an hour to appear. Vercel Hobby pauses the project when usage limits are exceeded instead of billing.
- Checks: `npm run verify` and `npm run check:edge -- https://www.winson.dev`.

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
