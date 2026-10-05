/**
 * Edge Policy - Single source of truth for edge rules
 *
 * This module is the canonical source for:
 * - AI crawler allow/deny lists (robots.txt)
 * - Cloudflare redirect/ruleset generation (edge-ruleset.mjs)
 * - Edge contract validation (check-edge.mjs)
 *
 * Key design constraint: Cloudflare rules use "contains" which is case-sensitive.
 * Real crawlers use CamelCase (GPTBot, ClaudeBot), so they would not be matched
 * by lowercase "bot". Additionally, 5 crawlers do not contain "bot" at all:
 * chatgpt-user, claude-user, perplexity-user, google-extended, cohere-ai
 *
 * Therefore: isCrawler = (ua lowercased contains "bot") OR (ua lowercased contains one of CRAWLER_TOKENS_WITHOUT_BOT)
 *
 * Note: These expressions are not fully re-implemented in JS; true consistency is verified
 * by scripts/check-edge.mjs against the live edge configuration.
 */

/**
 * AI search & answer engines that should be allowed to crawl the site.
 * 14 crawlers: 9 contain "bot", 5 do not (must be auto-derived).
 * Order preserved from original robots.txt.
 */
export const AI_SEARCH_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "YouBot",
  "DuckAssistBot",
  "Timpibot",
];

/**
 * Bulk harvesters that should be blocked.
 * 4 scrapers: all contain "bot" or similar.
 */
export const AI_BULK_SCRAPERS = [
  "Bytespider",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
];

/**
 * Tokens that must be checked for crawler detection, derived automatically
 * from AI_SEARCH_CRAWLERS by filtering out those that contain "bot" (case-insensitive).
 *
 * Must be auto-derived because if the 14-item list changes, this set must
 * stay in sync — no second authoritative list is permitted.
 *
 * These 5 crawlers do not contain "bot" in their names:
 * - ChatGPT-User (→ chatgpt-user)
 * - Claude-User (→ claude-user)
 * - Perplexity-User (→ perplexity-user)
 * - Google-Extended (→ google-extended)
 * - cohere-ai (→ cohere-ai)
 */
export const CRAWLER_TOKENS_WITHOUT_BOT = AI_SEARCH_CRAWLERS
  .filter(ua => !ua.toLowerCase().includes("bot"))
  .map(ua => ua.toLowerCase());

/**
 * Host zones this policy applies to.
 */
export const ZONE_HOSTS = ["winson.dev", "www.winson.dev"];

/**
 * Build host expression using ZONE_HOSTS.
 * For redirect/cache/firewall rules, use "http.host in {....}" for multiple hosts,
 * or "http.host eq \"winson.dev\"" for apex-specific rules.
 */
function buildHostInExpr(hosts) {
  const quoted = hosts.map(h => `"${h}"`).join(" ");
  return `http.host in {${quoted}}`;
}

/**
 * Build redirect rules (first-match-wins order):
 * 1. /{me} → bonjour.bio/winson (preserve query)
 * 2. /{resume} → r.easycv.cn/winsonli_jp (drop query)
 * 3. / + non-crawler + CN → /zh
 * 4. / + non-crawler + JP → /ja
 * 5. / + (crawler OR not-CN/JP) → /en
 * 6. apex (winson.dev) → www.winson.dev + path, 308 (preserve path, keep query)
 *
 * WARNING: apex redirect must be LAST because redirect phase is first-match-wins.
 *         Others like /me /resume /CN /JP /en are more specific and must match first.
 */
export function buildRedirectRules() {
  const rules = [];

  // 1. /me redirect (preserve query)
  rules.push({
    ref: "redirect_me_to_bonjour",
    description: "Redirect /me to bonjour.bio/winson (preserve query)",
    expression: `${buildHostInExpr(ZONE_HOSTS)} and http.request.uri.path eq "/me"`,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { value: "https://bonjour.bio/winson" },
        status_code: 307,
        preserve_query_string: true,
      },
    },
  });

  // 2. /resume redirect (drop query)
  rules.push({
    ref: "redirect_resume_to_cv",
    description: "Redirect /resume to r.easycv.cn/winsonli_jp (drop query)",
    expression: `${buildHostInExpr(ZONE_HOSTS)} and http.request.uri.path eq "/resume"`,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { value: "https://r.easycv.cn/winsonli_jp" },
        status_code: 307,
        preserve_query_string: false,
      },
    },
  });

  // 3-5. Root redirect rules depend on crawler detection and country.
  // Need to build crawler expression first.
  const crawlerExpr = buildCrawlerExpression();

  // 3. / + non-crawler + CN -> /zh
  rules.push({
    ref: "redirect_root_cn_zh",
    description: "Redirect non-crawlers from CN to /zh",
    expression: `${buildHostInExpr(ZONE_HOSTS)} and http.request.uri.path eq "/" and not (${crawlerExpr}) and ip.src.country eq "CN"`,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { value: "https://www.winson.dev/zh" },
        status_code: 307,
        preserve_query_string: true,
      },
    },
  });

  // 4. / + non-crawler + JP -> /ja
  rules.push({
    ref: "redirect_root_jp_ja",
    description: "Redirect non-crawlers from JP to /ja",
    expression: `${buildHostInExpr(ZONE_HOSTS)} and http.request.uri.path eq "/" and not (${crawlerExpr}) and ip.src.country eq "JP"`,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { value: "https://www.winson.dev/ja" },
        status_code: 307,
        preserve_query_string: true,
      },
    },
  });

  // 5. / + (crawler OR (not-CN AND not-JP)) -> /en
  rules.push({
    ref: "redirect_root_default_en",
    description: "Redirect everyone else (crawlers or non-CN/JP) to /en",
    expression: `${buildHostInExpr(ZONE_HOSTS)} and http.request.uri.path eq "/" and (${crawlerExpr} or (ip.src.country ne "CN" and ip.src.country ne "JP"))`,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { value: "https://www.winson.dev/en" },
        status_code: 307,
        preserve_query_string: true,
      },
    },
  });

  // 6. apex (winson.dev) → www.winson.dev + path, 308 (preserve path, keep query)
  // REQUIREMENT: This must be the LAST rule because redirect phase is first-match-wins.
  // Rationale for preserve_query_string: README says query dropped for /resume but says nothing for apex.
  // Since apex 308 is for canonicalization, not page-specific behavior, and path includes the original query,
  // it's safer to preserve the query string at the redirect level (preserves the original query).
  rules.push({
    ref: "redirect_apex_to_www",
    description: "Redirect apex to www (preserve path, keep query)",
    expression: `http.host eq "${ZONE_HOSTS[0]}"`,
    action: "redirect",
    action_parameters: {
      from_value: {
        target_url: { expression: 'concat("https://www.winson.dev", http.request.uri.path)' },
        status_code: 308,
        preserve_query_string: true,
      },
    },
  });

  return rules;
}

/**
 * Build cache rules (last-match-wins order).
 * Preserve exact expressions from README.md but add http.host scoping for all rules.
 * - Rule 1: Assets / SEO files — edge_ttl override 1 day, no browser_ttl, ignore_query_string
 * - Rule 2: HTML — edge_ttl override 1h, browser_ttl respect_origin, ignore_query_string
 * - Rule 3: RSC bypass — only expression + description + action, NO action_parameters
 */
export function buildCacheRules() {
  // Order mirrors the live ruleset exactly (verified against
  // `cf rulesets account-rulesets phases get http_request_cache_settings -z winson.dev`).
  // Cache rules are LAST match wins, so getting this order wrong silently changes
  // which TTL applies. Keep it aligned with the snapshot, not with intuition.
  return [
    {
      ref: "cache_html",
      description: "HTML: 1 hour Edge TTL, respect origin, ignore query string",
      expression: `http.host eq "${ZONE_HOSTS[1]}" and not starts_with(http.request.uri.path, "/_next/")`,
      action: "set_cache_settings",
      action_parameters: {
        cache: true,
        edge_ttl: { mode: "override_origin", default: 3600 },
        browser_ttl: { mode: "respect_origin" },
        cache_key: { custom_key: { query_string: { exclude: "*" } } },
      },
    },
    {
      ref: "cache_assets_and_seo",
      description: "Assets and generated SEO files: 1 day Edge TTL, ignore query string",
      expression: `starts_with(http.request.uri.path, "/_next/static/") or http.request.uri.path in {"/robots.txt" "/sitemap.xml" "/llms.txt" "/llms-full.txt"} or http.request.uri.path contains "/opengraph-image/"`,
      action: "set_cache_settings",
      action_parameters: {
        cache: true,
        edge_ttl: { mode: "override_origin", default: 86400 },
        browser_ttl: { mode: "respect_origin" },
        cache_key: { custom_key: { query_string: { exclude: "*" } } },
      },
    },
    {
      ref: "bypass_rsc_payload",
      description: "Bypass cache for RSC payloads (client navigation must never get cached HTML)",
      expression: `http.host eq "${ZONE_HOSTS[1]}" and any(http.request.headers["rsc"][*] eq "1")`,
      action: "set_cache_settings",
      action_parameters: { cache: false },
    },
  ];
}

/**
 * Build firewall rules (block).
 */
export function buildFirewallRules() {
  // NOTE: this phase also carries a pre-existing `managed_challenge` rule that guards
  // cloud.winson.dev (the home server) via a $risk_ips list. It is not part of the
  // winson.dev/www.winson.dev policy and is intentionally left alone — but because
  // `phases update` REPLACES the whole phase, omitting it here would DELETE it from
  // production. It is reproduced verbatim below so the generated ruleset is a
  // faithful replacement. Verify against the snapshot before applying.
  const unmanagedHostRule = {
    ref: "cloud_winson_dev_managed_challenge",
    description: "Pre-existing challenge for cloud.winson.dev (home server) — preserved verbatim",
    action: "managed_challenge",
    expression: `(http.host in {"cloud.winson.dev"} and not ssl and not ip.geoip.country in {"CN" "HK" "TW"}) or (ip.src in $risk_ips)`,
  };

  // 1. UA-based blocking: bulk scrapers with lowercase comparison
  const bulkScrapersExpr = AI_BULK_SCRAPERS
    .map(ua => `lower(http.user_agent) contains "${ua.toLowerCase()}"`)
    .join(" or ");
  
  // 2. Path-based blocking
  const pathBasedExpr = [
    'http.request.uri.path contains ".php"',
    'http.request.uri.path contains "/wp-"',
    'http.request.uri.path contains "/.env"',
    'http.request.uri.path contains "/.git"',
    'http.request.uri.path contains "xmlrpc"',
  ].join(" or ");

  return [
    unmanagedHostRule,
    {
      ref: "waf-ua-block",
      description: "Block bulk scrapers by UA",
      action: "block",
      expression: `${buildHostInExpr(ZONE_HOSTS)} and (${bulkScrapersExpr})`,
    },
    {
      ref: "waf-path-block",
      description: "Block common attack vectors",
      action: "block",
      expression: `${buildHostInExpr(ZONE_HOSTS)} and (${pathBasedExpr})`,
    },
  ];
}

/**
 * Build crawler detection expression (for redirect rules).
 * isCrawler = (lower UA contains "bot") OR (lower UA contains one of CRAWLER_TOKENS_WITHOUT_BOT)
 */
function buildCrawlerExpression() {
  const botExpr = 'lower(http.user_agent) contains "bot"';
  const tokenExprs = CRAWLER_TOKENS_WITHOUT_BOT.map(t => `lower(http.user_agent) contains "${t}"`).join(" or ");
  return `(${botExpr} or ${tokenExprs})`;
}

/**
 * Classify root request — test oracle only, NOT used in production.
 * Returns "/en" | "/zh" | "/ja" based on crawler + country.
 * 
 * DO NOT use this in production code. It exists to verify that
 * buildRedirectRules() produces the same behavior as the expression might.
 */
export function classifyRootRequest({ userAgent, countryCode }) {
  if (isCrawlerUserAgent(userAgent)) {
    return "/en";
  }
  if (countryCode === "CN") {
    return "/zh";
  }
  if (countryCode === "JP") {
    return "/ja";
  }
  return "/en";
}

/**
 * Detect if a UA is an AI crawler (search & answer engines).
 * True if:
 * - UA lowercased contains "bot", OR
 * - UA lowercased contains one of CRAWLER_TOKENS_WITHOUT_BOT
 */
export function isCrawlerUserAgent(userAgent) {
  const lower = userAgent.toLowerCase();
  if (lower.includes("bot")) {
    return true;
  }
  for (const token of CRAWLER_TOKENS_WITHOUT_BOT) {
    if (lower.includes(token)) {
      return true;
    }
  }
  return false;
}

/**
 * ROOT_PROBES: Requests to run at the edge to verify the redirect policy.
 * Each probe must:
 * - Not depend on caller country (always expect /en for crawlers)
 * - Cover the 5 non-"bot" crawlers with real UA strings
 * - Cover the 4 bot-containing crawlers with bare tokens (to test case-sensitivity bug)
 * - Include a non-crawler as a sanity check (commented out, see below)
 */
export const ROOT_PROBES = [
  // Non-"bot" crawlers — use actual UA strings from vendor docs
  {
    name: "Google-Extended (real UA, no bot token)",
    userAgent: "Mozilla/5.0 (compatible; Google-Extended)",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "cohere-ai (real UA, no bot token)",
    userAgent: "cohere-ai",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "Claude-User (real UA, no bot token)",
    userAgent: "Mozilla/5.0 (compatible; Claude-User/1.0; +claudebot@anthropic.com)",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "Perplexity-User (real UA, no bot token)",
    userAgent: "Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "ChatGPT-User (real UA, no bot token)",
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  // "bot"-containing crawlers — bare tokens to expose case-sensitivity bugs
  {
    name: "GPTBot (bare token)",
    userAgent: "GPTBot",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "ClaudeBot (bare token)",
    userAgent: "ClaudeBot",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "OAI-SearchBot (bare token)",
    userAgent: "OAI-SearchBot",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
  {
    name: "PerplexityBot (bare token)",
    userAgent: "PerplexityBot",
    expectStatus: 307,
    expectLocation: "https://www.winson.dev/en",
  },
];

// NOTE: A non-crawler probe would look like this (commented out):
// {
//   name: "Chrome (non-crawler, country dependent)",
//   userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
//   expectStatus: 307,
//   // expectLocation depends on caller country => cannot put in ROOT_PROBES
//   // For CN caller: /zh, JP caller: /ja, others: /en
//   // Use classifyRootRequest({ userAgent, countryCode: "CN" }) to verify locally
// }
