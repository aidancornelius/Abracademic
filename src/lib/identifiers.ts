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
 *
 * ISBN-10 uses a weighted checksum where each digit is multiplied
 * by its position (10 down to 1) and the sum must be divisible by 11.
 * The check digit can be 'X' representing 10.
 *
 * @param isbn - ISBN-10 string (may contain hyphens/spaces)
 * @returns True if checksum is valid
 */
function validateIsbn10(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (digits.length !== 10) return false;

  // Calculate weighted sum for first 9 digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(digits[i], 10);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i); // Weight decreases from 10 to 2
  }

  // Check digit can be 0-9 or X (representing 10)
  const checkChar = digits[9];
  const checkDigit = checkChar === 'X' ? 10 : parseInt(checkChar, 10);
  if (isNaN(checkDigit) && checkChar !== 'X') return false;

  sum += checkDigit;
  return sum % 11 === 0;
}

/**
 * Validate and calculate ISBN-13 checksum
 *
 * ISBN-13 uses alternating weights of 1 and 3, with the sum
 * needing to be divisible by 10.
 *
 * @param isbn - ISBN-13 string (may contain hyphens/spaces)
 * @returns True if checksum is valid
 */
function validateIsbn13(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (digits.length !== 13) return false;

  // Calculate weighted sum with alternating 1 and 3 weights
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(digits[i], 10);
    if (isNaN(digit)) return false;
    sum += digit * (i % 2 === 0 ? 1 : 3); // Odd positions get weight 3
  }

  return sum % 10 === 0;
}

/**
 * Normalize ISBN to ISBN-13 format
 *
 * All ISBN-10s can be converted to ISBN-13 by prepending '978'
 * and recalculating the check digit. This allows for consistent
 * storage and comparison.
 *
 * @param isbn - ISBN string in any format
 * @returns ISBN-13 string
 */
function normalizeIsbn(isbn: string): string {
  const digits = isbn.replace(/[-\s]/g, '');

  if (digits.length === 13) {
    return digits;
  }

  if (digits.length === 10) {
    // Convert ISBN-10 to ISBN-13 by prepending '978' (Bookland prefix)
    const base = '978' + digits.slice(0, 9);

    // Recalculate ISBN-13 check digit
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
 *
 * Scans text for academic identifiers (DOI, ISBN, PMID, PMC, arXiv)
 * and returns them in a normalized format. Deduplicates results
 * based on normalized values.
 *
 * @param text - Text or URL to scan for identifiers
 * @returns Array of identified and validated identifiers
 */
export function extractIdentifiers(text: string): Identifier[] {
  const identifiers: Identifier[] = [];
  // Track seen identifiers to prevent duplicates
  const seen = new Set<string>();

  // DOI - Digital Object Identifier
  // DOIs are case-insensitive, so normalize to lowercase
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

  // ISBN - International Standard Book Number
  // Validate checksum before accepting, normalize to ISBN-13
  const isbnMatches = text.matchAll(ISBN_PATTERN);
  for (const match of isbnMatches) {
    const value = match[1];
    const digits = value.replace(/[-\s]/g, '');

    // Validate ISBN-10
    if (digits.length === 10 && validateIsbn10(value)) {
      const normalized = normalizeIsbn(value); // Convert to ISBN-13
      const key = `isbn:${normalized}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push({ type: 'isbn', value, normalized });
      }
    }
    // Validate ISBN-13
    else if (digits.length === 13 && validateIsbn13(value)) {
      const normalized = normalizeIsbn(value);
      const key = `isbn:${normalized}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push({ type: 'isbn', value, normalized });
      }
    }
  }

  // PMID - PubMed ID
  const pmidMatches = text.matchAll(PMID_PATTERN);
  for (const match of pmidMatches) {
    const value = match[1];
    const key = `pmid:${value}`;
    if (!seen.has(key)) {
      seen.add(key);
      identifiers.push({ type: 'pmid', value, normalized: value });
    }
  }

  // PMCID - PubMed Central ID
  // Normalize to uppercase (PMC12345)
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

  // arXiv (new format: YYMM.NNNNN)
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

  // arXiv (old format: category/YYMMNNN)
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
