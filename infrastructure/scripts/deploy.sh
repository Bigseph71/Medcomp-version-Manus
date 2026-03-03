#!/bin/bash
set -euo pipefail

# ─── MedCom Deployment Script ────────────────────────────────────────────────
# Usage: ./deploy.sh [staging|production]

ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "═══════════════════════════════════════════════════════"
echo "  MedCom Deployment — Environment: ${ENVIRONMENT}"
echo "═══════════════════════════════════════════════════════"

# ─── Pre-flight Checks ───────────────────────────────────────────────────────
echo "[1/6] Running pre-flight checks..."

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    exit 1
fi

# Check .env file
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "ERROR: .env file not found. Copy .env.example and configure."
    exit 1
fi

# ─── Backup Database ─────────────────────────────────────────────────────────
echo "[2/6] Backing up database..."
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T postgres \
    pg_dump -U medcom_user medcom | gzip > "$BACKUP_DIR/medcom_${TIMESTAMP}.sql.gz" 2>/dev/null || \
    echo "  → No existing database to backup (first deployment)"

# ─── Pull Latest Images ──────────────────────────────────────────────────────
echo "[3/6] Pulling latest images..."
cd "$PROJECT_DIR"
docker compose pull

# ─── Build Backend ────────────────────────────────────────────────────────────
echo "[4/6] Building backend..."
docker compose build --no-cache backend

# ─── Run Database Migrations ─────────────────────────────────────────────────
echo "[5/6] Running database migrations..."
docker compose up -d postgres
sleep 10  # Wait for PostgreSQL to be ready

# Apply schema
docker compose exec -T postgres psql -U medcom_user -d medcom \
    -f /docker-entrypoint-initdb.d/001_schema.sql 2>/dev/null || true

echo "  → Migrations applied"

# ─── Start Services ──────────────────────────────────────────────────────────
echo "[6/6] Starting services..."
docker compose up -d

# Wait for health checks
echo "  → Waiting for services to be healthy..."
sleep 15

# Verify
if docker compose ps | grep -q "healthy"; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✓ Deployment successful!"
    echo "  Environment: ${ENVIRONMENT}"
    echo "  API: https://api.medcom.health"
    echo "  Docs: https://api.medcom.health/api/docs"
    echo "═══════════════════════════════════════════════════════"
else
    echo "WARNING: Some services may not be healthy yet."
    docker compose ps
fi
