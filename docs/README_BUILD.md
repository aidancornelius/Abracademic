# Multi-browser build system

Abracademic is built from a single codebase and deployed to Chrome, Firefox, and Safari (macOS + iOS).

## Quick start

Build for all browsers:

```bash
npm run build:all
```

Build for specific browser:

```bash
npm run build:chrome    # → dist/chrome/
npm run build:firefox   # → dist/firefox/
npm run build:safari    # → dist/safari/
```

Development mode (watch):

```bash
npm run watch:chrome
npm run watch:firefox
npm run watch:safari
```

## Architecture

### Single source of truth

All extension code lives in `/src`:

```
/src
  /background       - Service worker
  /lib              - Core logic (unwrap, identify, access)
  /popup            - Popup UI
  /options          - Options UI
  /adapters         - Browser API adapters
  /manifests        - Manifest base + patches
  /icons            - Extension icons (all sizes)
```

### Build process

1. **TypeScript → JavaScript**: `build.js` compiles TS and bundles with esbuild
2. **Copy assets**: Icons, HTML files copied to `dist/{target}/`
3. **Generate manifest**: `scripts/build-manifest.mjs` merges base + target patch

### Manifest system

- `manifests/manifest.base.json` - Common fields (MV3)
- `manifests/manifest.chrome.jsonc` - Chrome-specific additions
- `manifests/manifest.firefox.jsonc` - Firefox-specific (gecko ID, scripts)
- `manifests/manifest.safari.jsonc` - Safari-specific additions

The build script merges base + patch → `dist/{target}/manifest.json`

### Browser API adapter

All code uses the adapter for browser APIs:

```ts
// ✅ Do this
import browser from '../adapters/browser';

// ❌ Don't do this
import browser from 'webextension-polyfill';
```

The adapter provides:
- Unified `browser.*` API via `webextension-polyfill`
- Target detection: `TARGET`, `isSafari`, `isChrome`, `isFirefox`
- Storage helper: `storage` (uses `local` for Safari compatibility)

### Target flag

The build system injects `__TARGET__` at compile time:

```ts
// In your code:
import { TARGET, isSafari } from '../adapters/runtime';

if (isSafari) {
  // Safari-specific behaviour
}
```

## Loading the extension

### Chrome

1. Build: `npm run build:chrome`
2. Open: `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select: `dist/chrome/`

### Firefox

1. Build: `npm run build:firefox`
2. Open: `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select: `dist/firefox/manifest.json`

Or use web-ext:

```bash
npm run build:firefox
npx web-ext run --source-dir dist/firefox
```

### Safari (macOS + iOS)

Safari requires an Xcode wrapper. See [SAFARI_SETUP.md](./SAFARI_SETUP.md) for detailed instructions.

Quick version:
1. Build: `npm run build:safari`
2. Convert: `xcrun safari-web-extension-packager dist/safari --project-location safari-wrapper --app-name Abracademic --bundle-identifier com.cornelius-bell.Abracademic --swift --no-prompt`
3. Open: `safari-wrapper/Abracademic/Abracademic.xcodeproj`
4. Configure folder reference + build script (see XCODE_CONFIGURATION.md)
5. Run in Xcode

## Cross-browser compatibility

### Storage

Always use the storage adapter:

```ts
import { storage } from '../adapters/runtime';

// ✅ Works on all browsers
await storage.get('config');
await storage.set({ config: value });
```

Safari has limited `storage.sync` support, so we use `storage.local` everywhere.

### Service worker

All browsers support MV3 service workers, but:

- **Firefox** needs both `service_worker` and `scripts` fields
- **Safari** is stricter about SW lifecycle (keep operations short)

The manifest patches handle this automatically.

### Permissions

All use the same permissions:
- `storage` - Extension config
- `activeTab` - Access current tab
- `contextMenus` - Right-click menu
- `<all_urls>` - Proxy and fetch scholarly URLs

## Distribution

### Chrome Web Store

1. Build production: `npm run build:chrome`
2. Zip: `cd dist/chrome && zip -r ../../chrome.zip .`
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

### Firefox Add-ons

1. Build production: `npm run build:firefox`
2. Zip: `cd dist/firefox && zip -r ../../firefox.zip .`
3. Upload to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)

### Safari App Store

See [SAFARI_SETUP.md](./SAFARI_SETUP.md) for the full Xcode setup and distribution process.

## Icon sizes

Extension includes icons for all platforms:

- 16×16, 32×32, 48×48, 96×96 - Chrome, Firefox
- 128×128, 256×256, 512×512 - Safari App Store

Generate placeholder icons:

```bash
node generate-icons.js
```

**For production**: Replace `src/icons/icon-*.png` with actual artwork, then rebuild.

## Troubleshooting

### "Module not found" errors

Check that imports use the adapter:
```ts
import browser from '../adapters/browser';  // ✅
```

### Extension doesn't load

1. Check manifest is generated: `dist/{target}/manifest.json`
2. Check icons are copied: `dist/{target}/icons/`
3. Check all JS files exist: `dist/{target}/background/`, etc.

### Storage not working

Make sure you're using the storage adapter:
```ts
import { storage } from '../adapters/runtime';
```

Not the direct polyfill:
```ts
import browser from 'webextension-polyfill'; // ❌
await browser.storage.local.get(...);        // ❌
```

### Manifest differences

Compare generated manifests:
```bash
diff dist/chrome/manifest.json dist/firefox/manifest.json
```

Only browser-specific fields should differ (like `browser_specific_settings`).

## File sizes

Built bundles (minified):
- `background/service-worker.js` ~21 KB
- `popup/popup.js` ~12 KB
- `options/options.js` ~13 KB

Total extension size: ~50 KB (code) + icons

## Development workflow

1. **Make changes** in `/src`
2. **Rebuild** specific target: `npm run build:firefox`
3. **Reload** extension in browser
   - Chrome: Click reload on extensions page
   - Firefox: Click reload in about:debugging
   - Safari: Run again from Xcode
4. **Test** changes

For active development, use watch mode:
```bash
npm run watch:firefox
```

Then manually reload in browser when files change.

## Production checklist

Before releasing:

- [ ] Replace placeholder icons with actual artwork
- [ ] Update version in `src/manifests/manifest.base.json`
- [ ] Test on all three browsers
- [ ] Test all access methods (OpenAthens, EZProxy, LibKey, etc.)
- [ ] Test fallback chain
- [ ] Build production: `npm run build:all`
- [ ] Create zips for Chrome/Firefox
- [ ] Archive Safari app in Xcode
- [ ] Update store listings with new version

## Learn more

- [WebExtensions API docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/)
- [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
