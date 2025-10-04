# Xcode project configuration steps

The Xcode project has been created at `safari-wrapper/Abracademic/Abracademic.xcodeproj` and should now be open in Xcode.

## Overview

The converter copied extension files into the Xcode project, but we want to **reference** the `dist/safari` folder instead so our build script can rebuild it automatically.

## Step 1: Remove copied extension resources

The converter copied extension files into `Shared (Extension)`. We need to remove these and reference the `dist/safari` folder instead.

### For macOS extension target:

1. In Xcode's project navigator (left sidebar), find **"macOS (Extension)"** folder
2. You should see extension files like `manifest.json`, `popup.html`, etc.
3. Select all these extension files (not `Info.plist` or `SafariWebExtensionHandler.swift`)
4. Right-click → **Delete**
5. Choose **"Move to Trash"** (we have the originals in `dist/safari`)

### For iOS extension target:

1. Find **"iOS (Extension)"** folder
2. Select extension files (not `Info.plist`)
3. Right-click → **Delete**
4. Choose **"Move to Trash"**

Alternatively, you can do this in the **Build Phases**:

1. Select **"Abracademic Extension (macOS)"** target (in the project navigator, click the blue project icon at top)
2. Go to **"Build Phases"** tab
3. Expand **"Copy Bundle Resources"**
4. Select all the extension files (manifest.json, popup/, options/, etc.)
5. Click the **"-"** button to remove them
6. Repeat for **"Abracademic Extension (iOS)"** target

## Step 2: Add folder reference to dist/safari

Now we'll add a reference to our actual extension files that get rebuilt by the build script.

### For macOS extension:

1. In the project navigator, right-click on **"macOS (Extension)"** folder
2. Select **"Add Files to 'macOS (Extension)'..."**
3. Navigate to your repo root: `/Users/acb/Code/Abracademic`
4. Select the **`dist/safari`** folder
5. **IMPORTANT**: In the dialog, check these options:
   - ✅ **"Create folder references"** (NOT "Create groups")
   - ✅ Add to target: **"Abracademic Extension (macOS)"**
   - The folder should appear **blue** in Xcode (folder reference), not yellow (group)
6. Click **"Add"**

### For iOS extension:

1. Right-click on **"iOS (Extension)"** folder
2. **"Add Files to 'iOS (Extension)'..."**
3. Select the same **`dist/safari`** folder
4. Check:
   - ✅ **"Create folder references"** (blue folder)
   - ✅ Add to target: **"Abracademic Extension (iOS)"**
5. Click **"Add"**

**Verify**: The `dist/safari` folder should now appear in both extension targets with a **blue folder icon** (not yellow).

## Step 3: Add build script to rebuild extension

This script will run `npm run build:safari` before each Xcode build, ensuring the extension is always up to date.

### For macOS extension:

1. Select **"Abracademic Extension (macOS)"** target (click the blue project icon, then select from the TARGETS list)
2. Go to **"Build Phases"** tab
3. Click **"+"** at the top left → **"New Run Script Phase"**
4. A new "Run Script" phase appears at the bottom - **drag it to the top** (before "Compile Sources")
   - It MUST run before "Copy Bundle Resources"
5. Expand the "Run Script" section
6. In the script box, paste:

```bash
set -e

# Navigate to repository root (adjust path if needed)
cd "$SRCROOT/../../"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm ci --prefer-offline
fi

# Build Safari extension
echo "Building Safari extension..."
npm run build:safari
echo "Safari extension build complete"
```

7. Set shell: `/bin/sh`
8. Optional: Check "Show environment variables in build log" for debugging

### For iOS extension:

1. Select **"Abracademic Extension (iOS)"** target
2. Go to **"Build Phases"** tab
3. Click **"+"** → **"New Run Script Phase"**
4. Drag to before "Copy Bundle Resources"
5. Paste the same script as above

## Step 4: Configure signing (required for testing)

For both app and extension targets, you'll need to configure code signing:

1. Select the **"Abracademic (macOS)"** target
2. Go to **"Signing & Capabilities"** tab
3. Check **"Automatically manage signing"**
4. Select your **Team** (Apple Developer account)
5. Repeat for:
   - Abracademic Extension (macOS)
   - Abracademic (iOS)
   - Abracademic Extension (iOS)

If you don't have a team, you can use your personal Apple ID for local testing.

## Step 5: Build and test

### Build for macOS:

1. At the top of Xcode, select scheme: **"Abracademic (macOS)"**
2. Select target: **"My Mac"**
3. Click **Run** (⌘R) or Product → Run
4. The build script will run `npm run build:safari`
5. The app will launch with instructions
6. Open Safari → Settings/Preferences → Extensions
7. Enable **"Abracademic Extension"**
8. Test on a scholarly URL

### Build for iOS:

1. Select scheme: **"Abracademic (iOS)"**
2. Select target: **iPhone simulator** or a connected device
3. Click **Run** (⌘R)
4. On the device/simulator:
   - Settings → Safari → Extensions
   - Enable **"Abracademic Extension"**
5. Open Safari and test

## Troubleshooting

### Build script errors:

- Check the path in `cd "$SRCROOT/../../"` is correct
- In Xcode, build log will show npm output
- Manually run `npm run build:safari` from terminal to test

### Extension not found:

- Verify `dist/safari` appears as a **blue folder** (folder reference)
- Check it's in "Copy Bundle Resources" for the extension target
- Clean build folder: Product → Clean Build Folder (⌘⇧K)

### Code signing errors:

- Make sure all 4 targets have signing configured
- Update bundle identifiers if needed (they must be unique)
- Check provisioning profiles if using a developer account

### Extension doesn't update:

- The run script rebuilds automatically
- Force rebuild: Product → Clean Build Folder, then build again
- Check the build log for "Building Safari extension..." message

## Verifying the setup

After completing these steps:

✅ No extension files directly in the project (except `Info.plist`, `SafariWebExtensionHandler.swift`)
✅ `dist/safari` folder reference (blue) in both macOS and iOS extension targets
✅ Run Script phase before "Copy Bundle Resources" in both extension targets
✅ All 4 targets have code signing configured
✅ Build succeeds and runs on both macOS and iOS

## Next steps

- Customise the app UI in `Shared (App)/ViewController.swift`
- Add proper app icons in Assets.xcassets
- Test all extension functionality
- Archive and submit to App Store when ready

## Important notes

- **Never edit files in `dist/safari` directly** - they're regenerated on each build
- All changes go in `/src` and get rebuilt automatically
- The extension shares the same code across macOS and iOS
- Changes to TypeScript source require rebuilding via the npm script
