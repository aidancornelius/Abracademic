# Abracademic

This is a browser extension that helps you access scholarly articles through your institution's proxy or open access repositories. It handles the fiddly bits of unwrapping DOI links, dealing with publisher URLs, and routing things through OpenAthens, EZProxy, or other access methods you might have configured.

Available for Chrome, Firefox, and Safari on macOS and iOS.

## Getting started as a user

### Installation

Download the extension for your browser:

- **Firefox**: Install the signed extension from the [releases page](https://github.com/aidancornelius/abracademic/releases)
- **Chrome**: Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/obemiipnpkloaopkdnifingonkncckdd)
- **Safari (macOS/iOS)**: Download from the [App Store](https://apps.apple.com)

Alternatively, you can build from source if you prefer (see below).

### Configuration

After installing, click the extension icon and go to settings. You'll need to configure at least one access method.

For OpenAthens, enter your institution's domain. If you're at the University of South Australia, for instance, that's `unisa.edu.au`. You can paste a full OpenAthens URL if you have one handy and the extension will extract the domain for you.

For EZProxy, paste any EZProxy URL from your library's website. The extension will work out whether your library uses the hostname rewrite style or the login form style, and it handles both `url` and `qurl` query parameters.

For LibKey, paste a LibKey URL from your library and the extension will extract your library ID.

The popup will only show the access methods you've actually configured, so you don't have to look at options that won't work for you.

### Using the extension

Click the extension icon while viewing an article page or DOI link. The extension will process the URL and open it through your selected access method.

You can also right-click any link and select "Access via Abracademic" from the context menu to process that specific link.

Use the dropdown in the popup to switch between available access methods if you have more than one configured.

## Getting started as a developer

### Prerequisites

You'll need Node.js and npm installed. If you don't have these, download Node.js from [nodejs.org](https://nodejs.org) which includes npm.

### Building the extension

Clone this repository and navigate to the directory in your terminal.

Install the required packages:

```bash
npm install
```

Build the extension for all browsers:

```bash
npm run build:all
```

This creates browser-specific builds in the `dist/` directory. You can also build for a specific browser:

```bash
npm run build:chrome    # outputs to dist/chrome/
npm run build:firefox   # outputs to dist/firefox/
npm run build:safari    # outputs to dist/safari/
```

### Loading your build

For Chrome, open `chrome://extensions`, enable developer mode, click "Load unpacked" and select the `dist/chrome/` directory.

For Firefox, open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on" and select the `manifest.json` file inside `dist/firefox/`.

For Safari on macOS or iOS, you need to create an Xcode wrapper project. The source includes a configured wrapper in `safari-wrapper/` that you can open in Xcode.

### Development workflow

You can run the build in watch mode so it rebuilds automatically when you change files:

```bash
npm run watch:chrome
npm run watch:firefox
npm run watch:safari
```

After making changes, reload the extension in your browser. In Chrome and Firefox, this is usually a reload button on the extensions page. For Safari, you'll need to rebuild and run from Xcode.

### Running tests

The test suite uses Vitest:

```bash
npm test              # run tests once
npm run test:watch    # watch mode, reruns on changes
npm run test:ui       # interactive UI
npm run test:coverage # generate coverage report
```

## What it does

The extension unwraps shortened URLs and resolver links (like doi.org, bit.ly), extracts academic identifiers (DOI, ISBN, PMID, PMCID, arXiv), and converts messy publisher URLs into canonical forms. It handles the peculiarities of Wiley, Springer, Taylor & Francis, Nature, and various other publishers.

It then routes the URL through your selected access method. This might be OpenAthens institutional access, an EZProxy proxy (either hostname rewrite or login form style), LibKey for full-text finding, Unpaywall for open access lookups, Google Scholar search, or Anna's Archive.

You can optionally enable automatic fallback if the primary method fails, URL verification before navigation, and CASA token detection.

## How it works

The URL processing happens in stages. First, it unwraps shortened URLs and follows redirects. Then it extracts academic identifiers from the URL. It canonicalises publisher URLs to a standard format. It re-extracts identifiers from the canonical URL, which handles cases like Nature articles where the DOI isn't in the original URL. Finally, it routes through your selected access method and optionally verifies the result is accessible.

Access methods work like this. OpenAthens uses `https://go.openathens.net/redirector/{institution}?url=...` format. EZProxy uses either `https://example-com.{proxy-domain}/path` for hostname rewrite or `https://{proxy-domain}/login?url=...` for login forms. LibKey uses `https://libkey.io/libraries/{id}/{doi}` or `/{isbn}` or `?url=...` depending on what identifiers are available. Unpaywall queries their API for open access PDFs or landing pages. Google Scholar searches by DOI, PMID, ISBN, or URL components. Anna's Archive creates direct links by DOI or ISBN, falling back to search if needed.

## Project structure

The source code lives in `src/`. The background service worker is in `background/service-worker.ts`. Core functionality is split across `lib/` with separate modules for URL unwrapping, identifier extraction, publisher canonicalisation, access method routing, the main processing pipeline, and configuration storage. The popup and options pages are in their respective directories. Browser compatibility is handled through adapters in `adapters/`. Manifest files are in `manifests/` with a base manifest and browser-specific additions for Chrome, Firefox, and Safari. Icons are in `icons/`.

The build system uses TypeScript for type safety, esbuild for bundling, and webextension-polyfill for cross-browser compatibility. Everything follows Manifest V3 requirements.

## Licence

MIT
