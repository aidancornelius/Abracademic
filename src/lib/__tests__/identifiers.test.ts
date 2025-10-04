import { describe, it, expect } from 'vitest';
import { extractIdentifiers } from '../identifiers';
import { journalUrls, bookUrls, identifierUrls } from './test-data';

describe('extractIdentifiers', () => {
  describe('DOI extraction', () => {
    it('should extract DOI from Wiley URL', () => {
      const identifiers = extractIdentifiers(journalUrls.wiley.doi);
      const doi = identifiers.find(id => id.type === 'doi');

      expect(doi).toBeDefined();
      expect(doi?.value).toBe(journalUrls.wiley.expectedDoi);
      expect(doi?.normalized).toBe(journalUrls.wiley.expectedDoi.toLowerCase());
    });

    it('should extract DOI from Springer URL', () => {
      const identifiers = extractIdentifiers(journalUrls.springer.article);
      const doi = identifiers.find(id => id.type === 'doi');

      expect(doi).toBeDefined();
      expect(doi?.value).toBe(journalUrls.springer.expectedDoi);
    });

    it('should extract DOI from Taylor & Francis URL', () => {
      const identifiers = extractIdentifiers(journalUrls.taylorFrancis.doi);
      const doi = identifiers.find(id => id.type === 'doi');

      expect(doi).toBeDefined();
      expect(doi?.value).toBe(journalUrls.taylorFrancis.expectedDoi);
    });

    it('should extract DOI from SAGE URL', () => {
      const identifiers = extractIdentifiers(journalUrls.sage.doi);
      const doi = identifiers.find(id => id.type === 'doi');

      expect(doi).toBeDefined();
      expect(doi?.value).toBe(journalUrls.sage.expectedDoi);
    });

    it('should extract DOI from Springer book chapter URL', () => {
      const identifiers = extractIdentifiers(bookUrls.springerBook.chapter);
      const doi = identifiers.find(id => id.type === 'doi');

      expect(doi).toBeDefined();
      expect(doi?.value).toBe(bookUrls.springerBook.expectedDoi);
    });

    it('should handle various DOI URL formats', () => {
      // Test first 3 which are DOI resolver URLs
      const doiResolvers = identifierUrls.doiVariations.slice(0, 3);
      doiResolvers.forEach(url => {
        const identifiers = extractIdentifiers(url);
        const doi = identifiers.find(id => id.type === 'doi');

        expect(doi).toBeDefined();
        expect(doi?.normalized).toBe('10.3102/0013189x211052550');
      });
    });

    it('should not duplicate DOIs', () => {
      const text = 'DOI: 10.1038/nature12345 and also doi.org/10.1038/nature12345';
      const identifiers = extractIdentifiers(text);
      const dois = identifiers.filter(id => id.type === 'doi');

      expect(dois).toHaveLength(1);
    });
  });

  describe('ISBN extraction', () => {
    it('should extract and normalize ISBN-10', () => {
      const text = 'ISBN 0306406152';
      const identifiers = extractIdentifiers(text);
      const isbn = identifiers.find(id => id.type === 'isbn');

      expect(isbn).toBeDefined();
      expect(isbn?.normalized).toHaveLength(13);
      expect(isbn?.normalized).toMatch(/^978/);
    });

    it('should extract ISBN-10 with hyphens', () => {
      const identifiers = extractIdentifiers('ISBN 0-306-40615-2');
      const isbn = identifiers.find(id => id.type === 'isbn');

      expect(isbn).toBeDefined();
      expect(isbn?.normalized).toHaveLength(13);
    });

    it('should extract ISBN without ISBN prefix', () => {
      const identifiers = extractIdentifiers('0306406152');
      const isbn = identifiers.find(id => id.type === 'isbn');

      expect(isbn).toBeDefined();
      expect(isbn?.normalized).toMatch(/^978/);
    });

    it('should extract ISBN with colon separator', () => {
      const text = 'ISBN:0306406152';
      const identifiers = extractIdentifiers(text);
      const isbn = identifiers.find(id => id.type === 'isbn');

      expect(isbn).toBeDefined();
      expect(isbn?.normalized).toHaveLength(13);
    });

    it('should reject invalid ISBNs', () => {
      const identifiers = extractIdentifiers('ISBN: 978-1-234-56789-0'); // Invalid checksum
      const isbn = identifiers.find(id => id.type === 'isbn');

      expect(isbn).toBeUndefined();
    });
  });

  describe('PMID extraction', () => {
    it('should extract PMID from PubMed URL', () => {
      const identifiers = extractIdentifiers(journalUrls.pubmed.article);
      const pmid = identifiers.find(id => id.type === 'pmid');

      expect(pmid).toBeDefined();
      expect(pmid?.value).toBe(journalUrls.pubmed.expectedPmid);
    });

    it('should handle various PMID formats', () => {
      identifierUrls.pmidVariations.forEach(text => {
        const identifiers = extractIdentifiers(text);
        const pmid = identifiers.find(id => id.type === 'pmid');

        expect(pmid).toBeDefined();
        expect(pmid?.normalized).toBe('36691386');
      });
    });
  });

  describe('PMCID extraction', () => {
    it('should extract PMCID from PMC URL', () => {
      const identifiers = extractIdentifiers(journalUrls.pubmed.pmc);
      const pmcid = identifiers.find(id => id.type === 'pmcid');

      expect(pmcid).toBeDefined();
      expect(pmcid?.normalized).toBe(journalUrls.pubmed.expectedPmcid);
    });

    it('should normalize PMCID to uppercase', () => {
      const identifiers = extractIdentifiers('pmc7848677');
      const pmcid = identifiers.find(id => id.type === 'pmcid');

      expect(pmcid).toBeDefined();
      expect(pmcid?.normalized).toBe('PMC7848677');
    });
  });

  describe('arXiv extraction', () => {
    it('should extract arXiv ID from URL', () => {
      const identifiers = extractIdentifiers(journalUrls.arxiv.abs);
      const arxiv = identifiers.find(id => id.type === 'arxiv');

      expect(arxiv).toBeDefined();
      expect(arxiv?.value).toBe(journalUrls.arxiv.expectedId);
    });

    it('should handle various arXiv formats', () => {
      identifierUrls.arxivVariations.forEach(text => {
        const identifiers = extractIdentifiers(text);
        const arxiv = identifiers.find(id => id.type === 'arxiv');

        expect(arxiv).toBeDefined();
      });
    });

    it('should extract old-format arXiv IDs', () => {
      const identifiers = extractIdentifiers('https://arxiv.org/abs/hep-th/0001001');
      const arxiv = identifiers.find(id => id.type === 'arxiv');

      expect(arxiv).toBeDefined();
      expect(arxiv?.normalized).toBe('hep-th/0001001');
    });
  });

  describe('Multiple identifiers', () => {
    it('should extract multiple different identifier types', () => {
      const text = 'PMID: 33526837 DOI: 10.1038/s41467-021-21148-9 PMC7848677';
      const identifiers = extractIdentifiers(text);

      expect(identifiers).toHaveLength(3);
      expect(identifiers.find(id => id.type === 'pmid')).toBeDefined();
      expect(identifiers.find(id => id.type === 'doi')).toBeDefined();
      expect(identifiers.find(id => id.type === 'pmcid')).toBeDefined();
    });

    it('should handle empty or invalid text', () => {
      expect(extractIdentifiers('')).toEqual([]);
      expect(extractIdentifiers('no identifiers here')).toEqual([]);
      expect(extractIdentifiers('http://example.com')).toEqual([]);
    });
  });
});
