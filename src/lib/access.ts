import type { AccessMethod, ExtensionConfig, Identifier, ProbeResult } from './types';

/**
 * Access method routing: wrap URLs with institutional access or route to open access
 */

/**
 * Route a URL through OpenAthens
 */
function routeViaOpenAthens(url: string, entityId?: string): string | null {
  if (!entityId) return null;

  // Clean entity ID to just domain if it's a URL
  let institution = entityId;
  try {
    const parsed = new URL(entityId);
    institution = parsed.hostname;
  } catch {
    // Not a URL, use as-is (might be domain like "unisa.edu.au")
    institution = entityId;
  }

  const encoded = encodeURIComponent(url);
  return `https://go.openathens.net/redirector/${institution}?url=${encoded}`;
}

/**
 * Route a URL through EZProxy
 * Supports two methods:
 * 1. Login form: https://login.ezproxy.library.edu/login?url=...
 * 2. Hostname rewrite: https://example-com.login.ezproxy.library.edu/...
 */
function routeViaEZProxy(url: string, prefix?: string, suffix?: string): string | null {
  if (!prefix) return null;

  try {
    const parsed = new URL(url);

    // Check if prefix contains query param indicator (|qurl)
    let queryParam = 'url';
    let cleanPrefix = prefix;

    if (prefix.includes('|qurl')) {
      queryParam = 'qurl';
      cleanPrefix = prefix.replace('|qurl', '');
    }

    // Check if prefix already contains /login (login form method)
    if (cleanPrefix.includes('/login') || suffix) {
      // Login form method: https://login.ezproxy.library.edu/login?url=...
      const baseUrl = cleanPrefix.endsWith('/login') ? cleanPrefix : `${cleanPrefix}/login`;
      return `${baseUrl}?${queryParam}=${encodeURIComponent(url)}`;
    } else {
      // Hostname rewrite method: https://example-com.login.ezproxy.library.edu/path
      const hostname = parsed.hostname.replace(/\./g, '-');
      return `https://${hostname}.${cleanPrefix}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return null;
  }
}

/**
 * Route via LibKey (Third Iron)
 */
function routeViaLibKey(
  url: string,
  identifiers: Identifier[],
  libraryId?: string
): string | null {
  if (!libraryId) return null;

  // LibKey prefers DOI or ISBN
  const doi = identifiers.find(i => i.type === 'doi');
  if (doi) {
    // LibKey format: https://libkey.io/libraries/{id}/{doi}
    return `https://libkey.io/libraries/${libraryId}/${doi.normalized}`;
  }

  const isbn = identifiers.find(i => i.type === 'isbn');
  if (isbn) {
    return `https://libkey.io/libraries/${libraryId}/${isbn.normalized}`;
  }

  // Fallback to URL parameter
  return `https://libkey.io/libraries/${libraryId}?url=${encodeURIComponent(url)}`;
}

/**
 * Route via Unpaywall
 */
async function routeViaUnpaywall(identifiers: Identifier[]): Promise<string | null> {
  const doi = identifiers.find(i => i.type === 'doi');
  if (!doi) return null;

  try {
    // Unpaywall API endpoint
    const apiUrl = `https://api.unpaywall.org/v2/${encodeURIComponent(doi.normalized)}?email=extension@example.com`;
    const response = await fetch(apiUrl, { method: 'GET' });

    if (response.ok) {
      const data = await response.json();

      // Check for best OA location
      if (data.best_oa_location?.url_for_pdf) {
        return data.best_oa_location.url_for_pdf;
      }
      if (data.best_oa_location?.url) {
        return data.best_oa_location.url;
      }
    }
  } catch (error) {
    console.error('Unpaywall API error:', error);
  }

  return null;
}

/**
 * Route via Google Scholar
 * Uses Google Scholar's search which can leverage pre-configured institutional library links
 */
function routeViaGoogleScholar(url: string, identifiers: Identifier[]): string {
  // Prefer DOI for most accurate search
  const doi = identifiers.find(i => i.type === 'doi');
  if (doi) {
    return `https://scholar.google.com/scholar?q=${encodeURIComponent(doi.normalized)}`;
  }

  // Try PMID
  const pmid = identifiers.find(i => i.type === 'pmid');
  if (pmid) {
    return `https://scholar.google.com/scholar?q=PMID:${pmid.normalized}`;
  }

  // Try ISBN
  const isbn = identifiers.find(i => i.type === 'isbn');
  if (isbn) {
    return `https://scholar.google.com/scholar?q=ISBN:${isbn.normalized}`;
  }

  // Fallback to URL-based search (extract meaningful parts)
  try {
    const parsed = new URL(url);
    // Try to extract article title or identifier from path
    const pathParts = parsed.pathname.split('/').filter(p => p.length > 3);
    if (pathParts.length > 0) {
      return `https://scholar.google.com/scholar?q=${encodeURIComponent(pathParts.join(' '))}`;
    }
  } catch {
    // Invalid URL, just search the whole thing
  }

  return `https://scholar.google.com/scholar?q=${encodeURIComponent(url)}`;
}

/**
 * Route via Anna's Archive
 */
function routeViaAnnasArchive(url: string, identifiers: Identifier[]): string {
  // Anna's Archive supports direct DOI and ISBN paths
  const doi = identifiers.find(i => i.type === 'doi');
  if (doi) {
    return `https://annas-archive.org/doi/${encodeURIComponent(doi.normalized)}`;
  }

  const isbn = identifiers.find(i => i.type === 'isbn');
  if (isbn) {
    return `https://annas-archive.org/isbn/${isbn.normalized}`;
  }

  // Fallback to URL search
  return `https://annas-archive.org/search?q=${encodeURIComponent(url)}`;
}

/**
 * Route a URL via the specified access method
 */
export async function routeUrl(
  url: string,
  method: AccessMethod,
  identifiers: Identifier[],
  config: ExtensionConfig
): Promise<string | null> {
  switch (method) {
    case 'openathens':
      return routeViaOpenAthens(url, config.openAthensEntityId);

    case 'ezproxy':
      return routeViaEZProxy(url, config.ezproxyPrefix, config.ezproxySuffix);

    case 'libkey':
      return routeViaLibKey(url, identifiers, config.libkeyLibraryId);

    case 'unpaywall':
      return await routeViaUnpaywall(identifiers);

    case 'googlescholar':
      return routeViaGoogleScholar(url, identifiers);

    case 'annasarchive':
      return routeViaAnnasArchive(url, identifiers);

    case 'direct':
    default:
      return url;
  }
}

/**
 * Probe a URL to check if it's accessible (not behind paywall)
 */
export async function probeUrl(url: string, timeout: number = 5000): Promise<ProbeResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const accessible = response.ok;
    return {
      accessible,
      statusCode: response.status,
    };
  } catch (error: any) {
    return {
      accessible: false,
      error: error.message,
    };
  }
}

/**
 * Detect CASA (Campus-Activated Subscriber Access) tokens
 * CASA tokens are publisher-issued tokens that enable off-campus access
 *
 * Note: We can only detect existing CASA tokens, not generate them.
 * CASA tokens are cryptographically signed by publishers and can only be
 * issued when accessing from authorized IP addresses.
 */
export async function detectCasaToken(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Common CASA token indicators in cookies or headers
    // Different publishers use different schemes, but common patterns include:
    // - Cookie names containing: CASA, casa, token, access, subscriber
    // - Headers: X-CASA-Token, Authorization with CASA schemes

    // Check for CASA-related cookies on publisher domains
    const casaCookiePatterns = [
      /casa/i,
      /subscriber.*access/i,
      /publisher.*token/i,
      /remote.*access/i,
    ];

    // In a real browser extension, we'd use browser.cookies.getAll()
    // For now, we'll do a best-effort check via fetch with credentials
    const response = await fetch(url, {
      method: 'HEAD',
      credentials: 'include', // Include cookies
      redirect: 'manual',
    });

    // Check response headers for CASA indicators
    const casaHeader = response.headers.get('X-CASA-Token');
    if (casaHeader) {
      return true;
    }

    // Check for Set-Cookie headers with CASA patterns
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) {
      for (const pattern of casaCookiePatterns) {
        if (pattern.test(setCookie)) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}
