#!/usr/bin/env node
// Pushes the localized pages to IndexNow (Bing, Yandex, Seznam, Naver).
// Run with: npm run indexnow
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://winson.dev";
const keyFileName =
  process.env.INDEXNOW_KEY_FILE ?? "7d41c9f0e3a84b6fa1c2d5e0937b4f18.txt";
const key = readFileSync(join(here, "..", "public", keyFileName), "utf8").trim();
const urlList = ["en", "zh", "ja"].map((locale) => `${siteUrl}/${locale}`);

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
