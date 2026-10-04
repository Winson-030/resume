import { getCachedCountry, setCachedCountry } from "./cache";

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | null {
  // Check various headers that might contain the real client IP
  const headers = [
    "CF-Connecting-IP", // Cloudflare
    "X-Forwarded-For", // Standard proxy
    "X-Real-IP", // Nginx
    "X-Client-IP",
  ];

  for (const header of headers) {
    const ip = request.headers.get(header);
    if (ip) {
      // X-Forwarded-For might contain multiple IPs (client, proxy1, proxy2)
      // Take the first one which is the client IP
      return ip.split(",")[0].trim();
    }
  }

  return null;
}

/**
 * Check if IP is localhost or internal network
 */
export function isInternalIP(ip: string): boolean {
  // IPv4 localhost
  if (ip === "127.0.0.1" || ip === "localhost") {
    return true;
  }

  // IPv6 localhost
  if (ip === "::1" || ip === "[::1]") {
    return true;
  }

  // IPv4 private networks
  const privateNetworks = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
  ];

  for (const network of privateNetworks) {
    if (network.test(ip)) {
      return true;
    }
  }

  return false;
}

/**
 * Country code from the hosting platform's geo headers, which are free and
 * synchronous, before falling back to a third-party IP lookup.
 */
export function getCountryFromHeaders(request: Request): string | null {
  const headerNames = ["x-vercel-ip-country", "cf-ipcountry", "x-country-code"];
  for (const name of headerNames) {
    const value = request.headers.get(name);
    if (value && /^[a-z]{2}$/i.test(value) && value.toUpperCase() !== "XX") {
      return value.toUpperCase();
    }
  }
  return null;
}

/**
 * Query ipapi.co API for country code
 */
async function lookupCountryCode(ip: string): Promise<string | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Check if we hit rate limit
    if (data.error) {
      console.warn("ipapi.co error:", data.reason);
      return null;
    }

    return data.country_code || null;
  } catch (error) {
    console.warn("ipapi.co request failed:", error);
    return null;
  }
}

/**
 * Country code for the client IP: in-memory cache first, then an ipapi.co
 * lookup. Platform geo headers are read separately by getCountryFromHeaders,
 * which is free and synchronous; callers only reach here when those headers
 * were absent. Returns null when no country can be determined.
 */
export async function detectCountryFromIP(request: Request): Promise<string | null> {
  const ip = getClientIP(request);
  if (!ip) {
    return null;
  }

  const cached = getCachedCountry(ip);
  if (cached) {
    return cached;
  }

  // Skip internal IPs: a lookup would only ever return the data centre itself.
  if (isInternalIP(ip)) {
    return null;
  }

  const countryCode = await lookupCountryCode(ip);
  if (countryCode) {
    setCachedCountry(ip, countryCode);
  }

  return countryCode;
}
