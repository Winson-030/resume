#!/usr/bin/env node
// Edge cache validation script
// Usage: node scripts/check-edge.mjs [base-url]
// Checks that the site is properly cached at the edge with correct behavior

import { URL } from 'url';
import { ROOT_PROBES, ACCESSIBLE_METHODS } from '../src/lib/edge-policy.mjs';

async function main() {
  const baseUrl = process.argv[2] || 'https://www.winson.dev';
  const parsedBaseUrl = new URL(baseUrl);
  const hostname = parsedBaseUrl.hostname;
  
  console.log(`Testing edge caching for ${baseUrl}`);
  console.log('');

  let passed = 0;
  let failed = 0;

  // Assert A: Check that various URLs are cached at the edge
  const urlsToTest = ['/en', '/zh', '/ja', '/llms.txt', '/llms-full.txt', '/sitemap.xml', '/robots.txt'];
  for (const url of urlsToTest) {
    const testUrl = `${baseUrl}${url}`;
    try {
      // First request
      const resp1 = await fetch(testUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      
      // Second request to check for cache hit
      const resp2 = await fetch(testUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      
      const cfCacheStatus = resp2.headers.get('cf-cache-status');
      const setCookie = resp2.headers.get('set-cookie');
      
      if (cfCacheStatus === 'HIT') {
        if (!setCookie) {
          console.log(`PASS A: ${url} - Cache HIT without set-cookie`);
          passed++;
        } else {
          console.log(`FAIL A: ${url} - Cache HIT but has set-cookie: ${setCookie}`);
          failed++;
        }
      } else {
        console.log(`FAIL A: ${url} - Cache status: ${cfCacheStatus || 'MISS'}, set-cookie: ${setCookie || 'none'}`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL A: ${url} - Error: ${error.message}`);
      failed++;
    }
  }

  // Extract OG image URL from /en page and test it too
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'GET',
      headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
      signal: AbortSignal.timeout(15000)
    });
    
    const html = await resp.text();
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
    
    if (ogImageMatch && ogImageMatch[1]) {
      const ogImageUrl = ogImageMatch[1];
      // Ensure it's an absolute URL
      let absoluteOgUrl;
      try {
        absoluteOgUrl = new URL(ogImageUrl).href;
      } catch {
        // If it's a relative URL, make it absolute
        absoluteOgUrl = new URL(ogImageUrl, baseUrl).href;
      }
      
      // Test caching for OG image
      const imgResp1 = await fetch(absoluteOgUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      
      const imgResp2 = await fetch(absoluteOgUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      
      const cfCacheStatus = imgResp2.headers.get('cf-cache-status');
      const setCookie = imgResp2.headers.get('set-cookie');
      
      if (cfCacheStatus === 'HIT') {
        if (!setCookie) {
          console.log(`PASS A: OG image - Cache HIT without set-cookie`);
          passed++;
        } else {
          console.log(`FAIL A: OG image - Cache HIT but has set-cookie: ${setCookie}`);
          failed++;
        }
      } else {
        console.log(`FAIL A: OG image - Cache status: ${cfCacheStatus || 'MISS'}, set-cookie: ${setCookie || 'none'}`);
        failed++;
      }
    } else {
      console.log(`FAIL A: Could not extract OG image URL from /en`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL A: Error testing OG image - ${error.message}`);
    failed++;
  }

  // Assert B: Check ROOT_PROBES (crawlers must get 307 to /en regardless of country)
  for (const probe of ROOT_PROBES) {
    try {
      const resp = await fetch(`${baseUrl}/`, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': probe.userAgent },
        signal: AbortSignal.timeout(15000)
      });
      
      const location = resp.headers.get('location');
      // Cloudflare may return either an absolute URL or a root-relative path.
      // Normalize both sides to a path so the comparison is not sensitive to that.
      const toPath = (value) => {
        if (!value) return value;
        try {
          return new URL(value, baseUrl).pathname;
        } catch {
          return value;
        }
      };
      const actualPath = toPath(location);
      const expectedPath = toPath(probe.expectLocation);
      
      if (resp.status === probe.expectStatus && actualPath === expectedPath) {
        console.log(`PASS B: ${probe.name} - ${resp.status} -> ${location}`);
        passed++;
      } else {
        console.log(`FAIL B: ${probe.name} - expected ${probe.expectStatus} -> ${probe.expectLocation}, got ${resp.status} -> ${location}`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL B: ${probe.name} - Error: ${error.message}`);
      failed++;
    }
  }

  // Assert C: Check that /nope returns 403 (WAF block for non-allowlisted path)
  try {
    const resp = await fetch(`${baseUrl}/nope`, {
      method: 'GET',
      redirect: 'manual', // Do not follow: a 307 to /en/nope would fake a real 404.
      headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
      signal: AbortSignal.timeout(15000)
    });

    if (resp.status === 403) {
      console.log(`PASS C: /nope -> 403 (WAF block)`);
      passed++;
    } else {
      console.log(`FAIL C: /nope -> ${resp.status} instead of 403`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL C: Error testing 404 - ${error.message}`);
    failed++;
  }

  // Assert F: Allowed-path smoke tests (must not be 403)
  const allowedPaths = ['/en', '/zh', '/ja', '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/favicon.ico'];
  for (const path of allowedPaths) {
    try {
      const resp = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });

      if (resp.status !== 403) {
        console.log(`PASS F: ${path} -> ${resp.status} (not blocked)`);
        passed++;
      } else {
        console.log(`FAIL F: ${path} -> 403 (should be allowed)`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL F: ${path} - Error: ${error.message}`);
      failed++;
    }
  }

  // Assert F2: Trailing slash paths return 308 (redirect to non-slash version)
  const trailingSlashPaths = ['/en/', '/zh/', '/ja/'];
  for (const path of trailingSlashPaths) {
    try {
      const resp = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });

      if (resp.status === 308) {
        console.log(`PASS F2: ${path} -> 308 (redirect)`);
        passed++;
      } else {
        console.log(`FAIL F2: ${path} -> ${resp.status} instead of 308`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL F2: ${path} - Error: ${error.message}`);
      failed++;
    }
  }

  // Assert F3: OpenGraph default images must return 200
  const ogPaths = ['/en/opengraph-image/default', '/zh/opengraph-image/default', '/ja/opengraph-image/default'];
  for (const path of ogPaths) {
    try {
      const resp = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });

      if (resp.status === 200) {
        console.log(`PASS F3: ${path} -> 200`);
        passed++;
      } else {
        console.log(`FAIL F3: ${path} -> ${resp.status} instead of 200`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL F3: ${path} - Error: ${error.message}`);
      failed++;
    }
  }

  // Assert F4: Extract a real /_next/static/ URL from /en HTML and verify it's not blocked
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'GET',
      headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
      signal: AbortSignal.timeout(15000)
    });

    const html = await resp.text();
    const staticMatch = html.match(/\/_next\/static\/[^"']+/);

    if (staticMatch && staticMatch[0]) {
      const staticUrl = staticMatch[0];
      const staticResp = await fetch(`${baseUrl}${staticUrl}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });

      if (staticResp.status !== 403) {
        console.log(`PASS F4: ${staticUrl} -> ${staticResp.status} (not blocked)`);
        passed++;
      } else {
        console.log(`FAIL F4: ${staticUrl} -> 403 (should be allowed)`);
        failed++;
      }
    } else {
      console.log(`SKIP F4: Could not extract /_next/static/ URL from /en`);
    }
  } catch (error) {
    console.log(`FAIL F4: Error testing /_next/static/ - ${error.message}`);
    failed++;
  }

  // Assert F5: OPTIONS /en must return 204
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'OPTIONS',
      headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
      signal: AbortSignal.timeout(15000)
    });

    if (resp.status === 204) {
      console.log(`PASS F5: OPTIONS /en -> 204`);
      passed++;
    } else {
      console.log(`FAIL F5: OPTIONS /en -> ${resp.status} instead of 204`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL F5: Error testing OPTIONS /en - ${error.message}`);
    failed++;
  }

  // Assert F6: /en?allowlist_test=1 must return 200 (query string auto-allowed)
  try {
    const resp = await fetch(`${baseUrl}/en?allowlist_test=1`, {
      method: 'GET',
      headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
      signal: AbortSignal.timeout(15000)
    });

    if (resp.status === 200) {
      console.log(`PASS F6: /en?allowlist_test=1 -> 200`);
      passed++;
    } else {
      console.log(`FAIL F6: /en?allowlist_test=1 -> ${resp.status} instead of 200`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL F6: Error testing /en?allowlist_test=1 - ${error.message}`);
    failed++;
  }

  // Assert G: Blocked-path smoke tests (must be 403)
  const blockedPaths = ['/.env', '/.env.local', '/wp-content/themes/index.php', '/this_is_a_new_hello_world.php', '/chosen.php', '/api/health', '/_next/image'];
  for (const path of blockedPaths) {
    try {
      const resp = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });

      if (resp.status === 403) {
        console.log(`PASS G: ${path} -> 403 (blocked)`);
        passed++;
      } else {
        console.log(`FAIL G: ${path} -> ${resp.status} instead of 403`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL G: ${path} - Error: ${error.message}`);
      failed++;
    }
  }

  // Assert G2: POST /en must be 403 (method not in allowlist)
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'POST',
      headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
      signal: AbortSignal.timeout(15000)
    });

    if (resp.status === 403) {
      console.log(`PASS G2: POST /en -> 403 (blocked)`);
      passed++;
    } else {
      console.log(`FAIL G2: POST /en -> ${resp.status} instead of 403`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL G2: Error testing POST /en - ${error.message}`);
    failed++;
  }

  // Assert D: Test crawler permissions
  // D1: GPTBot should get 200 on /en
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'GET',
      headers: { 'User-Agent': 'GPTBot' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (resp.status === 200) {
      console.log(`PASS D1: GPTBot /en -> 200`);
      passed++;
    } else {
      console.log(`FAIL D1: GPTBot /en -> ${resp.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL D1: Error testing GPTBot - ${error.message}`);
    failed++;
  }

  // D2: Bytespider should not get 200 on /en (should be 403/404/429/503)
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'GET',
      headers: { 'User-Agent': 'Bytespider' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (resp.status !== 200) {
      console.log(`PASS D2: Bytespider /en -> ${resp.status} (blocked)`);
      passed++;
    } else {
      console.log(`FAIL D2: Bytespider /en -> 200 (should be blocked)`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL D2: Error testing Bytespider - ${error.message}`);
    failed++;
  }

  // D3: ccbot/2.0 (lowercase) should also be blocked (to catch WAF case-sensitivity regression)
  try {
    const resp = await fetch(`${baseUrl}/en`, {
      method: 'GET',
      headers: { 'User-Agent': 'ccbot/2.0 (https://commoncrawl.org/faq/)' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (resp.status !== 200) {
      console.log(`PASS D3: ccbot/2.0 /en -> ${resp.status} (blocked via lowercase WAF check)`);
      passed++;
    } else {
      console.log(`FAIL D3: ccbot/2.0 /en -> 200 (should be blocked - lowercase WAF regression)`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL D3: Error testing ccbot/2.0 - ${error.message}`);
    failed++;
  }

  // Assert E: Test apex domain redirect (only if www.winson.dev)
  if (hostname === 'www.winson.dev') {
    const apexUrl = 'https://winson.dev/en';  // Changed to request /en on apex
    try {
      const resp = await fetch(apexUrl, {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects
        headers: { 'User-Agent': 'Edge-Cache-Validator/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      
      const location = resp.headers.get('location');
      const vercelId = resp.headers.get('x-vercel-id');
      
      if (resp.status === 308) {
        if (location && location.startsWith('https://www.winson.dev')) {
          if (!vercelId) {
            console.log(`PASS E: apex /en -> 308 to ${location} (no x-vercel-id)`);
            passed++;
          } else {
            console.log(`FAIL E: apex /en -> 308 to ${location} but has x-vercel-id: ${vercelId}`);
            failed++;
          }
        } else {
          console.log(`FAIL E: apex /en -> 308 to invalid location: ${location}`);
          failed++;
        }
      } else {
        console.log(`FAIL E: apex /en -> ${resp.status} instead of 308`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL E: Error testing apex redirect - ${error.message}`);
      failed++;
    }
  } else {
    console.log(`SKIP E: Not testing apex redirect for non-www.winson.dev host (${hostname})`);
  }

  // Final result
  console.log('');
  console.log(`${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});
