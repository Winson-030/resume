import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/**
 * Build timestamp shared with sitemap.xml and the ProfilePage JSON-LD.
 * Prefers an explicit override, then the last commit date, then build time so a
 * build without git metadata still succeeds.
 */
function resolveLastModified(): string {
  const override = process.env.SITE_LAST_MODIFIED;
  if (override) return override;

  try {
    const isoTimestamp = execSync("git log -1 --format=%cI", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    if (isoTimestamp) return new Date(isoTimestamp).toISOString();
  } catch {
    // Not a git checkout (tarball, shallow CI): fall through to build time.
  }

  return new Date().toISOString();
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  env: {
    NEXT_PUBLIC_SITE_LAST_MODIFIED:
      process.env.NEXT_PUBLIC_SITE_LAST_MODIFIED ?? resolveLastModified(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "winson.dev",
      },
      {
        protocol: "https",
        hostname: "www.winson.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
