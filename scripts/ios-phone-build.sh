#!/usr/bin/env bash
# Build HeliopolyPhone for the iPhone simulator. Does not run HITL.
# Usage: ./scripts/ios-phone-build.sh
set -euo pipefail

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJ="$ROOT/ios/Heliopoly/Heliopoly.xcodeproj"
DEST="${IOS_DEST:-platform=iOS Simulator,name=iPhone 17}"

if [[ ! -d "$DEVELOPER_DIR" ]]; then
  echo "Xcode missing at $DEVELOPER_DIR" >&2
  exit 1
fi

if ! command -v xcbeautify >/dev/null 2>&1; then
  echo "xcbeautify not on PATH (brew install xcbeautify)" >&2
  exit 1
fi

cd "$ROOT"
xcodebuild \
  -project "$PROJ" \
  -scheme HeliopolyPhone \
  -destination "$DEST" \
  -quiet \
  build \
  | xcbeautify
