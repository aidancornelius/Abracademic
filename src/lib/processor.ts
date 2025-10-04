import type { ProcessingResult, ExtensionConfig, AccessMethod } from './types';
import { unwrapUrl } from './unwrap';
import { extractIdentifiers } from './identifiers';
import { canonicalizeUrl } from './publishers';
import { routeUrl, probeUrl, detectCasaToken } from './access';

/**
 * Main URL processing logic with fallback ladder
 */
export async function processUrl(
  url: string,
  config: ExtensionConfig
): Promise<ProcessingResult> {
  const startTime = Date.now();
  const result: ProcessingResult = {
    success: false,
    originalUrl: url,
    identifiers: [],
    timestamp: startTime,
  };

  try {
    // Step 1: Unwrap shortlinks and resolvers
    const unwrapResult = await unwrapUrl(url, config.maxRedirectHops, config.redirectTimeout);
    let currentUrl = unwrapResult.url;
    result.redirectHops = unwrapResult.hops;

    // Step 2: Extract identifiers from the URL
    result.identifiers = extractIdentifiers(currentUrl);

    // Step 3: Canonicalize publisher URLs
    const canonical = canonicalizeUrl(currentUrl);
    if (canonical) {
      result.canonicalUrl = canonical;
      currentUrl = canonical;
      // Re-extract identifiers from canonical URL (e.g., Nature URLs become DOI URLs)
      result.identifiers = extractIdentifiers(currentUrl);
    }

    // Step 3.5: Check for CASA token (informational only)
    try {
      result.casaTokenDetected = await detectCasaToken(currentUrl);
    } catch {
      result.casaTokenDetected = false;
    }

    // Step 4: Route via access method with fallback ladder
    const methodsToTry: AccessMethod[] = [config.defaultMethod];
    if (config.enableFallback) {
      // Add fallback methods (avoid duplicates)
      for (const method of config.fallbackOrder) {
        if (!methodsToTry.includes(method)) {
          methodsToTry.push(method);
        }
      }
    }

    let fallbackAttempts = 0;
    for (const method of methodsToTry) {
      const routedUrl = await routeUrl(currentUrl, method, result.identifiers, config);
      if (!routedUrl) {
        fallbackAttempts++;
        continue;
      }

      // Optional post-proxy probe
      // Skip probing for Google Scholar (it's just a search) and Anna's Archive
      if (config.enablePostProxyProbe && method !== 'direct' && method !== 'annasarchive' && method !== 'googlescholar') {
        const probe = await probeUrl(routedUrl, config.redirectTimeout);

        // If blocked (401/403) or error, try next method
        if (!probe.accessible) {
          if (probe.statusCode === 401 || probe.statusCode === 403) {
            fallbackAttempts++;
            continue;
          }
        }
      }

      // Success!
      result.success = true;
      result.finalUrl = routedUrl;
      result.method = method;
      result.fallbackAttempts = fallbackAttempts;
      return result;
    }

    // All methods failed
    result.error = 'All access methods failed';
    result.fallbackAttempts = fallbackAttempts;
  } catch (error: any) {
    result.error = error.message || 'Unknown error';
  }

  return result;
}
