import type { Identifier } from './types';

/**
 * Detect and extract identifiers from URLs and text
 */

// DOI pattern: 10.xxxx/...
const DOI_PATTERN = /\b(10\.\d{4,}(?:\.\d+)*\/[^\s]+)/gi;

// ISBN patterns (10 or 13 digits, with optional hyphens)
const ISBN_PATTERN = /\b(?:ISBN[:\s-]?)?(?:97[89][-\s]?)?(\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?[\dX])\b/gi;

// PubMed ID
const PMID_PATTERN = /\b(?:PMID:?\s*)?(\d{7,8})\b/gi;

// PubMed Central ID
const PMCID_PATTERN = /\b(PMC\d{6,8})\b/gi;

// arXiv ID (various formats)
const ARXIV_PATTERN = /\b(?:arxiv:?)?(\d{4}\.\d{4,5}(?:v\d+)?)\b/gi;
const ARXIV_OLD_PATTERN = /\b(?:arxiv:?)?((?:astro-ph|cond-mat|gr-qc|hep-ex|hep-lat|hep-ph|hep-th|math|math-ph|nlin|nucl-ex|nucl-th|physics|quant-ph|q-bio|q-fin|cs|stat)\/\d{7}(?:v\d+)?)\b/gi;

/**
 * Validate and calculate ISBN-10 checksum
 */
function validateIsbn10(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (digits.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(digits[i], 10);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i);
  }

  const checkChar = digits[9];
  const checkDigit = checkChar === 'X' ? 10 : parseInt(checkChar, 10);
  if (isNaN(checkDigit) && checkChar !== 'X') return false;

  sum += checkDigit;
  return sum % 11 === 0;
}

/**
 * Validate and calculate ISBN-13 checksum
 */
function validateIsbn13(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (digits.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(digits[i], 10);
    if (isNaN(digit)) return false;
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  return sum % 10 === 0;
}

/**
 * Normalize ISBN to ISBN-13 format
 */
function normalizeIsbn(isbn: string): string {
  const digits = isbn.replace(/[-\s]/g, '');

  if (digits.length === 13) {
    return digits;
  }

  if (digits.length === 10) {
    // Convert ISBN-10 to ISBN-13
    const base = '978' + digits.slice(0, 9);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return base + check;
  }

  return digits;
}

/**
 * Extract all identifiers from a URL or text
 */
export function extractIdentifiers(text: string): Identifier[] {
  const identifiers: Identifier[] = [];
  const seen = new Set<string>();

  // DOI
  const doiMatches = text.matchAll(DOI_PATTERN);
  for (const match of doiMatches) {
    const value = match[1];
    const normalized = value.toLowerCase();
    const key = `doi:${normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push({ type: 'doi', value, normalized });
    }
  }

  // ISBN
  const isbnMatches = text.matchAll(ISBN_PATTERN);
  for (const match of isbnMatches) {
    const value = match[1];
    const digits = value.replace(/[-\s]/g, '');

    if (digits.length === 10 && validateIsbn10(value)) {
      const normalized = normalizeIsbn(value);
      const key = `isbn:${normalized}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push({ type: 'isbn', value, normalized });
      }
    } else if (digits.length === 13 && validateIsbn13(value)) {
      const normalized = normalizeIsbn(value);
      const key = `isbn:${normalized}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push({ type: 'isbn', value, normalized });
      }
    }
  }

  // PMID
  const pmidMatches = text.matchAll(PMID_PATTERN);
  for (const match of pmidMatches) {
    const value = match[1];
    const key = `pmid:${value}`;
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push({ type: 'pmid', value, normalized: value });
    }
  }

  // PMCID
  const pmcidMatches = text.matchAll(PMCID_PATTERN);
  for (const match of pmcidMatches) {
    const value = match[1];
    const normalized = value.toUpperCase();
    const key = `pmcid:${normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push({ type: 'pmcid', value, normalized });
    }
  }

  // arXiv (new format)
  const arxivMatches = text.matchAll(ARXIV_PATTERN);
  for (const match of arxivMatches) {
    const value = match[1];
    const normalized = value.toLowerCase();
    const key = `arxiv:${normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push({ type: 'arxiv', value, normalized });
    }
  }

  // arXiv (old format)
  const arxivOldMatches = text.matchAll(ARXIV_OLD_PATTERN);
  for (const match of arxivOldMatches) {
    const value = match[1];
    const normalized = value.toLowerCase();
    const key = `arxiv:${normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push({ type: 'arxiv', value, normalized });
    }
  }

  return identifiers;
}
