/**
 * Simple in-memory cache for IP-to-country-code mapping
 * Uses a Map with timestamp for TTL expiration
 */

interface CacheEntry {
  countryCode: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

// Default TTL: 1 hour (in milliseconds)
const DEFAULT_TTL = 60 * 60 * 1000;

// Hard cap on cached IP -> country entries per server instance.
const MAX_ENTRIES = 5000;

/**
 * Get TTL from environment or use default
 */
function getTTL(): number {
  const ttlEnv = process.env.GEOIP_CACHE_TTL;
  if (ttlEnv) {
    const seconds = parseInt(ttlEnv, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
  }
  return DEFAULT_TTL;
}

/**
 * Get cached country code for an IP address
 * Returns null if not found or expired
 */
export function getCachedCountry(ip: string): string | null {
  const entry = cache.get(ip);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  const ttl = getTTL();

  // Check if expired
  if (now - entry.timestamp > ttl) {
    cache.delete(ip);
    return null;
  }

  return entry.countryCode;
}

/**
 * Set cached country code for an IP address
 */
export function setCachedCountry(ip: string, countryCode: string): void {
  cache.set(ip, {
    countryCode,
    timestamp: Date.now(),
  });

  // Keep the map bounded: a long-lived instance would only ever grow otherwise.
  if (cache.size > MAX_ENTRIES) {
    cleanupExpired();

    const excess = cache.size - MAX_ENTRIES;
    if (excess > 0) {
      let removed = 0;

      for (const key of cache.keys()) {
        if (removed >= excess) break;
        cache.delete(key);
        removed += 1;
      }
    }
  }
}

/**
 * Remove expired entries from cache
 */
function cleanupExpired(): void {
  const now = Date.now();
  const ttl = getTTL();

  for (const [ip, entry] of cache.entries()) {
    if (now - entry.timestamp > ttl) {
      cache.delete(ip);
    }
  }
}

/**
 * Clear all cache entries
 * Useful for testing
 */
export function clearCache(): void {
  cache.clear();
}
