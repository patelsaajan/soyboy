#!/usr/bin/env bash
#
# Seed the production database.
#
# The seed runs as a plain Node process on your machine and connects straight to
# Postgres — not through Hyperdrive, which is only reachable from inside a
# Worker. So DATABASE_URL must be Neon's DIRECT (non-pooled) connection string.
#
# Usage:
#   pnpm seed:prod                 # apply pending migrations, then seed
#   pnpm seed:prod --skip-migrate  # seed only, leave migrations alone
#   pnpm seed:prod --dry-run       # show the target and plan, then stop
#   pnpm seed:prod --yes           # skip the confirmation prompt (CI)
#
# Credentials are read from apps/payload/.env.production.local (gitignored via
# the `.env*.local` rule). Anything already exported in your environment wins,
# matching dotenv's precedence elsewhere in this repo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
cd "$APP_DIR"

ASSUME_YES=0
SKIP_MIGRATE=0
ALLOW_LOCAL=0
DRY_RUN=0
ENV_FILE="$APP_DIR/.env.production.local"

die() {
  printf '\nerror: %s\n' "$1" >&2
  exit 1
}

# Print the header comment above, minus the shebang, as the help text.
usage() {
  awk 'NR < 3 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "${BASH_SOURCE[0]}"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes|-y)       ASSUME_YES=1 ;;
    --skip-migrate) SKIP_MIGRATE=1 ;;
    --allow-local)  ALLOW_LOCAL=1 ;;
    --dry-run|-n)   DRY_RUN=1 ;;
    --env-file)     ENV_FILE="${2:-}"; [[ -n "$ENV_FILE" ]] || die "--env-file needs a path"; shift ;;
    --help|-h)      usage ;;
    *)              die "unknown argument: $1 (try --help)" ;;
  esac
  shift
done

# ---------------------------------------------------------------------------
# Load the env file, without clobbering anything already set.
# ---------------------------------------------------------------------------

load_env_file() {
  local file="$1" line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
    [[ "$line" == "export "* ]] && line="${line#export }"
    [[ "$line" == *=* ]] || continue

    key="${line%%=*}"
    value="${line#*=}"
    key="${key//[[:space:]]/}"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue

    # Strip one layer of surrounding quotes, if present.
    if [[ ${#value} -ge 2 && ( "$value" == \"*\" || "$value" == \'*\' ) ]]; then
      value="${value:1:${#value}-2}"
    fi

    # Already-exported vars win, so an inline DATABASE_URL=... overrides the file.
    [[ -n "${!key:-}" ]] || export "$key=$value"
  done < "$file"
}

if [[ -f "$ENV_FILE" ]]; then
  load_env_file "$ENV_FILE"
  echo "Loaded credentials from ${ENV_FILE#"$APP_DIR"/}"
else
  echo "No env file at ${ENV_FILE#"$APP_DIR"/} — using the current environment."
fi

[[ -n "${DATABASE_URL:-}" ]]   || die "DATABASE_URL is not set. Put it in ${ENV_FILE#"$APP_DIR"/} or export it."
[[ -n "${PAYLOAD_SECRET:-}" ]] || die "PAYLOAD_SECRET is not set. Put it in ${ENV_FILE#"$APP_DIR"/} or export it."

# The seed uploads recipe images, so R2 credentials are wanted here if they are
# configured — but payload.config.ts validates S3_* as an all-or-nothing group
# and throws on a partial set. Clear a partial set rather than failing on it.
if [[ -z "${S3_BUCKET_NAME:-}" || -z "${S3_SECRET_ACCESS_KEY:-}" || -z "${S3_ACCESS_KEY_ID:-}" \
   || -z "${S3_ENDPOINT_URL:-}" || -z "${S3_REGION:-}" ]]; then
  if [[ -n "${S3_BUCKET_NAME:-}${S3_SECRET_ACCESS_KEY:-}${S3_ACCESS_KEY_ID:-}${S3_ENDPOINT_URL:-}${S3_REGION:-}" ]]; then
    echo "warning: S3_* is only partially set — clearing it. Uploads will go to local disk."
  fi
  unset S3_BUCKET_NAME S3_REGION S3_ENDPOINT_URL S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY
fi

# Purge-on-publish fires per document written. A seed writes the whole catalogue
# at once, so leaving these set would mean hundreds of purge calls for one
# logical change. Clear them and nudge the cache once at the end instead (save
# any document in the admin panel).
unset CF_ZONE_ID CF_CACHE_PURGE_TOKEN

export NODE_OPTIONS="${NODE_OPTIONS:---no-deprecation}"

# ---------------------------------------------------------------------------
# Describe the target. Parsed with node's URL rather than a regex so odd
# passwords don't produce a misleading summary — and so the password is never
# printed.
# ---------------------------------------------------------------------------

DB_SUMMARY="$(node -e '
  try {
    const u = new URL(process.env.DATABASE_URL);
    const host = u.hostname + (u.port ? ":" + u.port : "");
    const name = decodeURIComponent(u.pathname.replace(/^\//, "")) || "(default)";
    process.stdout.write([host, name, decodeURIComponent(u.username) || "(none)"].join("\t"));
  } catch {
    process.stdout.write("\t\t");
  }
')"

IFS=$'\t' read -r DB_HOST DB_NAME DB_USER <<< "$DB_SUMMARY"
[[ -n "$DB_HOST" ]] || die "DATABASE_URL is not a parseable connection URL."

if [[ "$ALLOW_LOCAL" -eq 0 ]]; then
  case "${DB_HOST%%:*}" in
    localhost|127.0.0.1|0.0.0.0|::1)
      die "DATABASE_URL points at ${DB_HOST}, which is local — the prod env file probably didn't load. Pass --allow-local if this is deliberate."
      ;;
  esac
fi

echo
echo "Target"
echo "  host      ${DB_HOST}"
echo "  database  ${DB_NAME}"
echo "  user      ${DB_USER}"
echo
echo "Plan"
step=1
if [[ "$SKIP_MIGRATE" -eq 0 ]]; then
  echo "  ${step}. payload migrate — apply any pending migrations"
  step=$((step + 1))
fi
echo "  ${step}. seed — upsert every recipe by slug; existing rows are updated, not duplicated"
echo

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Dry run — nothing was written. Drop --dry-run to execute the plan above."
  exit 0
fi

if [[ "$ASSUME_YES" -eq 0 ]]; then
  [[ -r /dev/tty ]] || die "no terminal available to confirm on — re-run with --yes if this is intentional."
  printf 'Continue? [yes/N] '
  read -r reply < /dev/tty
  [[ "$reply" == "yes" ]] || die "aborted."
fi

# ---------------------------------------------------------------------------
# Go. NODE_ENV=production keeps the seed data-only: in dev mode Payload runs
# drizzle's schema push against whatever DATABASE_URL points at, which would
# alter the production schema outside the migrations workflow. payload.config.ts
# gates that on a local host too — two independent levers on the same door.
# ---------------------------------------------------------------------------

if [[ "$SKIP_MIGRATE" -eq 0 ]]; then
  echo
  echo "==> payload migrate"
  NODE_ENV=production pnpm exec payload migrate
fi

echo
echo "==> seed"
NODE_ENV=production pnpm exec tsx src/seed/run.ts --allow-remote

echo
echo "Done. Create the first admin user at \${PAYLOAD_URL}/admin if the users table is still empty."
echo "The purge hooks were disabled for this run — save any document in the admin panel to refresh the edge cache."
