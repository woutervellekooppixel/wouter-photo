#!/usr/bin/env bash
set -uo pipefail

ARCHIVE="/Users/woutervellekoop/Library/CloudStorage/OneDrive-WouterVellekoop.nl/002 Werkmappen/06_JPG"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT="$REPO/public/stats.json"
LOCKFILE="/tmp/photo_stats_watch.lock"
COOLDOWN=30

echo "Watching for new shoot folders in archive..."
echo "Ctrl+C to stop."
echo ""

fswatch -0 --event Created -r "$ARCHIVE" | while IFS= read -r -d "" path; do
    # Only react to new directories (new shoots), not individual files
    [ -d "$path" ] || continue

    # Debounce: skip if we ran less than $COOLDOWN seconds ago
    if [ -f "$LOCKFILE" ]; then
        last=$(cat "$LOCKFILE")
        now=$(date +%s)
        (( now - last < COOLDOWN )) && continue
    fi
    date +%s > "$LOCKFILE"

    echo "[$(date '+%H:%M:%S')] Nieuwe map: $(basename "$path")"
    echo "  → Stats berekenen..."

    PHOTO_STATS_OUTPUT="$OUTPUT" python3 "$HOME/Downloads/photo_stats.py" || {
        echo "  → Fout in photo_stats.py"
        continue
    }

    echo "  → Committen en pushen..."
    git -C "$REPO" add public/stats.json && \
    git -C "$REPO" commit -m "Update portfolio stats $(date '+%Y-%m-%d')" && \
    git -C "$REPO" push && \
    echo "  → Live op wouter.photo/stats.json" || \
    echo "  → Git fout opgetreden"
done
