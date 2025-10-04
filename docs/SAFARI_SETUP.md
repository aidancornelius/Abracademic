# Safari extension setup (macOS + iOS)

This guide explains how to create the Safari wrapper app for macOS and iOS from the built extension.

## Prerequisites

- Xcode 14.0 or later installed on macOS
- Apple Developer account (for distribution)
- Built Safari extension in `dist/safari`

## Step 1: Build the Safari extension

First, build the extension for Safari:

```bash
npm run build:safari
```

This creates the extension bundle in `dist/safari/`.

## Step 2: Convert to Safari Web Extension

Use Apple's converter tool to create the Xcode project:

```bash
xcrun safari-web-extension-packager dist/safari \
  --project-location ./safari-wrapper \
  --app-name Abracademic \
  --bundle-identifier com.cornelius-bell.Abracademic \
  --swift \
  --no-prompt \
  --macos-only=false
```

**Note:** The command is `safari-web-extension-packager` (not converter) in modern Xcode versions.

This creates:
- `safari-wrapper/Abracademic.xcodeproj` - Xcode project
- `safari-wrapper/Abracademic/` - macOS host app
- `safari-wrapper/Abracademic Extension/` - Extension target
- `safari-wrapper/Abracademic (iOS)/` - iOS host app (if `--macos-only=false`)
- `safari-wrapper/Abracademic Extension (iOS)/` - iOS extension target

## Step 3: Configure Xcode project

1. **Open the project:**
   ```bash
   open safari-wrapper/Abracademic.xcodeproj
   ```

2. **Remove copied resources:**
   - Select the "Abracademic Extension" target
   - Go to "Build Phases" → "Copy Bundle Resources"
   - Remove all files that were copied from `dist/safari`

3. **Add folder reference to dist/safari:**
   - In Xcode's project navigator, right-click on "Abracademic Extension" folder
   - Select "Add Files to 'Abracademic Extension'..."
   - Navigate to the `dist/safari` directory (in your repo root)
   - **Important:** Check "Create folder references" (blue folder, not yellow)
   - Click "Add"

4. **Add build script to rebuild extension:**
   - Select "Abracademic Extension" target
   - Go to "Build Phases"
   - Click "+" → "New Run Script Phase"
   - Drag it to be **before** "Copy Bundle Resources"
   - Add this script:

   ```bash
   set -e

   # Navigate to repo root (adjust path if needed)
   cd "$SRCROOT/../"

   # Install dependencies if needed
   if [ ! -d "node_modules" ]; then
     npm ci --prefer-offline
   fi

   # Build Safari extension
   npm run build:safari
   ```

5. **Repeat for iOS extension target** (if building for iOS):
   - Select "Abracademic Extension (iOS)" target
   - Follow the same steps as above

## Step 4: Configure the host app (optional)

The host app is minimal by default. You can customise it to:

1. **Add instructions:**
   - Edit `Abracademic/ContentView.swift` (macOS)
   - Add helpful text about enabling the extension
   - Add button to open Safari preferences:

   ```swift
   Button("Open Safari Preferences") {
       SFSafariApplication.showPreferencesForExtension(
           withIdentifier: "com.cornelius-bell.Abracademic.Extension"
       ) { error in
           // Handle error
       }
   }
   ```

2. **Add app icons:**
   - Add icons to `Abracademic/Assets.xcassets/AppIcon.appiconset`
   - Use the generated icons from `src/icons/`

## Step 5: Build and test

### macOS:
1. Select "Abracademic" scheme in Xcode
2. Click Run (⌘R)
3. The app will launch
4. Open Safari → Preferences → Extensions
5. Enable "Abracademic"
6. Test on a scholarly URL

### iOS/iPadOS:
1. Select "Abracademic (iOS)" scheme
2. Choose a simulator or connected device
3. Click Run (⌘R)
4. On the device: Settings → Safari → Extensions
5. Enable "Abracademic"
6. Test in Safari

## Step 6: Distribution

### macOS App Store:
1. Archive the app (Product → Archive)
2. Validate and submit via Xcode Organiser
3. Submit for review

### iOS App Store:
1. Archive the iOS app
2. Validate and submit
3. Can be the same app bundle (universal)

### Safari Extensions Gallery:
1. Submit extension listing at https://developer.apple.com/safari-extensions/
2. Apple will review and list it

## Troubleshooting

### Extension doesn't appear in Safari:
- Check that the bundle identifier matches in:
  - Xcode project settings
  - `Info.plist`
  - Safari preferences

### Build fails:
- Make sure `dist/safari` is a folder reference (blue, not yellow)
- Verify the run script is before "Copy Bundle Resources"
- Check that the script path to repo root is correct

### Changes not reflected:
- The run script rebuilds on every Xcode build
- If that's not working, run `npm run build:safari` manually
- Force clean build (Product → Clean Build Folder)

## Maintaining single source of truth

The key to this setup is that:
1. All extension code lives in `/src` (single source)
2. Build scripts create `/dist/safari` from that source
3. Xcode references `/dist/safari` as a folder (not copying it)
4. Run script rebuilds on each Xcode build

**Never edit files in `dist/safari` directly!** Always edit the source in `/src`.

## Additional resources

- [Safari Web Extensions documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [Converting a web extension](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [Browser Extensions API compatibility](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs)
