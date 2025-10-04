# Direct distribution (outside app stores)

Guide for distributing Abracademic directly to users without going through official stores.

## Overview

**Use cases:**
- Beta testing
- Enterprise deployment
- Self-hosting
- Avoiding store review processes

**Trade-offs:**
- No automatic updates
- Users must trust your source
- May show security warnings
- No discoverability (users must find you)

---

## Firefox (.xpi file)

### File created:
`distribution/firefox/abracademic-firefox-v1.0.0-unsigned.xpi`

### How users install:

**Method 1: Direct install (temporary)**
1. Download the .xpi file
2. Open Firefox
3. Go to `about:addons`
4. Click the gear icon → "Install Add-on From File..."
5. Select the .xpi file

**Warning:** Firefox will show "This add-on is not signed" and it will only work until Firefox restarts.

**Method 2: Developer Edition (persistent)**
1. Download Firefox Developer Edition
2. Go to `about:config`
3. Set `xpinstall.signatures.required` to `false`
4. Install .xpi as above
5. Extension will persist across restarts

**Recommended:** For production, submit to Firefox Add-ons (AMO) to get signing.

### Distribution:
- Host the .xpi file on your website
- Users can download and install
- No automatic updates (manual download required)

---

## Chrome (Developer Mode)

Chrome removed support for unsigned .crx files. Options:

### Method 1: Load Unpacked (most common)

**What users do:**
1. Download `abracademic-chrome-v1.0.0.zip`
2. Unzip to a permanent location (e.g., `~/Extensions/Abracademic/`)
3. Open Chrome → `chrome://extensions`
4. Enable "Developer mode" (toggle top-right)
5. Click "Load unpacked"
6. Select the unzipped folder

**Limitations:**
- Shows "Developer mode" warning in Chrome
- Extension may be disabled on Chrome restart
- Users must keep the folder in place

### Method 2: Enterprise Policy (for organizations)

If you have a Google Workspace account:
1. Create a signed .crx with a private key
2. Deploy via enterprise policy
3. No warnings for managed users

See: https://developer.chrome.com/docs/extensions/mv3/external_extensions/

**Recommended:** For production, use Chrome Web Store (no warnings, auto-updates).

### Distribution:
- Provide the ZIP file and installation instructions
- Consider a simple install script

---

## Safari (macOS App)

Safari extensions **must** be packaged as macOS applications.

### Option 1: Signed App (Developer ID)

**Requirements:**
- Apple Developer account ($99/year)
- Code signing certificate

**Steps:**
1. Open Xcode project
2. Product → Archive
3. Organizer → Distribute App → Developer ID
4. Export signed app
5. Create DMG:
   ```bash
   hdiutil create -volname "Abracademic" \
     -srcfolder Abracademic.app \
     -ov -format UDZO \
     Abracademic-v1.0.0.dmg
   ```

**Benefits:**
- No warnings
- Works on any Mac
- Can be notarized for extra trust

### Option 2: Unsigned App (Free)

**Steps:**
1. Open Xcode project
2. Product → Build (⌘B)
3. Product → Show Build Folder in Finder
4. Copy `Products/Debug/Abracademic.app`
5. Create DMG (same as above)

**Warnings:**
- "App is from unidentified developer"
- Users must right-click → Open (first time)
- Extension works but requires manual trust

### Distribution:
- Host the DMG file
- Provide installation instructions
- Consider a landing page with screenshots

---

## Recommended distribution strategy

### For Beta Testing:
- **Firefox:** Use unsigned .xpi with Developer Edition
- **Chrome:** Use ZIP with "Load unpacked" instructions
- **Safari:** Use unsigned app DMG

### For Production:
- **Firefox:** Submit to AMO (gets signed, trusted)
- **Chrome:** Submit to Chrome Web Store (no warnings)
- **Safari:** Either:
  - Mac App Store (best UX, auto-updates)
  - Developer ID signed DMG (good UX, self-hosted)

### Self-hosting checklist:
- [ ] Host files on HTTPS
- [ ] Provide clear installation instructions
- [ ] Screenshots/video showing install process
- [ ] Support page for common issues
- [ ] Version history/changelog
- [ ] Update notification system (since no auto-updates)

---

## Current distribution files

```
distribution/
├── chrome/
│   ├── abracademic-chrome-v1.0.0.zip
│   └── SIDELOAD_INSTRUCTIONS.txt
├── firefox/
│   ├── abracademic-firefox-v1.0.0-unsigned.xpi ← For direct distribution
│   ├── abracademic-firefox-v1.0.0.zip           ← For AMO submission
│   └── abracademic-source-v1.0.0.zip            ← For AMO submission
└── safari/
    ├── DIRECT_DISTRIBUTION.txt ← Instructions for creating DMG
    └── README.txt              ← App Store submission
```

---

## Legal considerations

When distributing directly:
- Include a clear license (MIT in your case)
- Privacy policy (even if "no data collected")
- Terms of use (optional but recommended)
- Contact information for support
- Disclaimer about unofficial distribution

---

## Updates

Without app stores, you need a manual update process:

1. **Version checking:**
   - Add a version check in your extension
   - Ping your server for latest version
   - Show notification if update available

2. **Update delivery:**
   - Host new files on your website
   - Provide update instructions
   - Consider an email list for announcements

3. **For Safari:**
   - Apps can include Sparkle framework for auto-updates
   - Requires code signing
   - See: https://sparkle-project.org/

---

## Security best practices

When self-hosting:
- Use HTTPS for all downloads
- Provide SHA-256 checksums for verification
- Sign files when possible
- Keep downloads on your own domain (not third-party)
- Be transparent about what the extension does
