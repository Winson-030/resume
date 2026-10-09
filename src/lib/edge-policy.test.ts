import { describe, expect, it } from "vitest";
import {
  AI_SEARCH_CRAWLERS,
  AI_BULK_SCRAPERS,
  CRAWLER_TOKENS_WITHOUT_BOT,
  ROOT_PROBES,
  ZONE_HOSTS,
  ACCESSIBLE_METHODS,
  ACCESSIBLE_EXACT_PATHS,
  ACCESSIBLE_PATH_PREFIXES,
  buildAccessAllowlistExpression,
  isCrawlerUserAgent,
  classifyRootRequest,
  buildRedirectRules,
  buildCacheRules,
  buildFirewallRules,
} from "./edge-policy.mjs";

describe("edge-policy", () => {
  it("AI_SEARCH_CRAWLERS has 14 crawlers", () => {
    expect(AI_SEARCH_CRAWLERS).toHaveLength(14);
  });

  it("AI_BULK_SCRAPERS has 4 scrapers", () => {
    expect(AI_BULK_SCRAPERS).toHaveLength(4);
  });

  describe("CRAWLER_TOKENS_WITHOUT_BOT", () => {
    it("is non-empty and contains the 5 expected tokens", () => {
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toHaveLength(5);
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toContain("chatgpt-user");
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toContain("claude-user");
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toContain("perplexity-user");
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toContain("google-extended");
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toContain("cohere-ai");
    });

    it("is derived automatically from AI_SEARCH_CRAWLERS", () => {
      const expected = AI_SEARCH_CRAWLERS
        .filter(ua => !ua.toLowerCase().includes("bot"))
        .map(ua => ua.toLowerCase());
      expect(CRAWLER_TOKENS_WITHOUT_BOT).toStrictEqual(expected);
    });
  });

  describe("isCrawlerUserAgent", () => {
    it("returns true for all 14 AI search crawlers", () => {
      for (const ua of AI_SEARCH_CRAWLERS) {
        expect(isCrawlerUserAgent(ua)).toBe(true);
      }
    });

    it("returns true for real UA strings", () => {
      expect(isCrawlerUserAgent("Mozilla/5.0 (compatible; Google-Extended)")).toBe(true);
      expect(isCrawlerUserAgent("cohere-ai")).toBe(true);
      expect(isCrawlerUserAgent("Mozilla/5.0 (compatible; Claude-User/1.0; +claudebot@anthropic.com)")).toBe(true);
      expect(isCrawlerUserAgent("Mozilla/5.0 AppleWebKit/537.36 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)")).toBe(true);
    });

    it("returns false for non-crawler UAs", () => {
      expect(isCrawlerUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36")).toBe(false);
      expect(isCrawlerUserAgent("curl/7.88.1")).toBe(false);
    });
  });

  describe("classifyRootRequest", () => {
    it("crawlers prefer /en regardless of country (CN/JP/US)", () => {
      const crawlers = AI_SEARCH_CRAWLERS;
      for (const ua of crawlers) {
        expect(classifyRootRequest({ userAgent: ua, countryCode: "CN" })).toBe("/en");
        expect(classifyRootRequest({ userAgent: ua, countryCode: "JP" })).toBe("/en");
        expect(classifyRootRequest({ userAgent: ua, countryCode: "US" })).toBe("/en");
      }
    });

    it("non-crawlers by country", () => {
      const realNonCrawler = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36";
      expect(classifyRootRequest({ userAgent: realNonCrawler, countryCode: "CN" })).toBe("/zh");
      expect(classifyRootRequest({ userAgent: realNonCrawler, countryCode: "JP" })).toBe("/ja");
      expect(classifyRootRequest({ userAgent: realNonCrawler, countryCode: "US" })).toBe("/en");
    });
  });

  describe("ROOT_PROBES", () => {
    it("each probe has expectStatus 307 and expectLocation ends with /en", () => {
      for (const probe of ROOT_PROBES) {
        expect(probe.expectStatus).toBe(307);
        const loc = probe.expectLocation;
        expect(loc.startsWith("https://www.winson.dev/en")).toBe(true);
      }
    });

    it("ROOT_PROBES entries pass classifyRootRequest CN check", () => {
      for (const probe of ROOT_PROBES) {
        const result = classifyRootRequest({ userAgent: probe.userAgent, countryCode: "CN" });
        expect(result).toBe("/en");
      }
    });

    it("contains both bot-containing bare tokens and non-bot real UAs", () => {
      const uaStrings = ROOT_PROBES.map(p => p.userAgent);
      
      const hasBotTokens = [
        "GPTBot",
        "ClaudeBot",
        "OAI-SearchBot",
        "PerplexityBot",
      ];
      const hasNonBotRealUas = [
        "Mozilla/5.0 (compatible; Google-Extended)",
        "cohere-ai",
        "Mozilla/5.0 (compatible; Claude-User/1.0; +claudebot@anthropic.com)",
        "Mozilla/5.0 AppleWebKit/537.36 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
      ];

      for (const token of hasBotTokens) {
        expect(uaStrings).toContain(token);
      }
      for (const real of hasNonBotRealUas) {
        expect(uaStrings).toContain(real);
      }
    });
  });

  describe("buildRedirectRules", () => {
    it("returns 6 rules in correct order", () => {
      const rules = buildRedirectRules();
      expect(rules).toHaveLength(6);
      expect(rules[0].description).toContain("/me");
      expect(rules[1].description).toContain("/resume");
      expect(rules[2].description).toContain("/zh");
      expect(rules[3].description).toContain("/ja");
      expect(rules[4].description).toContain("/en");
      expect(rules[5].description).toContain("apex");
    });

    it("last rule is apex redirect with status_code 308", () => {
      const rules = buildRedirectRules();
      const last = rules[rules.length - 1];
      expect(last.action_parameters.from_value.status_code).toBe(308);
    });

    it("all redirect rules have action_parameters.from_value.target_url with value or expression", () => {
      const rules = buildRedirectRules();
      for (const rule of rules) {
        const target = rule.action_parameters?.from_value?.target_url;
        expect(target).toBeDefined();
        expect(typeof target === "object").toBe(true);
        const hasValue = "value" in target;
        const hasExpr = "expression" in target;
        expect(hasValue || hasExpr).toBe(true);
        expect(hasValue && hasExpr).toBe(false);
      }
    });

    it("all rules are host-scoped with http.host", () => {
      const rules = buildRedirectRules();
      for (const rule of rules) {
        expect(rule.expression).toContain("http.host");
      }
    });

    it("apex redirect is the last rule and uses http.host eq winson.dev", () => {
      const rules = buildRedirectRules();
      const last = rules[rules.length - 1];
      expect(last.expression).toBe(`http.host eq "${ZONE_HOSTS[0]}"`);
      expect(last.ref).toBe("redirect_apex_to_www");
    });

    it("every crawler-matching redirect expression uses lower(http.user_agent)", () => {
      // The root locale rules (CN / JP / default) are the ones that decide
      // whether a request is a crawler. All three must compare case-insensitively:
      // real crawler UAs are CamelCase (GPTBot), and a case-sensitive "contains"
      // silently routes them to the geo locale instead of /en.
      const rules = buildRedirectRules();
      const rootRules = rules.filter((rule) =>
        rule.expression.includes("http.request.uri.path eq \"/\"")
      );

      expect(rootRules).toHaveLength(3);
      for (const rule of rootRules) {
        expect(rule.expression).toContain("lower(http.user_agent)");
        expect(rule.expression).not.toMatch(/(?<!lower\()http\.user_agent contains/);
      }
    });

    it("the redirect crawler expression covers the botless crawler tokens", () => {
      // lower() alone cannot match ChatGPT-User / Claude-User / Perplexity-User /
      // Google-Extended / cohere-ai: none of them contain the substring "bot".
      // Assert the generated expression really carries those tokens.
      const rules = buildRedirectRules();
      const defaultRule = rules.find((rule) => rule.ref === "redirect_root_default_en");
      expect(defaultRule).toBeDefined();

      for (const token of CRAWLER_TOKENS_WITHOUT_BOT) {
        expect(defaultRule?.expression).toContain(`"${token}"`);
      }
    });

    it("no rule uses the old IgnoreQueryStr field name", () => {
      const rules = buildRedirectRules();
      for (const rule of rules) {
        const json = JSON.stringify(rule);
        expect(json).not.toContain("IgnoreQueryStr");
      }
    });
  });

  describe("buildCacheRules", () => {
    // Shape and order verified against the live ruleset:
    //   cf rulesets account-rulesets phases get http_request_cache_settings -z winson.dev
    // Cache rules are LAST match wins, so order is behaviour, not cosmetics.
    it("returns 3 rules in the same order as the live ruleset", () => {
      const rules = buildCacheRules();
      expect(rules.map((r) => r.ref)).toEqual([
        "cache_html",
        "cache_assets_and_seo",
        "bypass_rsc_payload",
      ]);
    });

    it("both eligible rules use a valid edge_ttl mode", () => {
      const validModes = ["respect_origin", "override_origin", "bypass_by_default"];
      const eligible = buildCacheRules().filter((r) => r.action_parameters?.cache === true);

      expect(eligible).toHaveLength(2);
      for (const rule of eligible) {
        expect(validModes).toContain(rule.action_parameters?.edge_ttl?.mode);
      }
    });

    it("only the HTML rule is host-scoped; the assets rule is path-only (matches live)", () => {
      const [html, assets] = buildCacheRules();
      expect(html.expression).toContain("http.host");
      expect(assets.expression).not.toContain("http.host");
    });

    it("cache_key uses the custom_key query_string form Cloudflare actually stores", () => {
      for (const rule of buildCacheRules()) {
        if (rule.action_parameters?.cache !== true) continue;
        // The live config stores cache_key.custom_key.query_string.exclude = "*",
        // not the shorthand ignore_query_string. Both are accepted by the API;
        // only this form round-trips unchanged through get/update.
        expect(rule.action_parameters.cache_key).toEqual({
          custom_key: { query_string: { exclude: "*" } },
        });
        expect(JSON.stringify(rule)).not.toContain("IgnoreQueryStr");
      }
    });

    it("HTML rule: 1h edge TTL, respect origin for the browser, scoped to www", () => {
      const html = buildCacheRules()[0];
      expect(html.action_parameters.edge_ttl).toEqual({ mode: "override_origin", default: 3600 });
      expect(html.action_parameters.browser_ttl).toEqual({ mode: "respect_origin" });
      expect(html.expression).toContain(`http.host eq \"${ZONE_HOSTS[1]}\"`);
    });

    it("assets rule: 1d edge TTL, path-only, deliberately not host-scoped (matches live)", () => {
      const assets = buildCacheRules()[1];
      expect(assets.action_parameters.edge_ttl).toEqual({ mode: "override_origin", default: 86400 });
      expect(assets.action_parameters.browser_ttl).toEqual({ mode: "respect_origin" });
      expect(assets.expression).not.toContain("http.host");
    });

    it("RSC rule is cache:false under set_cache_settings, not a bypass_cache action", () => {
      const rsc = buildCacheRules()[2];
      expect(rsc.ref).toBe("bypass_rsc_payload");
      expect(rsc.action).toBe("set_cache_settings");
      expect(rsc.action_parameters).toEqual({ cache: false });
    });
  });

  describe("ACCESSIBLE_METHODS", () => {
    it("contains GET, HEAD, OPTIONS", () => {
      expect(ACCESSIBLE_METHODS).toEqual(["GET", "HEAD", "OPTIONS"]);
    });
  });

  describe("ACCESSIBLE_EXACT_PATHS", () => {
    it("contains all required exact paths", () => {
      const required = [
        "/",
        "/en",
        "/en/",
        "/zh",
        "/zh/",
        "/ja",
        "/ja/",
        "/me",
        "/resume",
        "/robots.txt",
        "/sitemap.xml",
        "/llms.txt",
        "/llms-full.txt",
        "/favicon.ico",
        "/file.svg",
        "/globe.svg",
        "/next.svg",
        "/vercel.svg",
        "/window.svg",
        "/7d41c9f0e3a84b6fa1c2d5e0937b4f18.txt",
        "/en/opengraph-image/default",
        "/zh/opengraph-image/default",
        "/ja/opengraph-image/default",
      ];
      for (const path of required) {
        expect(ACCESSIBLE_EXACT_PATHS).toContain(path);
      }
    });
  });

  describe("ACCESSIBLE_PATH_PREFIXES", () => {
    it("contains /_next/static/", () => {
      expect(ACCESSIBLE_PATH_PREFIXES).toEqual(["/_next/static/"]);
    });
  });

  describe("buildAccessAllowlistExpression", () => {
    it("returns expression containing method check with 'in' operator", () => {
      const expr = buildAccessAllowlistExpression();
      expect(expr).toContain('http.request.method in {"GET" "HEAD" "OPTIONS"}');
    });

    it("returns expression containing exact path check with 'in' operator", () => {
      const expr = buildAccessAllowlistExpression();
      expect(expr).toContain("http.request.uri.path in {");
      expect(expr).toContain('"/en"');
      expect(expr).toContain('"/robots.txt"');
    });

    it("returns expression containing prefix check with starts_with", () => {
      const expr = buildAccessAllowlistExpression();
      expect(expr).toContain('starts_with(http.request.uri.path, "/_next/static/")');
    });

    it("does not use matches() or regex", () => {
      const expr = buildAccessAllowlistExpression();
      expect(expr).not.toContain("matches(");
      expect(expr).not.toContain("~");
      expect(expr).not.toContain("regex");
    });
  });

  describe("buildFirewallRules", () => {
    // The live phase carries a managed_challenge rule for cloud.winson.dev that
    // references a $risk_ips list. phases update REPLACES the phase, so the module
    // must reproduce it or applying the ruleset would delete it from production.
    it("returns 4 rules including the preserved cloud.winson.dev challenge", () => {
      const rules = buildFirewallRules();
      expect(rules).toHaveLength(4);
      expect(rules[0].action).toBe("managed_challenge");
      expect(rules[0].expression).toContain("cloud.winson.dev");
    });

    it("the three winson.dev block rules are host-scoped via ZONE_HOSTS", () => {
      const blockRules = buildFirewallRules().slice(1);
      expect(blockRules).toHaveLength(3);
      for (const rule of blockRules) {
        expect(rule.action).toBe("block");
        for (const host of ZONE_HOSTS) {
          expect(rule.expression).toContain(`\"${host}\"`);
        }
      }
    });

    it("the 4th rule is the allowlist-deny rule with ref waf-allowlist-deny", () => {
      const rules = buildFirewallRules();
      const lastRule = rules[rules.length - 1];
      expect(lastRule.ref).toBe("waf-allowlist-deny");
      expect(lastRule.action).toBe("block");
      expect(lastRule.description).toContain("allowlist");
    });

    it("the allowlist-deny rule expression contains the allowlist expression", () => {
      const rules = buildFirewallRules();
      const lastRule = rules[rules.length - 1];
      const allowlistExpr = buildAccessAllowlistExpression();
      expect(lastRule.expression).toContain(allowlistExpr);
      expect(lastRule.expression).toContain("not (");
    });

    it("preserves the first 3 rules unchanged", () => {
      const rules = buildFirewallRules();
      // Rule 0: cloud.winson.dev managed_challenge
      expect(rules[0].ref).toBe("cloud_winson_dev_managed_challenge");
      expect(rules[0].action).toBe("managed_challenge");
      // Rule 1: waf-ua-block
      expect(rules[1].ref).toBe("waf-ua-block");
      expect(rules[1].action).toBe("block");
      expect(rules[1].expression).toContain("lower(http.user_agent)");
      // Rule 2: waf-path-block
      expect(rules[2].ref).toBe("waf-path-block");
      expect(rules[2].action).toBe("block");
      expect(rules[2].expression).toContain(".php");
    });

    it("UA rule uses lower(http.user_agent) and every bulk scraper in lowercase", () => {
      const uaRule = buildFirewallRules().find((r) => r.ref === "waf-ua-block");
      expect(uaRule?.expression).toContain("lower(http.user_agent)");
      for (const ua of AI_BULK_SCRAPERS) {
        expect(uaRule?.expression).toContain(`\"${ua.toLowerCase()}\"`);
      }
    });

    it("path rule blocks common attack vectors", () => {
      const pathRule = buildFirewallRules().find((r) => r.ref === "waf-path-block");
      for (const needle of [".php", "/wp-", "/.env", "/.git", "xmlrpc"]) {
        expect(pathRule?.expression).toContain(needle);
      }
    });
  });
});