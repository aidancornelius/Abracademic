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
 * Unwrap a URL by following redirects with hop and timeout limits.
 * Uses HEAD request first, falls back to GET if needed.
 */
export async function unwrapUrl(
  url: string,
  maxHops: number = 10,
  timeout: number = 5000
): Promise<UnwrapResult> {
  let currentUrl = url;
  let hops = 0;
  let timedOut = false;

  const shouldUnwrap = (urlStr: string): boolean => {
    try {
      const parsed = new URL(urlStr);
      return UNWRAP_DOMAINS.some(domain =>
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  };

  while (shouldUnwrap(currentUrl) && hops < maxHops) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Try HEAD first for efficiency
        let response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
          signal: controller.signal,
        });

        // If HEAD fails or doesn't give redirect, try GET
        if (response.status === 405 || (response.status >= 400 && response.status < 500)) {
          response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);

        // Check for redirect
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('Location');
          if (location) {
            // Resolve relative URLs
            currentUrl = new URL(location, currentUrl).href;
            hops++;
            continue;
          }
        }

        // No more redirects
        break;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          timedOut = true;
          break;
        }
        // On fetch error, stop unwrapping
        break;
      }
    } catch {
      break;
    }
  }

  return {
    url: currentUrl,
    hops,
    timedOut,
  };
}
