#!/usr/bin/env bash
#
# One-shot Postgres -> Neon data migration.
#
# Dumps the current (Railway) database and restores it into Neon. Schema is
# identical (same Payload db-postgres adapter), so this is a straight copy.
#
# Usage:
#   SOURCE_DATABASE_URL="postgresql://.../railway"   \
#   TARGET_DATABASE_URL="postgresql://.../neon?sslmode=require" \
#   ./scripts/migrate-db-to-neon.sh
#
# Requires: pg_dump / pg_restore (v16+ to match the server).
set -euo pipefail

: "${SOURCE_DATABASE_URL:?set SOURCE_DATABASE_URL (Railway)}"
: "${TARGET_DATABASE_URL:?set TARGET_DATABASE_URL (Neon, direct connection)}"

DUMP_FILE="$(mktemp -t soyboy-db-XXXX).dump"
echo "→ Dumping source database to $DUMP_FILE"
pg_dump --format=custom --no-owner --no-acl \
  --file="$DUMP_FILE" "$SOURCE_DATABASE_URL"

echo "→ Restoring into Neon (this overwrites matching objects)"
pg_restore --no-owner --no-acl --clean --if-exists \
  --dbname="$TARGET_DATABASE_URL" "$DUMP_FILE"

echo "→ Done. Verify with: psql \"$TARGET_DATABASE_URL\" -c '\\dt'"
echo "  Then run migrations to confirm sync:"
echo "    DATABASE_URL=\"$TARGET_DATABASE_URL\" pnpm --filter @soyboy/payload payload migrate"
rm -f "$DUMP_FILE"
