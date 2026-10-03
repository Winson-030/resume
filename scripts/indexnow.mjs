#!/usr/bin/env node
// Pushes the localized pages to IndexNow (Bing, Yandex, Seznam, Naver).
// Run with: npm run indexnow
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.winson.dev";
const keyFileName =
  process.env.INDEXNOW_KEY_FILE ?? "7d41c9f0e3a84b6fa1c2d5e0937b4f18.txt";
const key = readFileSync(join(repoRoot, "public", keyFileName), "utf8").trim();

// Single source of truth for the locale list: src/lib/site.ts.
const siteSource = readFileSync(join(repoRoot, "src", "lib", "site.ts"), "utf8");
const localesMatch = siteSource.match(/export const locales = \[([^\]]*)\]/);

if (!localesMatch) {
  throw new Error("Could not read `locales` from src/lib/site.ts");
}

const locales = localesMatch[1]
  .split(",")
  .map((entry) => entry.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean);

if (locales.length === 0) {
  throw new Error("`locales` in src/lib/site.ts is empty");
}

const urlList = locales.map((locale) => `${siteUrl}/${locale}`);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList,
  }),
});

const body = (await response.text()).trim();
console.log(`IndexNow responded ${response.status} ${response.statusText}`);
console.log(`Submitted: ${urlList.join(", ")}`);
if (body) console.log(body);
if (!response.ok) process.exitCode = 1;
