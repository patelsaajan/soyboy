<!-- Payload deploys to Cloudflare Workers via Git-connected builds from main. -->

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

### 3. Cache-purge credentials

Without these the purge hook no-ops and every content change waits out the edge
TTL — a day — instead of appearing in seconds.

```sh
npx wrangler secret put CF_ZONE_ID              # zone dashboard → overview
npx wrangler secret put CF_CACHE_PURGE_TOKEN
```

The token needs exactly one permission: **Zone → Cache Purge → Purge**, scoped
to this zone. Nothing else.

`FRONTEND_URL` is doing double duty here: it is the CORS/CSRF allowlist *and*
the origin the purge builds its URLs against. If it is wrong, purges miss
silently.

## Migrate data (cutover)

```sh
# Database: Railway -> Neon
SOURCE_DATABASE_URL="postgresql://.../railway" \
TARGET_DATABASE_URL="postgresql://.../neon?sslmode=require" \
apps/payload/scripts/migrate-db-to-neon.sh

# Confirm schema is in sync
DATABASE_URL="postgresql://.../neon?sslmode=require" \
  pnpm --filter @soyboy/payload payload migrate

# Media: old storage -> R2
SOURCE_URI="s3://old-bucket" R2_BUCKET="soyboy-media" \
R2_ENDPOINT="https://<account>.r2.cloudflarestorage.com" \
  apps/payload/scripts/sync-media-to-r2.sh
```

## Build & deploy

```sh
# Local smoke test against the Worker runtime
pnpm --filter @soyboy/payload cf:preview

# Deploy (build + deploy from your machine)
pnpm --filter @soyboy/payload cf:deploy
```

`cf:build` runs `next build --turbopack` then `opennextjs-cloudflare build`. The
flag is explicit rather than left to Next 16's default: a webpack build ignores
`serverExternalPackages` and inlines the `pg-cloudflare` stub, breaking the
Postgres driver at runtime — and only in the deployed Worker, which builds and
starts cleanly and then cannot reach the database.

`cf:deploy` also runs `cf:migrate` between the build and the deploy, so a deploy
from a laptop applies migrations exactly as CI does.

## Git-connected builds (auto-deploy on push)

Configured in the Cloudflare dashboard (Workers → the Worker → Settings →
Builds). Connect the GitHub repo, then set:

| Setting | Value |
|---|---|
| **Root directory** | `apps/payload` |
| **Build command** | `pnpm cf:ci:build` |
| **Deploy command** | `pnpm cf:ci:deploy` |
| **Build cache** | **On** |
| **Build watch path** | **leave blank** |

Watch paths are evaluated *relative to the root directory*, so `apps/payload/…`
becomes `apps/payload/apps/payload/…` and matches nothing — this silently
blocked builds during setup. `pnpm-lock.yaml`, `patches/` and `packages/shared`
also live outside each app's root directory, so a scoped watch path could not
watch them anyway. See [cloudflare-builds.md](cloudflare-builds.md).

- `cf:ci:build` = `cf:build` = `generate:importmap` (regenerates the admin import
  map) → `next build --turbopack` → OpenNext bundle.
- `cf:ci:deploy` = `cf:migrate` (applies pending migrations to Neon under
  `NODE_ENV=production`) → `wrangler deploy`. Migrations run before the new
  Worker goes live, so the code never hits an old schema. `payload migrate` is
  idempotent — safe every deploy.

`cf:migrate` is confirmation-gated by `scripts/confirm.mjs`, which **fails closed
without a TTY**. `cf:ci:deploy` therefore supplies `CONFIRM=migrate` explicitly
rather than relying on the builder exporting `CI=true` — if that assumption were
ever wrong, every deploy would break.

**Root directory (not `--filter`):** `wrangler deploy` finds `wrangler.jsonc` by
CWD, and the `main`/`assets` paths inside it are relative — both resolve only
when the command runs *in* `apps/payload`. pnpm still finds the workspace root by
walking up, so the install + patch still work.

### Build environment variables (dashboard → Build → Variables)

`cf:ci:build`/`cf:ci:deploy` boot the Payload config, and `payload migrate`
connects to Neon, so set these as **build** vars (separate from the runtime
`wrangler secret`s):

| Var | Value |
|---|---|
| `DATABASE_URL` | Neon **direct** connection string (no `-pooler`) — for migrations |
| `PAYLOAD_SECRET` | same value as the runtime secret |

(S3/R2 vars aren't needed at build — the storage plugin just stays disabled.)

## After deploy

1. Attach your domain to the Worker (Cloudflare dashboard → Workers Routes).
2. Update the frontend's `PAYLOAD_URL` to the new endpoint. The frontend also has
   a `BACKEND` service binding to this Worker for worker-to-worker calls.
3. Smoke test: admin login, recipe CRUD, image upload (lands in R2), API reads.
   Then confirm the purge is live — edit a recipe, save, and watch for
   `frontend cache purged: N URLs` in `npx wrangler tail soyboy-payload`. A purge
   you have not watched work is a purge that does not work.
4. **Set `CRON_SECRET`** — `wrangler secret put CRON_SECRET` on `soyboy-payload`
   (`openssl rand -hex 32`). The daily recipe rotation runs on a Cron Trigger
   that authenticates itself against this; without it the route answers 503 and
   the cron run goes red. See *Recipe of the day* in
   `docs/cloudflare-payload-stack.md`.
5. Once stable, decommission the Railway Payload service.

## Known limitations

- **No `sharp`** → no server-side resize/thumbnails or auto width/height
  metadata. Resize at the edge (Cloudflare Images / `@nuxt/image`).
- **Transactions**: Postgres transactions work through Hyperdrive, but keep an
  eye on transaction-heavy Payload operations under Workers request isolation.
