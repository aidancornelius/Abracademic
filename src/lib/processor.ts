import type { ProcessingResult, ExtensionConfig, AccessMethod } from './types';
import { unwrapUrl } from './unwrap';
import { extractIdentifiers } from './identifiers';
import { canonicalizeUrl } from './publishers';
import { routeUrl, probeUrl, detectCasaToken } from './access';

/**
 * Main URL processing logic with fallback ladder
 *
 * Processes an academic URL through multiple stages to find the best access method:
 * 1. Unwraps shortlinks and resolver URLs (DOI, handle.net, etc.)
 * 2. Extracts academic identifiers (DOI, ISBN, PMID, etc.)
 * 3. Canonicalizes publisher URLs to standard formats
 * 4. Routes through configured access methods with automatic fallback
 *
 * @param url - The URL to process (can be article URL, DOI link, or shortlink)
 * @param config - Extension configuration including access methods and institution settings
 * @returns Processing result containing the final URL, method used, and metadata
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
    // Follows redirects from DOI.org, bit.ly, etc. to get the actual article URL
    const unwrapResult = await unwrapUrl(url, config.maxRedirectHops, config.redirectTimeout);
    let currentUrl = unwrapResult.url;
    result.redirectHops = unwrapResult.hops;

    // Step 2: Extract identifiers from the URL
    // Finds DOIs, ISBNs, PMIDs, etc. embedded in the URL or page path
    result.identifiers = extractIdentifiers(currentUrl);

    // Step 3: Canonicalize publisher URLs
    // Normalizes publisher URLs to a standard format (e.g., Wiley /doi/abs/... to /doi/full/...)
    const canonical = canonicalizeUrl(currentUrl);
    if (canonical) {
      result.canonicalUrl = canonical;
      currentUrl = canonical;
      // Re-extract identifiers from canonical URL (e.g., Nature URLs become DOI URLs)
      result.identifiers = extractIdentifiers(currentUrl);
    }

    // Step 3.5: Check for CASA token (informational only)
    // CASA tokens enable off-campus access for previously authenticated users
    try {
      result.casaTokenDetected = await detectCasaToken(currentUrl);
    } catch {
      result.casaTokenDetected = false;
    }

    // Step 4: Route via access method with fallback ladder
    // Build ordered list of access methods to try
    const methodsToTry: AccessMethod[] = [config.defaultMethod];
    if (config.enableFallback) {
      // Add fallback methods (avoid duplicates)
      for (const method of config.fallbackOrder) {
        if (!methodsToTry.includes(method)) {
          methodsToTry.push(method);
        }
      }
    }

    // Try each access method in order until one succeeds
    let fallbackAttempts = 0;
    for (const method of methodsToTry) {
      const routedUrl = await routeUrl(currentUrl, method, result.identifiers, config);
      if (!routedUrl) {
        // Method couldn't generate a URL (e.g., missing config)
        fallbackAttempts++;
        continue;
      }

      // Optional post-proxy probe
      // Verify the proxied URL is accessible before returning it
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

      // Success! Found an accessible URL
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
