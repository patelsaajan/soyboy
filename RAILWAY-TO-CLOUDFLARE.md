# Recipe: Migrate a Railway site to Cloudflare Workers

Move a **Payload CMS + SPA frontend** stack off Railway onto a fully serverless,
~$5/mo Cloudflare setup. This guide targets a **React + Vite** frontend (SPA)
and a **Payload 3 (Next.js) CMS**, and splits every phase into what **Claude**
can do in your repo vs what **you** must do (dashboards, credentials, billing).

## Target architecture

```
Browser ──► frontend Worker (React SPA + tiny API proxy)     soyboy.example.com
                 │  service binding (internal, no public hop)
                 ▼
            payload Worker (Payload CMS via OpenNext)        cms.example.com
                 │  Hyperdrive binding (edge pooling)   │ S3 API
                 ▼                                      ▼
            Neon Postgres (free tier)              R2 bucket (media)
```

- **Cost:** $5/mo Workers Paid + $0 Neon free tier + ~$0 R2. Flat as traffic grows.
- **The CMS URL is never exposed** — data and images route through the frontend.
- **Images** are resized + converted to AVIF/WebP at the edge (no sharp).
- **CI/CD:** push to `main` → each app builds and deploys itself.

## Prerequisites (you)

- [ ] Cloudflare account on **Workers Paid** ($5/mo — required: Payload's bundle
      is ~7 MB gzipped; the free plan caps Workers at **3 MB**)
- [ ] A domain on the Cloudflare account (custom domains for both Workers)
- [ ] A **Neon** account (free tier)
- [ ] `wrangler login` completed locally
- [ ] Repo shaped as a pnpm monorepo: `apps/frontend` + `apps/payload`

---

## Phase 1 — Frontend on Workers (React + Vite)

**Claude does:**
- Add `@cloudflare/vite-plugin` and a `wrangler.jsonc`:
  ```jsonc
  {
    "name": "myapp-frontend",
    "main": "src/worker.ts",
    "compatibility_date": "<today>",
    "compatibility_flags": ["nodejs_compat"],
    "assets": {
      "directory": "./dist/client",
      "binding": "ASSETS",
      "not_found_handling": "single-page-application"
    },
    "services": [{ "binding": "BACKEND", "service": "myapp-payload" }]
  }
  ```
- Write a small Worker entry (`src/worker.ts`) that handles two things and
  falls through to static assets for everything else:
  1. **`/api/*` data proxy** — forwards to Payload via `env.BACKEND.fetch()`,
     caching responses in the **Cache API** (e.g. 5–15 min) so the DB is
     shielded and repeat requests never leave the edge.
  2. **`/api/media/file/*` media proxy** — streams image bytes from Payload
     over the binding with `cache-control: public, max-age=31536000, immutable`.
     This is what keeps the CMS URL out of the browser.
- Point all frontend data fetching at *relative* `/api/...` paths (never an
  absolute CMS URL).

**You do:** nothing yet.

## Phase 2 — Payload CMS on Workers (OpenNext)

**Claude does:**
- Add `@opennextjs/cloudflare` + `wrangler` to `apps/payload`, plus
  `open-next.config.ts` (`defineCloudflareConfig()`) and `wrangler.jsonc` with
  `main: ".open-next/worker.js"`, assets, `nodejs_compat`.
- `next.config.ts`: `output: 'standalone'` and `outputFileTracingRoot` pointed
  at the monorepo root.
- **Remove `sharp` entirely** from `payload.config.ts` (native binary — cannot
  run on Workers). Image resizing moves to the edge in Phase 8.
- Build scripts (see Gotchas for why each flag exists):
  ```json
  "cf:build":  "cross-env CI=true next build && cross-env CI=true opennextjs-cloudflare build --skipNextBuild",
  "cf:deploy": "pnpm cf:build && opennextjs-cloudflare deploy",
  "cf:ci:build":  "pnpm generate:importmap && pnpm cf:build",
  "cf:ci:deploy": "cross-env NODE_ENV=production payload migrate && wrangler deploy"
  ```
- **Patch `@opennextjs/cloudflare`** (via `pnpm patch`) to add
  `"cloudflare:sockets"` to the server bundle's esbuild `external` list, and add
  `serverExternalPackages: ['pg', 'pg-cloudflare']` to `next.config.ts`.
  Without both, the Postgres driver dies at runtime (see Gotchas #2).
- Keep any Payload jobs/tasks *registered* but remove `jobs.autoRun` (Workers
  has no persistent scheduler — re-add later via Cron Triggers).
- Verify `pnpm cf:build` ends with `Worker saved in .open-next/worker.js`, and
  grep the bundle to confirm `cloudflare:sockets` survived:
  `grep -c "cloudflare:sockets" .open-next/server-functions/default/*/handler.mjs`

**You do:** nothing yet.

## Phase 3 — Neon + Hyperdrive (database)

**You do:**
- Create a Neon project. Copy the **direct** connection string — the host
  **without `-pooler`**. (Hyperdrive does its own pooling; stacking it on
  Neon's PgBouncer causes trouble.)
- Create the Hyperdrive config and paste the returned id to Claude:
  ```sh
  npx wrangler hyperdrive create myapp-db \
    --connection-string="postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"
  ```

**Claude does:**
- Add the binding to the payload `wrangler.jsonc` and make
  `payload.config.ts` resolve the connection through it, falling back to
  `DATABASE_URL` for local dev:
  ```ts
  function resolveConnectionString(): string {
    try {
      const { env } = getCloudflareContext()
      const hd = (env as any).HYPERDRIVE
      if (hd?.connectionString) return hd.connectionString
    } catch { /* not on Workers */ }
    return process.env.DATABASE_URL || ''
  }
  // db: postgresAdapter({ pool: { connectionString: resolveConnectionString(), maxUses: 1 } })
  ```
  (`maxUses: 1` — Workers isolates requests; Hyperdrive does the pooling.)

## Phase 4 — R2 (media)

**You do:**
- Create an R2 bucket (`npx wrangler r2 bucket create myapp-media` works).
- Dashboard → R2 → **Manage R2 API Tokens** → create a token scoped to the
  bucket, Object Read & Write. Copy the Access Key ID + Secret (shown once).

**Claude does:**
- Point Payload's existing `s3Storage` adapter at R2 — env-only change:
  `S3_REGION=auto`, `S3_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com`,
  plus `forcePathStyle: true` in the adapter config.

## Phase 5 — Move the data

**You do:** fill in `apps/payload/.env` (gitignored) with the Neon direct URL,
the R2 credentials, and your **existing** `PAYLOAD_SECRET` (reuse the exact
Railway value or existing password hashes/sessions break).

**Claude does (pick one):**
- **Seed-based** (if your content lives in seed files): run
  `payload migrate` then the seed against Neon. If the seed uploads images
  through Payload, R2 gets populated in the same pass.
- **Dump-based** (real production data): `pg_dump` from Railway →
  `pg_restore` into Neon, then `payload migrate` to confirm sync; sync media
  objects with `aws s3 sync --endpoint-url <r2>`.
- Afterwards, **clear the dev-mode migration marker** (see Gotchas #4) or CI
  migrations will hang forever.

## Phase 6 — First deploy + secrets

**You do:** run the first deploy (creates the Worker — secrets can't be set
before it exists):
```sh
pnpm --filter payload cf:deploy
```

**Claude does:**
- Push all runtime secrets in one shot with `wrangler secret bulk` from a
  temp file built out of `.env` (never inline credentials in commands):
  `PAYLOAD_SECRET`, `S3_*`, `FRONTEND_URL`, `PAYLOAD_URL`.
  **Do NOT set `DATABASE_URL` as a Worker secret** — Hyperdrive provides it.
- Verify with curl: `/api/<collection>` returns rows (Neon through Hyperdrive),
  `/admin` returns 200, and a media file streams from R2.

Then deploy the frontend Worker the same way (`wrangler deploy`) and verify
pages render and images load through the proxy.

## Phase 7 — Git CI/CD

**You do (dashboard, per Worker → Settings → Builds):** connect the GitHub
repo and enter — these settings are **dashboard-only**; no repo file sets them:

| Setting | payload Worker | frontend Worker |
|---|---|---|
| Build branch | `main` | `main` |
| Root directory | `apps/payload` | `apps/frontend` |
| Build command | `pnpm cf:ci:build` | `pnpm build` |
| Deploy command | `pnpm cf:ci:deploy` | `npx wrangler deploy` |
| Build cache | On | On |
| Watch paths | `apps/payload/*`, `pnpm-lock.yaml`, `patches/*` | `apps/frontend/*`, `pnpm-lock.yaml` |
| Build env vars | `DATABASE_URL` (Neon direct), `PAYLOAD_SECRET` | — |

(The payload build env vars exist because `payload migrate` runs at deploy.)

**Claude does:** test the pipeline — push a scoped commit to each app and
confirm only that app rebuilds, and that a new deployment version appears.

## Phase 8 — Domains, hiding the CMS, image CDN

**You do:**
- Confirm both custom domains (`myapp.example.com`, `cms.example.com`) — Claude
  can add them as `routes: [{ pattern, custom_domain: true }]` in each
  `wrangler.jsonc`, but the zone must be on your account.
- Dashboard → zone → **Images → Transformations → Enable**.

**Claude does:**
- Add `"global_fetch_strictly_public"` to `compatibility_flags` on **both**
  Workers **before** attaching domains (see Gotchas #5 — skipping this takes
  the site down).
- Frontend images: emit
  `/cdn-cgi/image/w=<width>,f=auto,q=80/api/media/file/<name>` URLs — a small
  `<Img>` React component that builds a `srcset` across breakpoint widths
  (640/768/1024/1280/1536/2048) is all you need. `f=auto` serves AVIF/WebP per
  browser; results are edge-cached. Expect ~90–95% smaller images.
- Verify with curl: fetch a `/cdn-cgi/image/...` URL with
  `Accept: image/avif,image/webp` → expect `content-type: image/avif` and a
  small `content-length`, plus a `cf-resized` header.

## Phase 9 — Security hardening

**Claude does:**
- Security headers on every frontend response (HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, referrer + permissions policies) — in the
  Worker's response handling.
- `"workers_dev": false` on both Workers — one front door each. (Only after
  the custom domains are verified working, or you lock yourself out of admin.)
- **Delete Payload's GraphQL route files** (`src/app/(payload)/api/graphql*`)
  if unused — `graphQL: { disable: true }` alone does **not** 404 the endpoint.
- `"placement": { "mode": "smart" }` on the payload Worker (runs it near the
  DB region — Payload makes several sequential queries per request).
- `"observability": { "enabled": true }` on both Workers.
- Update `FRONTEND_URL` / `PAYLOAD_URL` secrets from localhost to the real
  domains (Payload uses them for CORS).

**You do (dashboard, ~10 min, all free):**
- **Cloudflare Access** in front of `cms.example.com/admin` (Zero Trust → Access
  → applications → allow your email) — kills brute-force on the admin login.
- **Early Hints** (zone → Speed) and a **rate-limiting rule** on `cms.../api/*`.

## Phase 10 — Cutover

**You do:**
1. Watch the Cloudflare setup for a few days (observability is on).
2. Re-enable scheduled jobs via **Cron Triggers** (`triggers.crons` in the
   payload `wrangler.jsonc` + a scheduled handler that runs the task).
3. **Delete the Railway services** — done.

---

## Gotchas (each of these cost real debugging time)

1. **Free plan = 3 MB Worker limit.** Payload's admin bundle is ~7 MB gzipped.
   Upgrade to Workers Paid *before* the first deploy attempt.
2. **The Postgres driver silently breaks on Workers.** `pg-cloudflare`'s
   `import('cloudflare:sockets')` gets stripped/stubbed at bundle time →
   runtime error `"X is not a constructor"` / "cannot connect to Postgres".
   Fix = all three of: build with **Turbopack** (webpack mangles the import),
   `serverExternalPackages: ['pg', 'pg-cloudflare']`, and the pnpm patch adding
   `cloudflare:sockets` to OpenNext's esbuild externals. Grep the built bundle
   for `cloudflare:sockets` before deploying.
3. **Neon: always give Hyperdrive the *direct* (non-pooler) connection string.**
   Also use the direct string for migrations/seeding — PgBouncer chokes on DDL.
4. **`payload migrate` hangs CI** if the database was ever touched by dev-mode
   push (seeding does this): a `{ name: 'dev', batch: -1 }` row in
   `payload_migrations` triggers an interactive prompt with no TTY. Delete that
   row once and run CI migrations with `NODE_ENV=production`.
5. **Error 1042 outage:** once both Workers share a zone (custom domains), any
   same-zone fetch during SSR/proxying is blocked by Cloudflare → whole-page
   failures. Add the `global_fetch_strictly_public` compatibility flag. Side
   effect: `*.workers.dev` stops rendering (it's non-public) — fine, since the
   custom domain is canonical.
6. **Watch paths:** entries without a wildcard are exact-file matches — a bare
   `apps/payload` matches nothing and silently disables all builds. Use
   `apps/payload/*`, and include root-level `pnpm-lock.yaml` + `patches/*` for
   the payload app or dependency/patch changes won't rebuild.
7. **Secrets need the Worker to exist** — first deploy, then
   `wrangler secret put/bulk`. Expect 500s between those two steps.
8. **`wrangler secret` ≠ bindings.** Hyperdrive/R2/service-binding ids belong in
   `wrangler.jsonc` (they're not secrets — the credentials live server-side in
   the binding). Only actual secret *values* go through `wrangler secret`.
9. **`CI=true` on pnpm builds** — pnpm aborts `node_modules` purges without a
   TTY, which breaks OpenNext's packaging step locally.
10. **Verify with cache-busted requests.** SWR/edge caches will happily serve a
    healthy-looking stale page while fresh renders 500 — every post-deploy check
    should hit `?cb=<timestamp>` URLs before you declare success.

## Prompts to hand Claude, phase by phase

> 1. "Prep `apps/payload` for Cloudflare Workers via OpenNext: remove sharp,
>    standalone output, cf build scripts, and make sure the pg driver's
>    cloudflare:sockets import survives bundling."
> 2. "Wire payload.config to a HYPERDRIVE binding with DATABASE_URL fallback;
>    here's the Hyperdrive id: …"
> 3. "Point the s3Storage adapter at R2 and update .env.example."
> 4. "Migrate the data to Neon and media to R2, then verify."
> 5. "Push the Worker secrets from .env (not DATABASE_URL) and verify the API,
>    admin, and media endpoints."
> 6. "Add a media + API proxy to the frontend Worker over the BACKEND service
>    binding so the CMS URL is never exposed."
> 7. "Enable the image CDN: /cdn-cgi/image URLs with f=auto and a responsive
>    srcset component."
> 8. "Run a security pass: headers, workers_dev off, delete GraphQL routes,
>    smart placement, observability, CORS secrets."
