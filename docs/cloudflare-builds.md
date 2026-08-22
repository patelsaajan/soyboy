# Cloudflare Workers Builds — settings reference

⚠️ These are **dashboard-only** settings. Cloudflare Workers Builds does **not**
read the build command, deploy command, or watch paths from any repo file
(`wrangler.jsonc` is not honored for this — see
[workers-sdk#10802](https://github.com/cloudflare/workers-sdk/issues/10802)).
This file just records what to enter in the dashboard so it's version-controlled.

Set per Worker under: **Workers & Pages → <worker> → Settings → Builds**.

## Backend — `soyboy-payload`

| Setting | Value |
|---|---|
| Git repo | `patelsaajan/soyboy` |
| Build branch | `main` |
| Root directory | `apps/payload` |
| Build command | `pnpm cf:ci:build` |
| Deploy command | `pnpm cf:ci:deploy` |
| Build cache | On |
| Watch paths | **leave blank** (see note) |

**Build environment variables** (Settings → Builds → Variables) — needed because
`cf:ci:deploy` runs `payload migrate`:

| Var | Value |
|---|---|
| `DATABASE_URL` | Neon **direct** connection string (no `-pooler`) |
| `PAYLOAD_SECRET` | same value as the runtime `wrangler secret` |
| `PAYLOAD_URL` | `https://cms.soyboy.saajanpatel.co.uk` |
| `FRONTEND_URL` | `https://soyboy.saajanpatel.co.uk` |

`PAYLOAD_URL` and `FRONTEND_URL` are needed **here as well as at runtime**, and
`payload.config.ts` now refuses to build in production without them. `serverURL`
is baked into the admin's client bundle by `next build`, and Workers Builds
cannot see `wrangler secret` values — so a runtime-only value ships an admin
panel that points at `http://localhost:3000`, whose images the CSP blocks and
whose saves fail CSRF. They are public URLs, so set them as plain **vars** in
both places; a var and a secret of the same name collide on deploy, so delete any
leftover secret of that name first.

- `cf:ci:build` = `cf:build` = `generate:importmap` → `next build --turbopack` → OpenNext bundle.
- `cf:ci:deploy` = `cf:migrate` (`NODE_ENV=production`, confirmation pre-supplied
  via `CONFIRM=migrate`) → `wrangler deploy`. Migrations run before the new code
  goes live, so it never meets an older schema; `payload migrate` is idempotent.

## Frontend — `soyboy-frontend`

| Setting | Value |
|---|---|
| Git repo | `patelsaajan/soyboy` |
| Build branch | `main` |
| Root directory | `apps/frontend` |
| Build command | `pnpm build` |
| Deploy command | `pnpm cf:ci:deploy` |
| Build cache | On |
| Watch paths | **leave blank** (see note) |

**Build environment variables** (Settings → Builds → Variables) — needed because
`cf:ci:deploy` purges the edge cache after shipping:

| Var | Value |
|---|---|
| `CF_ZONE_ID` | `4cd23c61040cbc255c1b88be7a81a985` (same zone as the CMS) |
| `CF_CACHE_PURGE_TOKEN` | **encrypted** — same token as the runtime secret on `soyboy-payload` |

Nothing else is required at build time (the frontend fetches Payload at runtime;
images resolve via `PAYLOAD_URL` in `runtimeConfig`).

- `cf:ci:deploy` = `wrangler deploy` → `purge:cache`
  (`apps/frontend/scripts/purge-cache.ts`). The purge runs *after* the deploy,
  because it has to invalidate HTML against the asset set that is now live.
- **Without the two variables above the deploy still succeeds and prints a
  warning** — and cached pages keep pointing at `/_nuxt/*` hashes this build
  replaced, which the assets binding answers with a bare 404 and `nosniff` turns
  into an unstyled site for the full 24h TTL. Set them.

## Note on watch paths

Leave watch paths **blank** = build on every push to the build branch. Reasons:

1. Cloudflare evaluates watch paths **relative to the root directory**, so an
   `apps/payload` path becomes `apps/payload/apps/payload/…` and matches nothing
   — this is what silently blocked builds during setup.
2. `pnpm-lock.yaml`, `patches/` and `packages/shared` live outside each app's
   root directory — a scoped watch path can't watch them, so a dependency
   change, an OpenNext-patch change, or an edit to the shared cache contract
   wouldn't rebuild. Blank avoids that footgun.

   `packages/shared` matters most: it is imported by *both* Workers, so a change
   there must rebuild both. If only one rebuilds, the frontend serves URLs the
   CMS no longer purges — the exact silent failure the shared package exists to
   prevent.
