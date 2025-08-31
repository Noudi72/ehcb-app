#!/bin/bash
# Simple icon generator using sips (macOS). Usage: ./scripts/generate-icons.sh
set -euo pipefail
SRC="$1"
OUT_DIR="$(pwd)/public"
if [ -z "${SRC}" ]; then
  echo "Usage: $0 /path/to/source.png" >&2
  exit 1
fi
echo "Generating icons from $SRC into $OUT_DIR"
mkdir -p "$OUT_DIR"
sips -Z 192 "$SRC" --out "$OUT_DIR/icon-192.png"
sips -Z 512 "$SRC" --out "$OUT_DIR/icon-512.png"
sips -Z 180 "$SRC" --out "$OUT_DIR/apple-touch-icon.png"
cp "$SRC" "$OUT_DIR/u18-team_app-icon.png"
echo "Generated: icon-192.png, icon-512.png, apple-touch-icon.png, u18-team_app-icon.png"
