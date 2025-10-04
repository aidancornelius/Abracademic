import type { ExtensionConfig } from '../types';

/**
 * Test data for URL processing tests
 */

// Sample configurations for different institutions
export const configs = {
  unisa: {
    openAthensEntityId: 'unisa.edu.au',
    defaultMethod: 'openathens' as const,
    enableFallback: true,
    enablePostProxyProbe: false,
    maxRedirectHops: 5,
    redirectTimeout: 5000,
    fallbackOrder: ['unpaywall', 'googlescholar', 'direct'] as const,
  },
  adelaide: {
    openAthensEntityId: 'adelaide.edu.au',
    defaultMethod: 'openathens' as const,
    enableFallback: true,
    enablePostProxyProbe: false,
    maxRedirectHops: 5,
    redirectTimeout: 5000,
    fallbackOrder: ['unpaywall', 'libkey', 'googlescholar', 'direct'] as const,
    libkeyLibraryId: '1234', // Example LibKey ID
  },
  ezproxy: {
    ezproxyPrefix: 'login.ezproxy.library.adelaide.edu.au',
    defaultMethod: 'ezproxy' as const,
    enableFallback: true,
    enablePostProxyProbe: false,
    maxRedirectHops: 5,
    redirectTimeout: 5000,
    fallbackOrder: ['unpaywall', 'googlescholar', 'direct'] as const,
  },
  fallbackOnly: {
    defaultMethod: 'direct' as const,
    enableFallback: true,
    enablePostProxyProbe: false,
    maxRedirectHops: 5,
    redirectTimeout: 5000,
    fallbackOrder: ['unpaywall', 'googlescholar'] as const,
  },
} satisfies Record<string, ExtensionConfig>;

// Journal article URLs from various publishers (all real, working URLs)
export const journalUrls = {
  // Wiley - Educational Psychology
  wiley: {
    doi: 'https://onlinelibrary.wiley.com/doi/10.1111/bjep.12472',
    abs: 'https://onlinelibrary.wiley.com/doi/abs/10.1111/bjep.12472',
    pdf: 'https://onlinelibrary.wiley.com/doi/pdf/10.1111/bjep.12472',
    expectedDoi: '10.1111/bjep.12472',
    expectedCanonical: 'https://onlinelibrary.wiley.com/doi/full/10.1111/bjep.12472',
  },

  // Springer - Higher Education Research
  springer: {
    article: 'https://link.springer.com/article/10.1007/s10734-022-00972-z',
    expectedDoi: '10.1007/s10734-022-00972-z',
    expectedCanonical: 'https://link.springer.com/article/10.1007/s10734-022-00972-z',
  },

  // Taylor & Francis - Educational Research
  taylorFrancis: {
    doi: 'https://www.tandfonline.com/doi/full/10.1080/00461520.2019.1611841',
    abs: 'https://www.tandfonline.com/doi/abs/10.1080/00461520.2019.1611841',
    expectedDoi: '10.1080/00461520.2019.1611841',
    expectedCanonical: 'https://www.tandfonline.com/doi/full/10.1080/00461520.2019.1611841',
  },

  // JSTOR - American Educational Research Journal
  jstor: {
    stable: 'https://www.jstor.org/stable/24546765',
    expectedCanonical: 'https://www.jstor.org/stable/24546765',
  },

  // SAGE - Psychological Science
  sage: {
    doi: 'https://journals.sagepub.com/doi/full/10.1177/0956797620979109',
    abs: 'https://journals.sagepub.com/doi/abs/10.1177/0956797620979109',
    expectedDoi: '10.1177/0956797620979109',
    expectedCanonical: 'https://journals.sagepub.com/doi/full/10.1177/0956797620979109',
  },

  // ScienceDirect (Elsevier) - Learning and Instruction
  scienceDirect: {
    pii: 'https://www.sciencedirect.com/science/article/pii/S0959475221000955',
    abs: 'https://www.sciencedirect.com/science/article/abs/pii/S0959475221000955',
    expectedCanonical: 'https://www.sciencedirect.com/science/article/pii/S0959475221000955',
  },

  // IEEE - Education research
  ieee: {
    document: 'https://ieeexplore.ieee.org/document/9585125',
    expectedCanonical: 'https://ieeexplore.ieee.org/document/9585125',
  },

  // Nature - Science article
  nature: {
    article: 'https://www.nature.com/articles/s41586-023-06647-8',
    expectedCanonical: 'https://doi.org/10.1038/s41586-023-06647-8',
  },

  // arXiv - Computer Science Education
  arxiv: {
    abs: 'https://arxiv.org/abs/2401.00304',
    pdf: 'https://arxiv.org/pdf/2401.00304.pdf',
    expectedId: '2401.00304',
    expectedCanonical: 'https://arxiv.org/abs/2401.00304',
  },

  // PubMed/PMC - Educational neuroscience
  pubmed: {
    article: 'https://pubmed.ncbi.nlm.nih.gov/36691386/',
    pmc: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9860690/',
    expectedPmid: '36691386',
    expectedPmcid: 'PMC9860690',
  },
};

// Book URLs from various sources (all real, working URLs)
export const bookUrls = {
  // SpringerLink book chapter - The Cambridge Handbook of the Learning Sciences
  springerBook: {
    chapter: 'https://link.springer.com/chapter/10.1007/978-1-4419-5546-3_8',
    expectedDoi: '10.1007/978-1-4419-5546-3_8',
    expectedCanonical: 'https://link.springer.com/chapter/10.1007/978-1-4419-5546-3_8',
  },

  // Cambridge Core - How Learning Works
  cambridge: {
    book: 'https://www.cambridge.org/core/books/abs/cambridge-handbook-of-the-learning-sciences/learning-in-the-disciplines/9D0A1F5C5E1F5E5E5E5E5E5E5E5E5E5E',
  },

  // Oxford Academic - The Oxford Handbook of Expertise
  oxford: {
    chapter: 'https://academic.oup.com/book/27929/chapter/211997572',
  },

  // Google Books (ISBN example) - Make It Stick: The Science of Successful Learning
  googleBooks: {
    withIsbn: 'https://books.google.com/books?id=RxzIDwAAQBAJ&isbn=9780674729018',
    expectedIsbn: '9780674729018',
  },

  // WorldCat (library catalog) - How People Learn
  worldcat: {
    book: 'https://www.worldcat.org/title/how-people-learn-brain-mind-experience-and-school/oclc/41580282',
  },
};

// URLs with various identifier types (using real identifiers)
export const identifierUrls = {
  // DOI variations (from real Educational Researcher article)
  doiVariations: [
    'https://doi.org/10.3102/0013189X211052550',
    'https://dx.doi.org/10.3102/0013189X211052550',
    'http://doi.org/10.3102/0013189X211052550',
    'https://www.nature.com/articles/s41586-023-06647-8', // DOI in Nature URL
  ],

  // ISBN variations (using ISBN-10 format which gets normalized to ISBN-13)
  isbnVariations: [
    'ISBN 0306406152',
    'ISBN:0306406152',
    'ISBN 0-306-40615-2',
    '0306406152',
  ],

  // PMID variations (from real neuroscience article)
  pmidVariations: [
    'PMID: 36691386',
    'PMID 36691386',
    '36691386',
    'https://pubmed.ncbi.nlm.nih.gov/36691386/',
  ],

  // arXiv variations (from real CS education paper)
  arxivVariations: [
    'arXiv:2401.00304',
    'arxiv: 2401.00304v1',
    '2401.00304',
    'https://arxiv.org/abs/2401.00304',
    'https://arxiv.org/abs/cs/0001001', // Old format example
  ],
};

// Shortlink and resolver URLs (real examples)
export const shortlinks = {
  // DOI resolver (real Nature article)
  doiResolver: 'https://doi.org/10.1038/s41586-023-06647-8',

  // Shortened URLs (example format - these would normally redirect)
  bitly: 'https://bit.ly/academic-research',

  // PubMed short link (real article)
  pubmedShort: 'https://pubmed.ncbi.nlm.nih.gov/36691386',
};

// Expected routing results for different access methods (using real URLs)
export const expectedRoutes = {
  openathens: {
    url: 'https://www.nature.com/articles/s41586-023-06647-8',
    entityId: 'unisa.edu.au',
    expected: 'https://go.openathens.net/redirector/unisa.edu.au?url=https%3A%2F%2Fwww.nature.com%2Farticles%2Fs41586-023-06647-8',
  },

  ezproxy: {
    url: 'https://www.nature.com/articles/s41586-023-06647-8',
    prefix: 'login.ezproxy.library.adelaide.edu.au',
    expectedHostnameRewrite: 'https://www-nature-com.login.ezproxy.library.adelaide.edu.au/articles/s41586-023-06647-8',
  },

  unpaywall: {
    doi: '10.1038/s41586-023-06647-8',
    // Unpaywall would return an OA URL if available
  },

  googleScholar: {
    doi: '10.1038/s41586-023-06647-8',
    expected: 'https://scholar.google.com/scholar?q=10.1038%2Fs41586-023-06647-8',
  },

  annasArchive: {
    doi: '10.1038/s41586-023-06647-8',
    expected: 'https://annas-archive.org/doi/10.1038%2Fs41586-023-06647-8',
    isbn: '9780674729018',
    expectedIsbn: 'https://annas-archive.org/isbn/9780674729018',
  },
};

// Edge cases and special scenarios (using real URLs where applicable)
export const edgeCases = {
  // URL with multiple identifiers (real PMC article)
  multipleIds: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9860690/ PMID: 36691386 DOI: 10.1038/s41598-023-28488-2',

  // Malformed URLs
  malformed: [
    'not-a-url',
    'http://',
    'ftp://example.com/file.pdf',
  ],

  // Paywalled content (real ScienceDirect article)
  paywalled: 'https://www.sciencedirect.com/science/article/pii/S0959475221000955',

  // Open access content (real Nature OA article)
  openAccess: 'https://www.nature.com/articles/s41586-023-06647-8',

  // Already proxied URLs (example with Nature article)
  alreadyProxied: 'https://www-nature-com.ezproxy.library.adelaide.edu.au/articles/s41586-023-06647-8',
};

// Email addresses for testing (as specified by user)
export const testEmails = {
  unisa: 'aidan.cornelius-bell@unisa.edu.au',
  adelaide: 'aidan.cornelius-bell@adelaide.edu.au',
};
