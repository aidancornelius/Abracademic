# Distribution guide

How to package and submit Abracademic to Chrome Web Store, Firefox Add-ons, and Safari App Store.

## Chrome Web Store

### 1. Build the extension

```bash
npm run build:chrome
```

### 2. Create a ZIP file

```bash
cd dist/chrome
zip -r ../../abracademic-chrome.zip .
cd ../..
```

Or use the GUI:
- Right-click `dist/chrome` in Finder
- Select "Compress"
- Rename to `abracademic-chrome.zip`

### 3. Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 developer registration fee (if first time)
3. Click "New Item"
4. Upload `abracademic-chrome.zip`
5. Fill in the listing details:
   - **Name:** Abracademic
   - **Summary:** Fast access to scholarly articles via institutional proxies and open access sources
   - **Description:** (detailed description of features)
   - **Category:** Productivity
   - **Language:** English
6. Upload screenshots (at least 1280×800 or 640×400)
7. Upload icon (128×128 - use `src/icons/icon-128.png`)
8. Set privacy policy (if collecting data) or select "No data collected"
9. Click "Submit for review"

**Review time:** Usually 1-3 days

### 4. Updates

To publish an update:
1. Update version in `src/manifests/manifest.base.json`
2. Rebuild: `npm run build:chrome`
3. Create new ZIP
4. Upload in the developer dashboard
5. Submit for review

---

## Firefox Add-ons (AMO)

### 1. Build the extension

```bash
npm run build:firefox
```

### 2. Create a ZIP file

```bash
cd dist/firefox
zip -r ../../abracademic-firefox.zip .
cd ../..
```

Or:
- Right-click `dist/firefox` in Finder
- Select "Compress"
- Rename to `abracademic-firefox.zip`

### 3. Upload to Firefox Add-ons

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Create an account (free)
3. Click "Submit a New Add-on"
4. Select "On this site" (listed on AMO)
5. Upload `abracademic-firefox.zip`
6. Mozilla will automatically validate the extension
7. Fill in the listing details:
   - **Name:** Abracademic
   - **Summary:** Fast access to scholarly articles via institutional proxies and open access
   - **Description:** (detailed description)
   - **Categories:** Productivity, Education
   - **Support email:** your@email.com
   - **Support website:** (optional)
8. Upload at least one screenshot (1200×900 recommended)
9. Upload icon (64×64 or larger - use `src/icons/icon-128.png`)
10. Set privacy policy
11. Submit for review

**Review time:** Usually 1-7 days (Mozilla does manual review)

### 4. Source code submission

**Important:** If your extension uses build tools (like ours does), Mozilla requires source code submission:

Create a source code package:
```bash
zip -r abracademic-source.zip \
  src/ \
  scripts/ \
  build.js \
  package.json \
  package-lock.json \
  tsconfig.json \
  README.md \
  README_BUILD.md \
  -x "*.DS_Store" \
  -x "node_modules/*"
```

When uploading:
1. Check "Yes" for "Does this add-on require any external build tools?"
2. Upload `abracademic-source.zip`
3. Add build instructions in the notes:
   ```
   Build instructions:
   1. npm install
   2. npm run build:firefox
   3. The built extension is in dist/firefox/
   ```

### 5. Updates

To publish an update:
1. Update version in `src/manifests/manifest.base.json`
2. Rebuild: `npm run build:firefox`
3. Create new ZIP (and source ZIP if code changed)
4. Upload new version in developer hub
5. Submit for review

---

## Safari App Store (macOS + iOS)

Safari distribution is different - you submit the wrapper **app** (not just the extension).

### 1. Build the extension

```bash
npm run build:safari
```

The Xcode build script will automatically rebuild the extension.

### 2. Prepare for distribution

In Xcode:

1. Update version and build number:
   - Select project in navigator
   - Select each target (Abracademic macOS, Abracademic iOS, both extensions)
   - Update **Version** (e.g., 1.0.0) and **Build** (e.g., 1)

2. Set up code signing:
   - **Signing & Capabilities** tab for each target
   - Select your **Team** (requires paid Apple Developer account - $99/year)
   - Ensure "Automatically manage signing" is checked

3. Update bundle identifiers if needed:
   - Should be `com.cornelius-bell.Abracademic` for the app
   - Should be `com.cornelius-bell.Abracademic.Extension` for the extension

### 3. Archive for macOS

1. In Xcode, select scheme: **Abracademic (macOS)**
2. Select destination: **Any Mac**
3. Menu: **Product → Archive**
4. Wait for archive to complete
5. The Organizer window will open automatically

### 4. Archive for iOS

1. In Xcode, select scheme: **Abracademic (iOS)**
2. Select destination: **Any iOS Device**
3. Menu: **Product → Archive**
4. Wait for archive to complete

### 5. Submit to App Store

In the Xcode Organizer:

1. Select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Click **Upload**
5. Follow the prompts:
   - Select your team
   - Review app signing
   - Upload to App Store Connect

6. Go to [App Store Connect](https://appstoreconnect.apple.com)
7. Create new app (if first time):
   - Click **My Apps** → **+** → **New App**
   - **Platform:** macOS / iOS (submit separately or as universal)
   - **Name:** Abracademic
   - **Primary Language:** English
   - **Bundle ID:** com.cornelius-bell.Abracademic
   - **SKU:** abracademic-001

8. Fill in app details:
   - **Category:** Productivity / Education
   - **Subtitle:** Scholarly article access made easy
   - **Description:** (full description)
   - **Keywords:** research, academic, scholarly, articles, papers, library, proxy, open access
   - **Support URL:** (your website or GitHub)
   - **Marketing URL:** (optional)
   - **Privacy Policy URL:** (required)

9. Add screenshots:
   - macOS: 1280×800 or larger
   - iOS: Device-specific sizes (use simulators or devices)
   - At least 2 screenshots per platform

10. Add app icon (1024×1024) - already in asset catalog

11. Set pricing: **Free** (or paid)

12. Select the uploaded build

13. Complete the **App Review Information**:
    - Contact info
    - Demo account (if needed)
    - Notes to reviewer (explain what the extension does)

14. Submit for review

**Review time:** Usually 1-5 days for Safari extensions

### 6. Safari Extensions Gallery

After App Store approval, optionally submit to the Safari Extensions Gallery:

1. Go to [Safari Extensions](https://developer.apple.com/safari-extensions/)
2. Submit your extension details
3. Apple will feature it in Safari's extension gallery

---

## Pre-submission checklist

Before submitting to any store:

### All platforms:
- [ ] Version number updated in `src/manifests/manifest.base.json`
- [ ] All features tested and working
- [ ] No console errors
- [ ] Icons look good at all sizes
- [ ] Extension tested on fresh install
- [ ] Privacy policy prepared (even if "no data collected")
- [ ] Screenshots prepared (show actual extension in use)
- [ ] Store listing description written
- [ ] Support email/website ready

### Chrome-specific:
- [ ] Tested in Chrome (not just local build)
- [ ] Permissions justified in description
- [ ] Screenshots are 1280×800 or 640×400

### Firefox-specific:
- [ ] Tested in Firefox
- [ ] Source code package ready (if using build tools)
- [ ] Build instructions clear
- [ ] No external dependencies (everything in package.json)

### Safari-specific:
- [ ] Tested on macOS Safari
- [ ] Tested on iOS Safari (if submitting iOS version)
- [ ] App Store screenshots prepared for all devices
- [ ] Privacy policy URL ready
- [ ] Apple Developer account active ($99/year)
- [ ] All 4 targets signed with same team

---

## Version numbering

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes (rare for extensions)
- **MINOR:** New features
- **PATCH:** Bug fixes

Examples:
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature (e.g., added Anna's Archive support)
- `2.0.0` - Major rewrite

Update version in **one place**: `src/manifests/manifest.base.json`

Then rebuild all targets before distribution.

---

## Quick reference

### Build and package for Chrome:
```bash
npm run build:chrome
cd dist/chrome && zip -r ../../abracademic-chrome.zip . && cd ../..
```

### Build and package for Firefox:
```bash
npm run build:firefox
cd dist/firefox && zip -r ../../abracademic-firefox.zip . && cd ../..

# If source code needed:
zip -r abracademic-source.zip src/ scripts/ build.js package*.json tsconfig.json README*.md -x "*.DS_Store"
```

### Build for Safari:
```bash
npm run build:safari
# Then archive in Xcode: Product → Archive
```

---

## Support and updates

After publishing:

1. **Monitor reviews** - Respond to user feedback
2. **Track issues** - Use GitHub Issues or similar
3. **Release updates** regularly for bug fixes
4. **Test updates** thoroughly before submitting
5. **Communicate changes** in release notes

Good luck with your extension launch! 🚀
