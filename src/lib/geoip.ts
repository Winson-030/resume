import { getCachedLocale, setCachedLocale } from "./cache";

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
 * Get locale from country code
 */
function getLocaleFromCountryCode(countryCode: string): string {
  const upperCountry = countryCode.toUpperCase();

  switch (upperCountry) {
    case "CN":
      return "zh"; // Chinese
    case "JP":
      return "ja"; // Japanese
    default:
      return "en"; // Default to English
  }
}

/**
 * Get locale from IP address with caching
 */
export async function getLocaleFromIP(
  request: Request,
  defaultLocale: string = "en"
): Promise<string> {
  const ip = getClientIP(request);

  // No IP found, return default
  if (!ip) {
    return defaultLocale;
  }

  // Check cache first
  const cached = getCachedLocale(ip);
  if (cached) {
    return cached;
  }

  // Skip internal IPs
  if (isInternalIP(ip)) {
    return defaultLocale;
  }

  // Lookup country code
  const countryCode = await lookupCountryCode(ip);

  // Default on failure
  if (!countryCode) {
    return defaultLocale;
  }

  // Convert to locale
  const locale = getLocaleFromCountryCode(countryCode);

  // Cache the result
  setCachedLocale(ip, locale);

  return locale;
}
