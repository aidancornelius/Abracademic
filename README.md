# Abracademic

A browser extension for accessing scholarly articles through institutional proxies and open access repositories.

## Quick start

Build the extension:

```bash
npm install
npm run build
```

Load in Firefox/Zen:
- Navigate to `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on"
- Select `dist/manifest.json`

For development with auto-rebuild:

```bash
npm run watch
```

## Features

URL processing:
- Unwraps shortened URLs and resolvers (doi.org, bit.ly, etc.)
- Extracts identifiers (DOI, ISBN, PMID, PMCID, arXiv)
- Canonicalises publisher URLs (Wiley, Springer, Taylor & Francis, Nature, etc.)

Access methods:
- OpenAthens institutional access
- EZProxy proxies (hostname rewrite and login form methods)
- LibKey full-text finding
- Unpaywall open access lookup
- Google Scholar search
- Anna's Archive

Optional features:
- Automatic fallback if primary method fails
- URL verification before navigation
- CASA token detection

## Configuration

After installation, open the extension settings to configure your institution:

OpenAthens: Enter your institution's domain (e.g., `unisa.edu.au`). The extension extracts the domain automatically if you paste a full URL.

EZProxy: Paste any EZProxy URL from your library. The extension detects both hostname rewrite and login form methods, and handles both `url` and `qurl` query parameters.

LibKey: Paste any LibKey URL from your library. The extension extracts the library ID automatically.

The extension hides unconfigured access methods from the popup, showing only what you can use.

## Usage

Click the extension icon to process the current page through your selected access method.

Right-click any link and select "Access via Abracademic" to process that specific URL.

Use the popup dropdown to switch between available access methods.

## Architecture

The extension processes URLs in this order:
1. Unwrap shortened URLs and follow redirects
2. Extract academic identifiers from the URL
3. Canonicalise publisher URLs to standard format
4. Re-extract identifiers from canonical URL (handles cases like Nature articles)
5. Route through selected access method
6. Optionally verify the result is accessible

Access method routing:
- OpenAthens: `https://go.openathens.net/redirector/{institution}?url=...`
- EZProxy: Either `https://example-com.{proxy-domain}/path` or `https://{proxy-domain}/login?url=...`
- LibKey: `https://libkey.io/libraries/{id}/{doi}` or `/{isbn}` or `?url=...`
- Unpaywall: Queries API for open access PDF or landing page
- Google Scholar: Searches by DOI, PMID, ISBN, or URL components
- Anna's Archive: Direct links by DOI/ISBN or search fallback

## Development

File structure:

```
src/
├── background/
│   └── service-worker.ts    # MV3 background worker
├── lib/
│   ├── types.ts            # Type definitions
│   ├── unwrap.ts           # URL unwrapping
│   ├── identifiers.ts      # Identifier extraction
│   ├── publishers.ts       # Publisher canonicalisation
│   ├── access.ts           # Access method routing
│   ├── processor.ts        # Main pipeline
│   └── storage.ts          # Config storage
├── popup/
│   ├── popup.html
│   └── popup.ts
├── options/
│   ├── options.html
│   └── options.ts
└── manifest.json
```

Technologies:
- TypeScript for type safety
- esbuild for bundling
- Manifest V3
- Vitest for testing

Run tests:

```bash
npm test
```

## Licence

MIT
