import type { UnwrapResult } from './types';

/**
 * Shortlink and resolver domains that should be unwrapped
 */
const UNWRAP_DOMAINS = [
  'doi.org',
  'dx.doi.org',
  'hdl.handle.net',
  'purl.org',
  'n2t.net',
  'perma.cc',
  'w3id.org',
  'bit.ly',
  't.co',
  'tinyurl.com',
  'ow.ly',
  'buff.ly',
  'goo.gl',
];

/**
 * Unwrap a URL by following redirects with hop and timeout limits
 *
 * Resolves shortlinks and resolver URLs (like DOI.org, bit.ly) to their
 * final destination. Uses HEAD requests for efficiency, falling back to
 * GET if the server doesn't support HEAD.
 *
 * @param url - URL to unwrap
 * @param maxHops - Maximum number of redirects to follow (default: 10)
 * @param timeout - Timeout per request in milliseconds (default: 5000)
 * @returns Unwrap result with final URL, hop count, and timeout flag
 */
export async function unwrapUrl(
  url: string,
  maxHops: number = 10,
  timeout: number = 5000
): Promise<UnwrapResult> {
  let currentUrl = url;
  let hops = 0;
  let timedOut = false;

  /**
   * Check if a URL should be unwrapped
   * Only unwraps URLs from known shortlink/resolver domains
   */
  const shouldUnwrap = (urlStr: string): boolean => {
    try {
      const parsed = new URL(urlStr);
      // Check if hostname matches or is subdomain of unwrap domain
      return UNWRAP_DOMAINS.some(domain =>
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  };

  // Follow redirects until we hit a non-unwrap domain or max hops
  while (shouldUnwrap(currentUrl) && hops < maxHops) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Try HEAD first for efficiency (doesn't download response body)
        let response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual', // Handle redirects manually to count hops
          signal: controller.signal,
        });

        // If HEAD fails (405 Method Not Allowed) or client error, try GET
        // Some servers don't support HEAD requests
        if (response.status === 405 || (response.status >= 400 && response.status < 500)) {
          response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);

        // Check for redirect response (3xx status codes)
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('Location');
          if (location) {
            // Resolve relative URLs against current URL as base
            currentUrl = new URL(location, currentUrl).href;
            hops++;
            continue;
          }
        }

        // No more redirects, we've reached the final URL
        break;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          timedOut = true;
          break;
        }
        // On fetch error (network error, etc.), stop unwrapping
        break;
      }
    } catch {
      // Outer catch for timeout setup errors
      break;
    }
  }

  return {
    url: currentUrl,
    hops,
    timedOut,
  };
}
