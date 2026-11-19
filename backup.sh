#!/usr/bin/env bash
# Creates a timestamped backup of the website and keeps the newest 30.
# Usage:  ./scripts/backup.sh            (run from anywhere)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${BACKUP_DIR:-$ROOT/../vibrant-backups}"
KEEP="${KEEP:-30}"
mkdir -p "$DEST"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
FILE="$DEST/vibrant-site_$STAMP.tar.gz"
tar --exclude='.git' --exclude='node_modules' -czf "$FILE" -C "$ROOT" .
( cd "$DEST" && sha256sum "$(basename "$FILE")" > "$(basename "$FILE").sha256" )
echo "Backup created: $FILE"
# prune old backups
ls -1t "$DEST"/vibrant-site_*.tar.gz 2>/dev/null | tail -n +"$((KEEP+1))" | while read -r old; do
  rm -f "$old" "$old.sha256"
done
