#!/usr/bin/env bash
# Build the web game and copy into the iOS project (WebDist/ next to the Xcode project).
# The Xcode target copies this folder into the .app bundle via a Run Script phase
# so directory structure (assets/, handbook/) is preserved — required for Vite base "./".
# Run from repo root: npm run ios:sync
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Sibling of Heliopoly.xcodeproj — NOT inside the synchronized Heliopoly/ source group
DEST="$ROOT/ios/Heliopoly/WebDist"

cd "$ROOT"
echo "→ npm run build"
npm run build

echo "→ sync dist/ → $DEST"
rm -rf "$DEST"
mkdir -p "$DEST"
rsync -a --delete \
  --exclude '*.map' \
  "$ROOT/dist/" "$DEST/"

{
  echo "synced=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "source=dist"
  if command -v git >/dev/null 2>&1; then
    echo "git=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  fi
} >"$DEST/.heliopoly-web-sync"

echo "→ WebDist ready ($(du -sh "$DEST" | awk '{print $1}'))"
echo "  Open ios/Heliopoly/Heliopoly.xcodeproj · Run on iPad Simulator."
