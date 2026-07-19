#!/usr/bin/env bash
#
# Build a standalone Tiny Day APK that runs with no Metro dev server.
#
# Why this exists: on this stack a production bundle (__DEV__ false) leaves the
# JS scheduler unpumped, so timers never fire and nothing paints — see the
# "Known issue" section in README.md. A development bundle runs correctly, it
# just refuses to start when it can't reach a dev server. metro.config.js stubs
# that one module out when EXPO_EMBED_DEV=1, so the dev bundle can be embedded
# in the APK and the app becomes self-contained.
#
# Usage: scripts/build-standalone.sh [output.apk]
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$PROJECT_ROOT/TinyDay-standalone.apk}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

: "${ANDROID_HOME:=$HOME/Android/Sdk}"
export ANDROID_HOME
BUILD_TOOLS="$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)"
KEYSTORE="${TINYDAY_KEYSTORE:-$HOME/.android/debug.keystore}"
KS_PASS="${TINYDAY_KEYSTORE_PASS:-android}"
KEY_ALIAS="${TINYDAY_KEY_ALIAS:-androiddebugkey}"

cd "$PROJECT_ROOT"

echo "==> Building the native release shell"
(cd android && ./gradlew assembleRelease -q)
APK_IN=android/app/build/outputs/apk/release/app-release.apk

echo "==> Bundling JS (development bundle, embedded)"
mkdir -p "$WORK/assets"
EXPO_EMBED_DEV=1 NODE_ENV=development npx expo export:embed \
  --platform android \
  --dev true \
  --bundle-output "$WORK/assets/index.android.bundle" \
  --assets-dest "$WORK/res"

echo "==> Swapping the bundle into the APK"
cp "$APK_IN" "$WORK/work.apk"
(cd "$WORK" && zip -q work.apk assets/index.android.bundle)
if [ -d "$WORK/res" ]; then (cd "$WORK/res" && zip -qr ../work.apk .); fi

echo "==> Aligning and signing"
"$BUILD_TOOLS/zipalign" -p -f 4 "$WORK/work.apk" "$WORK/aligned.apk"
"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" --ks-pass "pass:$KS_PASS" --key-pass "pass:$KS_PASS" \
  --ks-key-alias "$KEY_ALIAS" --out "$OUT" "$WORK/aligned.apk"

echo
echo "Standalone APK: $OUT"
echo "Install with:  adb install -r \"$OUT\""
