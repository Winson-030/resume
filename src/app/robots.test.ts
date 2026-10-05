import { describe, expect, it } from "vitest";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import robots from "./robots";

interface Rule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
}

describe("robots", () => {
  const config = robots();
  const rules = (Array.isArray(config.rules) ? config.rules : [config.rules]) as Rule[];
  const userAgents = (rule: Rule) =>
    Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];

  it("allows the wildcard plus answer engines, and disallows the bulk scrapers", () => {
    const disallowed = new Set(["Bytespider", "CCBot", "Amazonbot", "meta-externalagent"]);
    const allowed = new Set([
      "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot",
      "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended",
      "Applebot-Extended", "cohere-ai", "YouBot", "DuckAssistBot", "Timpibot",
    ]);

    expect(userAgents(rules[0])).toContain("*");

    const allowedListed = rules
      .filter((rule) => userAgents(rule).every((ua) => allowed.has(ua)))
      .flatMap(userAgents);

    for (const ua of allowed) expect(allowedListed).toContain(ua);

    for (const ua of disallowed) {
      const rule = rules.find((item) => userAgents(item).includes(ua));
      expect(rule?.disallow).toBe("/");
      expect(rule?.allow).toBeUndefined();
      expect(allowedListed).not.toContain(ua);
    }
  });

  it("points at the www origin with a bare host", () => {
    expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(config.host).toBe(SITE_HOST);
    expect(String(config.host)).not.toContain("://");
  });
});
