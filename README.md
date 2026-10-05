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

- `/` is answered by Cloudflare, never by the origin. Single Redirect rules (mutually exclusive, so order does not matter), all 307 with query string preserved:
  - `http.request.uri.path eq "/" and ip.src.country eq "CN" and not http.user_agent contains "bot"` → `/zh`
  - `http.request.uri.path eq "/" and ip.src.country eq "JP" and not http.user_agent contains "bot"` → `/ja`
  - `http.request.uri.path eq "/" and ip.src.country ne "CN" and ip.src.country ne "JP"` → `/en`
  - `http.host eq "winson.dev"` → `concat("https://www.winson.dev", http.request.uri.path)`
  - `.../me` → `https://bonjour.bio/winson` (query string preserved) and `.../resume` → `https://r.easycv.cn/winsonli_jp` (query dropped), both 307, host-scoped to `{winson.dev, www.winson.dev}`
- The repository contains no middleware/proxy; the origin fallback for `/` is the next.config `redirects()` entry → `/en` (307).
- Cloudflare cache rules, in this order. The phase is evaluated in order and the **last matching rule wins** (confirmed the hard way: putting the bypass first silently served HTML to client-navigation requests):
  - assets and generated SEO files: `starts_with(http.request.uri.path, "/_next/static/") or http.request.uri.path in {"/robots.txt" "/sitemap.xml" "/llms.txt" "/llms-full.txt"} or http.request.uri.path contains "/opengraph-image/"` → eligible for cache; Edge TTL: ignore cache-control, 1 day; Cache Key: ignore query string.
  - HTML: `http.host eq "www.winson.dev" and not starts_with(http.request.uri.path, "/_next/")` → eligible for cache; Edge TTL: ignore cache-control, 1 hour; Browser TTL: respect origin; Cache Key: **ignore query string** so `?anything` cannot bust the cache and force origin fetches.
  - force a cache bypass last: `http.host eq "www.winson.dev" and any(http.request.headers["rsc"][*] eq "1")` → bypass. Next.js client-navigation payloads share the page path with the HTML, so they must never be served the cached HTML. Verified in a real browser: the language toggle soft-navigates and the payload stays `text/x-component`.
- Cloudflare WAF custom rule (block crawlers that never refer traffic): `http.user_agent contains "Bytespider" or http.user_agent contains "CCBot" or http.user_agent contains "Amazonbot" or http.user_agent contains "meta-externalagent"` → Block.
- Cloudflare WAF custom rule (scanner paths): block when the path contains `.php`, `/wp-`, `/.env`, `/.git` or `xmlrpc`. Use `contains`/`ends_with` — regex match is not available on the Free plan.
- Cloudflare: Security Level `Medium`, Browser Integrity Check on, Bot Fight Mode **off** (on Free it cannot be exempted and would challenge the answer-engine crawlers the site keeps).
- Cloudflare rate limiting (Free allows 1 rule, path/IP only): broadest path wildcard, count by IP, 50 requests / 10 s → block for 10 s.
- Vercel firewall: deliberately **no** `*.vercel.app` deny rule. Deployment URLs are already behind Vercel Authentication (they answer `302` to the SSO login), so a deny there would only lock the owner out of previews.
- Vercel rate limiting (the project's only custom firewall rule): count by IP on `winson.dev` and `www.winson.dev`, 60 requests / 10 s → rate limit. Hobby allows 3 custom firewall rules total and the rate limiting rule counts against that budget.
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
