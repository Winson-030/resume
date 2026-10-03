import { describe, expect, it } from "vitest";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import robots from "./robots";

interface Rule {
  userAgent: string | string[];
  allow?: string | string[];
}

describe("robots", () => {
  const config = robots();
  const rules = (Array.isArray(config.rules) ? config.rules : [config.rules]) as Rule[];
  const userAgents = (rule: Rule) =>
    Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];

  it("allows everything and keeps the explicit AI allowlist", () => {
    const listed = rules.flatMap(userAgents);

    expect(userAgents(rules[0])).toContain("*");
    expect(listed).toContain("GPTBot");
    expect(listed).toContain("Google-Extended");
    expect(listed).toContain("PerplexityBot");
    expect(listed).toContain("meta-externalagent");

    for (const rule of rules) {
      expect(rule.allow).toBe("/");
    }
  });

  it("points at the www origin with a bare host", () => {
    expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(config.host).toBe(SITE_HOST);
    expect(String(config.host)).not.toContain("://");
  });
});
