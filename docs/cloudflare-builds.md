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

- `cf:ci:build` = `generate:importmap` → Turbopack build → OpenNext bundle.
- `cf:ci:deploy` = `payload migrate` (NODE_ENV=production) → `wrangler deploy`.

## Frontend — `soyboy-frontend`

| Setting | Value |
|---|---|
| Git repo | `patelsaajan/soyboy` |
| Build branch | `main` |
| Root directory | `apps/frontend` |
| Build command | `pnpm build` |
| Deploy command | `npx wrangler deploy` |
| Build cache | On |
| Watch paths | **leave blank** (see note) |

No build env vars required (the frontend fetches Payload at runtime; images
resolve via `PAYLOAD_URL` in `runtimeConfig`).

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
