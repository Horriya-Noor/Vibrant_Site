#!/usr/bin/env bash
# Restores the website from a backup archive.
# Usage:  ./scripts/restore.sh ../vibrant-backups/vibrant-site_YYYY-MM-DD_HHMMSS.tar.gz
set -euo pipefail
ARCHIVE="${1:?Give the path to a backup .tar.gz}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$ARCHIVE.sha256" ]; then
  ( cd "$(dirname "$ARCHIVE")" && sha256sum -c "$(basename "$ARCHIVE").sha256" )
fi
# safety copy of the current state first
"$ROOT/scripts/backup.sh"
tar -xzf "$ARCHIVE" -C "$ROOT"
echo "Restored from $ARCHIVE"
