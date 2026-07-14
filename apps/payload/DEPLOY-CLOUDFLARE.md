# Deploying Payload to Cloudflare Workers (Neon + Hyperdrive + R2)

The Payload app runs on Cloudflare Workers via the OpenNext adapter. Postgres is
hosted on **Neon**, fronted by **Hyperdrive** (edge pooling + caching); media
lives in an **R2** bucket. `sharp` is not used (native binaries can't run on
Workers) — image resizing is handled at the edge instead.

## Prerequisites

- Cloudflare **Workers Paid** plan (needed for Hyperdrive, cron, bundle size).
- A **Neon** project (note the *direct*, non-pooled connection string).
- An **R2** bucket + an S3-compatible API token.
- `wrangler` authenticated: `npx wrangler login`.

## One-time setup

### 1. Hyperdrive (points at Neon)

```sh
npx wrangler hyperdrive create soyboy-payload \
  --connection-string="postgresql://<user>:<pass>@<host>.neon.tech/<db>?sslmode=require"
```

Paste the returned `id` into `wrangler.jsonc` (`hyperdrive[0].id`).

### 2. Secrets

Set via wrangler (never commit these):

```sh
npx wrangler secret put PAYLOAD_SECRET      # reuse the EXACT Railway value
npx wrangler secret put S3_ACCESS_KEY_ID    # R2 token
npx wrangler secret put S3_SECRET_ACCESS_KEY
npx wrangler secret put S3_BUCKET_NAME      # e.g. soyboy-media
npx wrangler secret put S3_ENDPOINT_URL     # https://<account>.r2.cloudflarestorage.com
npx wrangler secret put S3_REGION           # auto
npx wrangler secret put FRONTEND_URL
npx wrangler secret put PAYLOAD_URL
```

## Migrate data (cutover)

```sh
# Database: Railway -> Neon
SOURCE_DATABASE_URL="postgresql://.../railway" \
TARGET_DATABASE_URL="postgresql://.../neon?sslmode=require" \
./scripts/migrate-db-to-neon.sh

# Confirm schema is in sync
DATABASE_URL="postgresql://.../neon?sslmode=require" \
  pnpm --filter @soyboy/payload payload migrate

# Media: old storage -> R2
SOURCE_URI="s3://old-bucket" R2_BUCKET="soyboy-media" \
R2_ENDPOINT="https://<account>.r2.cloudflarestorage.com" \
  ./scripts/sync-media-to-r2.sh
```

## Build & deploy

```sh
# Local smoke test against the Worker runtime
pnpm --filter @soyboy/payload cf:preview

# Deploy
pnpm --filter @soyboy/payload cf:deploy
```

The build runs `next build --webpack` (Turbopack can't externalize the native
deps OpenNext needs) then `opennextjs-cloudflare build`.

## After deploy

1. Attach your domain to the Worker (Cloudflare dashboard → Workers Routes).
2. Update the frontend's `PAYLOAD_URL` to the new endpoint. The frontend also has
   a `BACKEND` service binding to this Worker for worker-to-worker calls.
3. Smoke test: admin login, recipe CRUD, image upload (lands in R2), API reads.
4. **Re-enable the daily recipe cron** via Cron Triggers (currently disabled in
   `payload.config.ts` — the `jobs.autoRun` block). Add a `triggers.crons` entry
   in `wrangler.jsonc` + a scheduled handler that runs the rotate logic.
5. Once stable, decommission the Railway Payload service.

## Known limitations

- **No `sharp`** → no server-side resize/thumbnails or auto width/height
  metadata. Resize at the edge (Cloudflare Images / `@nuxt/image`).
- **Transactions**: Postgres transactions work through Hyperdrive, but keep an
  eye on transaction-heavy Payload operations under Workers request isolation.
