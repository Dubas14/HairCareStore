#!/bin/bash
# ============================
# Hair Lab Store — Restore Script
# ============================
# Restores database and media from a backup
# Usage: bash scripts/restore.sh ./backup/hair-lab-2026-02-18_12-00
# ============================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONTAINER_NAME="beauty-postgres"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-payload}"

if [ $# -lt 1 ]; then
  echo "Usage: bash scripts/restore.sh <backup-directory>"
  echo "Example: bash scripts/restore.sh ./backup/hair-lab-2026-02-18_12-00"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "ERROR: Backup directory not found: $BACKUP_DIR"
  exit 1
fi

echo "=================================="
echo "  Hair Lab Store — Restore"
echo "  From: $BACKUP_DIR"
echo "=================================="

# --- Verify backup contents ---
echo ""
echo "[1/3] Verifying backup contents..."
HAS_DB=false
HAS_MEDIA=false

if [ -f "$BACKUP_DIR/database.sql" ]; then
  HAS_DB=true
  DB_SIZE=$(du -sh "$BACKUP_DIR/database.sql" | cut -f1)
  echo "   database.sql: $DB_SIZE"
else
  echo "   WARNING: database.sql not found"
fi

if [ -f "$BACKUP_DIR/media.tar.gz" ]; then
  HAS_MEDIA=true
  MEDIA_SIZE=$(du -sh "$BACKUP_DIR/media.tar.gz" | cut -f1)
  echo "   media.tar.gz: $MEDIA_SIZE"
else
  echo "   WARNING: media.tar.gz not found"
fi

if [ "$HAS_DB" = false ] && [ "$HAS_MEDIA" = false ]; then
  echo "ERROR: No backup files found!"
  exit 1
fi

# --- Confirm ---
echo ""
read -p "This will OVERWRITE existing data. Continue? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

# --- Restore database ---
if [ "$HAS_DB" = true ]; then
  echo ""
  echo "[2/3] Restoring database..."
  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_DIR/database.sql"
    echo "   Database restored successfully"
  else
    echo "   ERROR: Container '$CONTAINER_NAME' is not running!"
    echo "   Start it with: docker-compose up -d postgres"
    exit 1
  fi
else
  echo ""
  echo "[2/3] Skipping database restore (no dump file)"
fi

# --- Restore media ---
if [ "$HAS_MEDIA" = true ]; then
  echo ""
  echo "[3/3] Restoring media files..."
  MEDIA_DIR="$PROJECT_DIR/frontend/media"
  mkdir -p "$MEDIA_DIR"
  tar -xzf "$BACKUP_DIR/media.tar.gz" -C "$PROJECT_DIR/frontend/"
  MEDIA_COUNT=$(find "$MEDIA_DIR" -type f | wc -l)
  echo "   Media restored: $MEDIA_COUNT files"
else
  echo ""
  echo "[3/3] Skipping media restore (no archive)"
fi

# --- Summary ---
echo ""
echo "=================================="
echo "  Restore complete!"
echo "=================================="
echo ""
if [ "$HAS_DB" = true ]; then
  echo "  Database: restored"
fi
if [ "$HAS_MEDIA" = true ]; then
  echo "  Media: restored to frontend/media/"
fi
echo ""
echo "  Next steps:"
echo "  1. Restart the application: cd frontend && npm run dev"
echo "  2. Check that everything works at http://localhost:3200"
echo ""
echo "=================================="
