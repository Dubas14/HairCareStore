#!/bin/bash
# ============================
# Hair Lab Store — Backup Script
# ============================
# Creates a full backup: PostgreSQL dump + media files + env config
# Usage: bash scripts/backup.sh
# ============================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_DIR="$PROJECT_DIR/backup/hair-lab-$DATE"
CONTAINER_NAME="beauty-postgres"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-payload}"

echo "=================================="
echo "  Hair Lab Store — Backup"
echo "  $DATE"
echo "=================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo ""
echo "[1/4] Backup directory: $BACKUP_DIR"

# --- Database dump ---
echo ""
echo "[2/4] Dumping PostgreSQL database..."
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists > "$BACKUP_DIR/database.sql"
  DB_SIZE=$(du -sh "$BACKUP_DIR/database.sql" | cut -f1)
  TABLES=$(grep -c "^CREATE TABLE" "$BACKUP_DIR/database.sql" || echo "0")
  echo "   Database dumped: $DB_SIZE ($TABLES tables)"
else
  echo "   WARNING: Container '$CONTAINER_NAME' is not running!"
  echo "   Start it with: docker-compose up -d postgres"
  echo "   Skipping database backup."
fi

# --- Media files ---
echo ""
echo "[3/4] Archiving media files..."
MEDIA_DIR="$PROJECT_DIR/frontend/media"
if [ -d "$MEDIA_DIR" ] && [ "$(ls -A "$MEDIA_DIR" 2>/dev/null)" ]; then
  tar -czf "$BACKUP_DIR/media.tar.gz" -C "$PROJECT_DIR/frontend" media/
  MEDIA_SIZE=$(du -sh "$BACKUP_DIR/media.tar.gz" | cut -f1)
  MEDIA_COUNT=$(find "$MEDIA_DIR" -type f | wc -l)
  echo "   Media archived: $MEDIA_SIZE ($MEDIA_COUNT files)"
else
  echo "   WARNING: No media files found in $MEDIA_DIR"
fi

# --- Env backup ---
echo ""
echo "[4/4] Copying environment config..."
ENV_FILE="$PROJECT_DIR/frontend/.env.local"
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$BACKUP_DIR/env-backup.txt"
  echo "   .env.local saved as env-backup.txt"
else
  echo "   WARNING: .env.local not found"
fi

# --- Summary ---
echo ""
echo "=================================="
echo "  Backup complete!"
echo "=================================="
echo ""
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "  Location: $BACKUP_DIR"
echo "  Total size: $TOTAL_SIZE"
echo ""
ls -lh "$BACKUP_DIR/"
echo ""
echo "=================================="
