#!/usr/bin/env bash
set -euo pipefail

# Obsession - download the dinner date scene from YouTube
SCENE_URL="https://www.youtube.com/watch?v=UWVznyWUS-E"
OUTPUT_PATH="public/obsession.mp4"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FULL_OUTPUT="$PROJECT_ROOT/$OUTPUT_PATH"

echo "🎬 Downloading video from: $SCENE_URL"
echo "📁 Saving to: $FULL_OUTPUT"

mkdir -p "$(dirname "$FULL_OUTPUT")"

yt-dlp \
  --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  --output "$FULL_OUTPUT" \
  --no-playlist \
  "$SCENE_URL"

echo "✅ Download complete: $FULL_OUTPUT"

# Crop to 1.50:1 aspect ratio (1620x1080 from 1920x1080, centered)
ASPECT_RATIO="1.50"
echo "✂️  Cropping to ${ASPECT_RATIO}:1 aspect ratio..."

TEMP_FILE="${FULL_OUTPUT%.mp4}_temp.mp4"

ffmpeg -i "$FULL_OUTPUT" \
  -vf "crop=1620:1080:150:0" \
  -c:a copy \
  -y \
  "$TEMP_FILE" 2>/dev/null

mv "$TEMP_FILE" "$FULL_OUTPUT"

echo "✅ Crop complete: $FULL_OUTPUT"

# Trim to 0:50–1:00
TRIM_START="00:00:50"
TRIM_END="00:01:00"
TRIM_OUTPUT="$PROJECT_ROOT/public/NoNoNo.mp4"
echo "✂️  Trimming from ${TRIM_START} to ${TRIM_END}..."

ffmpeg -i "$FULL_OUTPUT" \
  -ss "$TRIM_START" \
  -to "$TRIM_END" \
  -c copy \
  -y \
  "$TRIM_OUTPUT" 2>/dev/null

echo "✅ Trim complete: $TRIM_OUTPUT"
