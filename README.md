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

Edge policy: **`src/lib/edge-policy.mjs` is the single source of truth** for the crawler lists,
the Cloudflare redirect / cache / firewall rule expressions, and the live-conformance probe table.
Generate the ruleset JSON with `npm run edge:ruleset` (writes to the gitignored `.edge-ruleset/`
and prints the exact `cf` commands, `--validate-only` first). Do not hand-edit the rules in the
Cloudflare dashboard or in this file — edit the module and re-apply.

Two facts worth knowing before you change that module:

- Redirect rules are **first match wins**, cache rules are **last match wins**. Both were confirmed
  empirically (putting the RSC bypass first silently served HTML to client-navigation requests).
- Crawler matching uses `lower(http.user_agent)`. Cloudflare string matching is case-sensitive by
  default, and real crawler UAs are CamelCase, so a plain `contains "bot"` misses them. On top of
  that, five of the fourteen allowed crawlers contain no `bot` substring at all (`ChatGPT-User`,
  `Claude-User`, `Perplexity-User`, `Google-Extended`, `cohere-ai`), so the module derives an
  explicit token list from `AI_SEARCH_CRAWLERS` rather than relying on the substring alone.
  `CRAWLER_TOKENS_WITHOUT_BOT` is computed, never hand-written.
- The WAF phase also carries a pre-existing `managed_challenge` rule for `cloud.winson.dev` (home server); it is deliberately left alone.
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
   curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' -A GPTBot https://www.winson.dev/          # 307 .../en
   curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' -A ccbot/2.0 https://www.winson.dev/en       # 403, not 200

6. Run the edge contract check. This is the real acceptance gate for the abuse protection, and it covers the cache, redirect and WAF behaviour the three curls above cannot see:

   npm run check:edge -- https://www.winson.dev     # exit code 0 when all pass

### Applying the edge configuration

The Cloudflare side is phase rulesets, editable from the `cf` CLI (needs an OAuth login; `cf auth whoami` tells you where you stand):

Do not hand-write the expressions. Run `npm run edge:ruleset` (optionally with `-- --dry-run`) to generate the ruleset JSON from `src/lib/edge-policy.mjs` into `.edge-ruleset/`, then apply the printed commands. Set `CF_ZONE_ID` first so the printed commands are runnable. The `--validate-only` invocation must succeed before the real one: it is what catches an expression Cloudflare will reject (a bogus field comes back as `[20127] unknown identifier`).

    cf rulesets account-rulesets phases get    http_request_cache_settings -z winson.dev                   # snapshot first
    cf rulesets account-rulesets phases update http_request_cache_settings -z <zone-id> --rules @rules.json --validate-only
    cf rulesets account-rulesets phases update http_request_cache_settings -z <zone-id> --rules @rules.json

- Phases: `http_request_dynamic_redirect`, `http_request_cache_settings`, `http_request_firewall_custom`, `http_ratelimit`.
- `--validate-only` really validates against the API (a bogus field comes back as `[20127] unknown identifier`); `--dry-run` only prints the request it would send and does not resolve the zone name.
- `-z` accepts the domain on the read calls, but the update call drops it into the URL verbatim, so pass the zone id there.
- The update call replaces the entire rule list for that phase, so always `get` first, merge, then update. That snapshot is also your rollback.
- Ordering differs per phase and both were confirmed empirically: redirect rules are first-match-wins, cache rules are last-match-wins.
- New rules take a few seconds to reach every edge location. Re-probe before concluding that a rule failed to match.
- Zone-wide settings are separate: `cf zones settings get|edit security_level|browser_check`.

The Vercel side stages drafts that must be published:

    vercel firewall rules add "<name>" --project resume --action rate_limit --rate-limit-requests 60 --rate-limit-window 10 --yes
    vercel firewall diff    --project resume
    vercel firewall publish --project resume --yes

- Hobby allows 3 custom firewall rules per project, and the rate limiting rule counts against that budget.
- Use `vercel firewall status|traffic list|overview` to read it back. When judging how much traffic actually reaches the origin, trust those counters, not the `x-vercel-id` response header: Cloudflare replays that header on cache hits, so it appears even when nothing reached Vercel.
