#!/usr/bin/env bash
#
# Push the Worker's runtime secrets to Cloudflare from apps/payload/.env.
#
# Pushes ONLY the keys the deployed Worker needs. DATABASE_URL is intentionally
# excluded — on Workers the connection string comes from the HYPERDRIVE binding,
# not a secret.
#
# Prereq: the Worker must already exist (run `pnpm cf:deploy` once first).
# Usage:  ./scripts/set-cf-secrets.sh
set -euo pipefail
cd "$(dirname "$0")/.."

KEYS="PAYLOAD_SECRET S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET_NAME S3_ENDPOINT_URL S3_REGION FRONTEND_URL PAYLOAD_URL"

TMP="$(mktemp -t cf-secrets-XXXXXX).json"
trap 'rm -f "$TMP"' EXIT

# Read values from .env into a JSON map (values never printed to stdout).
node -e '
  const fs = require("fs")
  const env = fs.readFileSync(".env", "utf8")
  const keys = process.argv[1].split(" ")
  const out = {}
  for (const k of keys) {
    const m = env.match(new RegExp("^" + k + "=(.*)$", "m"))
    if (m) out[k] = m[1].trim()
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2))
' "$KEYS" "$TMP"

npx wrangler secret bulk "$TMP"
echo "✔ Secrets pushed (values pulled from .env, never logged)."
