import type { PublisherRule } from './types';

/**
 * Publisher URL canonicalization rules
 * Conservative approach: only canonicalize when we're confident
 */

const publisherRules: PublisherRule[] = [
  // Wiley
  {
    pattern: /^https?:\/\/(?:www\.)?onlinelibrary\.wiley\.com/i,
    canonicalize: (url: URL): string | null => {
      // Extract DOI from Wiley URLs
      const doiMatch = url.pathname.match(/\/doi\/((?:abs|full|pdf|epdf)\/)?(.+)/);
      if (doiMatch) {
        const doi = doiMatch[2];
        return `https://onlinelibrary.wiley.com/doi/full/${doi}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const doiMatch = url.pathname.match(/\/doi\/(?:abs|full|pdf|epdf\/)?(.+)/);
      if (doiMatch) {
        return `https://onlinelibrary.wiley.com/doi/pdf/${doiMatch[1]}`;
      }
      return null;
    },
  },

  // SpringerLink
  {
    pattern: /^https?:\/\/(?:www\.)?link\.springer\.com/i,
    canonicalize: (url: URL): string | null => {
      // SpringerLink article or chapter
      const match = url.pathname.match(/\/(article|chapter)\/(10\.\d+\/[^\/]+)/);
      if (match) {
        return `https://link.springer.com/${match[1]}/${match[2]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/(article|chapter)\/(10\.\d+\/[^\/]+)/);
      if (match) {
        return `https://link.springer.com/content/pdf/${match[2]}.pdf`;
      }
      return null;
    },
  },

  // Taylor & Francis
  {
    pattern: /^https?:\/\/(?:www\.)?tandfonline\.com/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/doi\/(abs|full)\/(.+)/);
      if (match) {
        return `https://www.tandfonline.com/doi/full/${match[2]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/doi\/(?:abs|full)\/(.+)/);
      if (match) {
        return `https://www.tandfonline.com/doi/pdf/${match[1]}`;
      }
      return null;
    },
  },

  // JSTOR
  {
    pattern: /^https?:\/\/(?:www\.)?jstor\.org/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/stable\/(\d+)/);
      if (match) {
        return `https://www.jstor.org/stable/${match[1]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/stable\/(\d+)/);
      if (match) {
        return `https://www.jstor.org/stable/pdf/${match[1]}.pdf`;
      }
      return null;
    },
  },

  // SAGE
  {
    pattern: /^https?:\/\/(?:www\.)?journals\.sagepub\.com/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/doi\/(abs|full)\/(.+)/);
      if (match) {
        return `https://journals.sagepub.com/doi/full/${match[2]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/doi\/(?:abs|full)\/(.+)/);
      if (match) {
        return `https://journals.sagepub.com/doi/pdf/${match[1]}`;
      }
      return null;
    },
  },

  // ScienceDirect
  {
    pattern: /^https?:\/\/(?:www\.)?sciencedirect\.com/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/science\/article\/(?:pii|abs)\/([A-Z0-9]+)/);
      if (match) {
        return `https://www.sciencedirect.com/science/article/pii/${match[1]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/science\/article\/(?:pii|abs)\/([A-Z0-9]+)/);
      if (match) {
        return `https://www.sciencedirect.com/science/article/pii/${match[1]}/pdfft`;
      }
      return null;
    },
  },

  // IEEE
  {
    pattern: /^https?:\/\/(?:www\.)?ieeexplore\.ieee\.org/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/document\/(\d+)/);
      if (match) {
        return `https://ieeexplore.ieee.org/document/${match[1]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/document\/(\d+)/);
      if (match) {
        return `https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?tp=&arnumber=${match[1]}`;
      }
      return null;
    },
  },

  // Nature
  {
    pattern: /^https?:\/\/(?:www\.)?nature\.com/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/articles\/([a-z0-9\-]+)/);
      if (match) {
        // Nature article IDs look like DOIs but need the 10.1038/ prefix
        // Convert s41586-023-06647-8 to https://doi.org/10.1038/s41586-023-06647-8
        return `https://doi.org/10.1038/${match[1]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/articles\/([a-z0-9\-]+)/);
      if (match) {
        return `https://www.nature.com/articles/${match[1]}.pdf`;
      }
      return null;
    },
  },

  // arXiv
  {
    pattern: /^https?:\/\/(?:www\.)?arxiv\.org/i,
    canonicalize: (url: URL): string | null => {
      const match = url.pathname.match(/\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/);
      if (match) {
        return `https://arxiv.org/abs/${match[1]}`;
      }
      return null;
    },
    toPdf: (url: URL): string | null => {
      const match = url.pathname.match(/\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/);
      if (match) {
        return `https://arxiv.org/pdf/${match[1]}.pdf`;
      }
      return null;
    },
  },
];

/**
 * Canonicalize a publisher URL if a rule matches
 */
export function canonicalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    for (const rule of publisherRules) {
      if (rule.pattern.test(url)) {
        return rule.canonicalize(parsed);
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Get PDF URL for a publisher URL if a rule matches
 */
export function getPdfUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    for (const rule of publisherRules) {
      if (rule.pattern.test(url) && rule.toPdf) {
        return rule.toPdf(parsed);
      }
    }
  } catch {
    return null;
  }
  return null;
}
