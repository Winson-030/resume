/**
 * Simple in-memory cache for IP-to-locale mapping
 * Uses a Map with timestamp for TTL expiration
 */

interface CacheEntry {
  locale: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

// Default TTL: 1 hour (in milliseconds)
const DEFAULT_TTL = 60 * 60 * 1000;

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
 * Get cached locale for an IP address
 * Returns null if not found or expired
 */
export function getCachedLocale(ip: string): string | null {
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

  return entry.locale;
}

/**
 * Set cached locale for an IP address
 */
export function setCachedLocale(ip: string, locale: string): void {
  cache.set(ip, {
    locale,
    timestamp: Date.now(),
  });

  // Periodically clean up expired entries
  cleanupExpired();
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

/**
 * Get cache size
 */
export function getCacheSize(): number {
  return cache.size;
}
