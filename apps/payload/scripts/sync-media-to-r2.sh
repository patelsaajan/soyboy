#!/usr/bin/env bash
#
# Copy existing media objects into the Cloudflare R2 bucket using the AWS CLI
# (R2 is S3-compatible). Run once during cutover.
#
# Set up an R2 profile first (one time):
#   aws configure --profile r2
#     AWS Access Key ID     -> R2 token access key id
#     AWS Secret Access Key -> R2 token secret
#     Default region        -> auto
#
# Usage:
#   SOURCE_URI="s3://old-bucket"        \  # or a local dir like ./media
#   R2_BUCKET="soyboy-media"            \
#   R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com" \
#   ./scripts/sync-media-to-r2.sh
set -euo pipefail

: "${SOURCE_URI:?set SOURCE_URI (s3://old-bucket or a local path)}"
: "${R2_BUCKET:?set R2_BUCKET (target R2 bucket name)}"
: "${R2_ENDPOINT:?set R2_ENDPOINT (https://<account>.r2.cloudflarestorage.com)}"

echo "→ Syncing $SOURCE_URI -> s3://$R2_BUCKET (R2)"
aws s3 sync "$SOURCE_URI" "s3://$R2_BUCKET" \
  --profile r2 \
  --endpoint-url "$R2_ENDPOINT" \
  --checksum-algorithm CRC32

echo "→ Done. Verify with:"
echo "  aws s3 ls \"s3://$R2_BUCKET\" --profile r2 --endpoint-url \"$R2_ENDPOINT\""
