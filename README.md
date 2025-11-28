# Abracademic

A browser extension for accessing scholarly articles through institutional proxies and open access sources.

Available for Chrome, Firefox, and Safari (macOS and iOS).

## What it does

The extension processes URLs for academic articles. It extracts identifiers like DOIs, ISBNs, and PMIDs. It then routes the URL through your configured access method.

Supported access methods:
- **OpenAthens** - institutional single sign-on
- **EZProxy** - library proxy (hostname rewrite or login form)
- **LibKey** - full-text article finding
- **Unpaywall** - open access lookup via API
- **Google Scholar** - search by identifier
- **Anna's Archive** - shadow library search

The extension also unwraps shortened URLs and normalises publisher URLs before processing.

## Installation

Download from:
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/abracademic/)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/obemiipnpkloaopkdnifingonkncckdd)
- [TestFlight (iOS)](https://testflight.apple.com/join/G9bjF1hh)
- [GitHub (tags)](https://github.com/aidancornelius/Abracademic/releases)

Or build from source.

## Configuration

Open the extension settings. Enter your institution's details for your preferred access method.

For OpenAthens, enter your institution's domain (e.g. `unisa.edu.au`).

For EZProxy, paste any EZProxy URL from your library. The extension will detect the format.

For LibKey, paste a LibKey URL to extract your library ID.

## Usage

Click the extension icon on an article page. Select your access method from the dropdown. Click "Process current page".

Right-click any link and select "Access via Abracademic" to process that link directly.

## Building from source

Requirements: Node.js and npm.

```bash
npm install
```

Build for a specific browser:

```bash
npm run build:chrome    # outputs to dist/chrome/
npm run build:firefox   # outputs to dist/firefox/
npm run build:safari    # outputs to dist/safari/
```

Or build all:

```bash
npm run build:all
```

### Loading the extension

**Chrome**: Go to `chrome://extensions`, enable developer mode, click "Load unpacked", select `dist/chrome/`.

**Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select `dist/firefox/manifest.json`.

**Safari**: Open `safari-wrapper/Abracademic.xcodeproj` in Xcode. Build and run.

### Development

Watch mode rebuilds on file changes:

```bash
npm run watch:chrome
npm run watch:firefox
npm run watch:safari
```

### Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Project structure

```
src/
  background/     Service worker
  lib/            Core functionality
  popup/          Extension popup
  options/        Settings page
  adapters/       Browser compatibility
  manifests/      Browser-specific manifests
  icons/          Extension icons
safari-wrapper/   Xcode project for Safari
```

## Licence

MPL-2.0. See [LICENSE](LICENSE).
