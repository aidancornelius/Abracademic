#!/bin/bash
# Generate icons from SVG source for all platforms

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_SVG="$PROJECT_DIR/images/Abracademic.svg"
SOURCE_PNG="$PROJECT_DIR/images/Abracademic_Logo.png"

# Extension icons directory
EXT_ICONS_DIR="$PROJECT_DIR/src/icons"

# Safari assets directory
SAFARI_APPICON_DIR="$PROJECT_DIR/safari-wrapper/Abracademic/Shared (App)/Assets.xcassets/AppIcon.appiconset"
SAFARI_LARGEICON_DIR="$PROJECT_DIR/safari-wrapper/Abracademic/Shared (App)/Assets.xcassets/LargeIcon.imageset"

# Create directories if needed
mkdir -p "$EXT_ICONS_DIR"
mkdir -p "$SAFARI_APPICON_DIR"
mkdir -p "$SAFARI_LARGEICON_DIR"

# --- Extension icons (from SVG) ---
echo "Generating extension icons from: $SOURCE_SVG"

# Generate a high-res PNG from SVG first (1024px)
echo "Creating master 1024px PNG from SVG for extension..."
rsvg-convert -w 1024 -h 1024 "$SOURCE_SVG" -o "/tmp/ext-icon-1024.png"

# Copy SVG to icons directory
cp "$SOURCE_SVG" "$EXT_ICONS_DIR/icon.svg"

# Extension icon sizes
EXT_SIZES=(16 32 48 96 128 256 512)

echo "Generating extension icons..."
for size in "${EXT_SIZES[@]}"; do
    sips -z $size $size "/tmp/ext-icon-1024.png" --out "$EXT_ICONS_DIR/icon-$size.png" > /dev/null
    echo "  Created icon-$size.png"
done

rm "/tmp/ext-icon-1024.png"

# --- App icons (from PNG logo) ---
echo ""
echo "Generating app icons from: $SOURCE_PNG"

# Resize source PNG to 1024px square for app icons
echo "Creating master 1024px PNG from logo for app..."
sips -z 1024 1024 "$SOURCE_PNG" --out "/tmp/app-icon-1024.png" > /dev/null

# Safari app icon sizes (macOS)
# Format: size@scale -> actual pixels
echo "Generating Safari app icons..."

# macOS icons
sips -z 16 16 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-16@1x.png" > /dev/null
sips -z 32 32 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-16@2x.png" > /dev/null
sips -z 32 32 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-32@1x.png" > /dev/null
sips -z 64 64 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-32@2x.png" > /dev/null
sips -z 128 128 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-128@1x.png" > /dev/null
sips -z 256 256 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-128@2x.png" > /dev/null
sips -z 256 256 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-256@1x.png" > /dev/null
sips -z 512 512 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-256@2x.png" > /dev/null
sips -z 512 512 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-512@1x.png" > /dev/null
sips -z 1024 1024 "/tmp/app-icon-1024.png" --out "$SAFARI_APPICON_DIR/mac-icon-512@2x.png" > /dev/null

# Universal icon (iOS/macOS)
cp "/tmp/app-icon-1024.png" "$SAFARI_APPICON_DIR/universal-icon-1024@1x.png"

# Large icon for App Store / about screen
cp "/tmp/app-icon-1024.png" "$SAFARI_LARGEICON_DIR/universal-icon-1024@1x.png"

# Icon.png in Shared (App)/Resources (used in the app UI)
SAFARI_RESOURCES_DIR="$PROJECT_DIR/safari-wrapper/Abracademic/Shared (App)/Resources"
sips -z 128 128 "/tmp/app-icon-1024.png" --out "$SAFARI_RESOURCES_DIR/Icon.png" > /dev/null

echo "  Created all Safari app icons"

# Cleanup
rm "/tmp/app-icon-1024.png"

echo ""
echo "Done! Icons generated successfully."
echo "  Extension icons: $EXT_ICONS_DIR"
echo "  Safari icons: $SAFARI_APPICON_DIR"
