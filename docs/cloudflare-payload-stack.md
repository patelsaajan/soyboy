# The Cloudflare + Payload stack

How this repo is put together, and — more usefully — *why*. Most of what follows
is a rule that exists because breaking it broke production somewhere, on this
site or on one of its siblings.

## Parity with the sibling repos

Three other repos run this same stack:

| Repo | Frontend | Notes |
| --- | --- | --- |
| `smf-studio/payload-cloudflare-starter` | Vite + React, prerendered | The clone-me template |
| `smf-studio/bryans-motorcycle-school` | Vite + React, prerendered | |
| `smf-studio/karagama-ent-1` | Vite + React, prerendered | |
| `personal/soyboy` (this repo) | **Nuxt 4, server-rendered** | |

**An infrastructure fix belongs in all of them.** The parts that are genuinely
shared — the two-Worker topology, the service binding, Hyperdrive and
`maxUses: 1`, the migrations-only rule, the seed guards, purge-on-publish, the
sync contract — are the same idea implemented against a different renderer, and
a bug found in one is a bug in the others.

The parts that are legitimately different are listed under
[Where soyboy differs](#where-soyboy-differs). Anything not on that list should
match.

## Architecture

Two Workers on the same zone, pointing at each other:

```
                      soyboy.saajanpatel.co.uk
                                 │
                    ┌────────────▼────────────┐
   ASSETS binding ──▶   soyboy-frontend       │   Nuxt 4 on Nitro
   (public/, _nuxt/)│   SSR + JSON endpoints  │
                    └────────────┬────────────┘
                                 │ BACKEND service binding
                                 │ (Cloudflare's internal network —
                                 │  no public hop, no egress cost)
                    ┌────────────▼────────────┐
                    │   soyboy-payload        │   Payload 3 on Next 16,
                    │   admin + REST API      │   via OpenNext
                    └──────┬───────────┬──────┘
                           │           │
                    HYPERDRIVE      R2 bucket
                    (pooling)       (uploads)
                           │
                     Neon Postgres
```

The load-bearing detail is that **the CMS has no public route the site depends
on**. `cms.soyboy.saajanpatel.co.uk` exists so a human can reach the admin
panel; every request the *site* makes travels over the `BACKEND` service
binding. Two things follow:

- The Payload origin never appears in the browser — not in a URL, not in an
  image `src`, not in a preload hint.
- Everything public is served from `soyboy.saajanpatel.co.uk`, which means
  everything public is on one zone, which means everything public is
  **purgeable**. Content served from the CMS hostname would not be.

That second point is why the media proxy exists (`/api/media/file/**`) rather
than linking uploads at their Payload URL. It is not decoration.

## Repo layout

```
apps/
├── frontend/    Nuxt 4 site + JSON endpoints (soyboy-frontend)
└── payload/     Payload CMS 3 on Next 16 (soyboy-payload)

packages/
├── shared/            The cache/purge contract — imported by BOTH apps
├── eslint-config/     Shared ESLint presets
├── typescript-config/ Shared tsconfig presets
└── ui/                Unused leftover from create-turbo
```

`packages/shared` is small and load-bearing. See
[The sync contract](#the-sync-contract).

### `pnpm-workspace.yaml`

Four settings there are not defaults and each one is doing a job:

- **`minimumReleaseAge: 1440`** — a package version must be 24h old before it is
  installable. Supply-chain compromises are almost always caught within hours of
  publish, so never being first to install is most of the defence. If
  `pnpm add` appears to succeed without installing, this is usually why.
- **`blockExoticSubdeps: true`** — refuses transitive dependencies resolving to
  git/tarball/file URLs via someone else's package.
- **`allowBuilds`** — pnpm blocks lifecycle scripts by default. `workerd` is the
  one that matters: its postinstall unpacks the ~115MB Workers runtime, and
  without it anything that runs a Worker locally fails. If an install prints
  `Ignored build scripts: workerd`, this list did not apply.
- **`patchedDependencies`** — see below.

### The OpenNext patch

`patches/@opennextjs__cloudflare@1.20.1.patch` marks `cloudflare:sockets`
external in OpenNext's esbuild pass. Without it the dynamic import that lets the
Postgres driver use workerd's TCP sockets is mangled, and **the deployed Worker
cannot reach the database at all** — while everything builds and deploys
cleanly. Re-check this on every `@opennextjs/cloudflare` bump; the version is
pinned in the patch filename precisely so a bump cannot silently drop it.

## Payload on Workers

### Build and bundling

`next.config.ts` carries four things that are not optional:

- `output: 'standalone'` — OpenNext needs it, and because the `cf:*` scripts run
  `next build` themselves with `--skipNextBuild`, OpenNext's automatic injection
  never happens.
- `outputFileTracingRoot` pointed at the monorepo root, so file tracing resolves
  workspace dependencies.
- `serverExternalPackages: ['sharp', 'pg', 'pg-cloudflare']` — webpack resolves
  `pg-cloudflare` to its `node`/`default` export, an empty stub, which breaks
  the Cloudflare socket at runtime (`b2 is not a constructor`). Left external,
  OpenNext bundles them under the `workerd` condition with the real socket.
- `images.unoptimized` — Next's optimiser needs sharp, which cannot run on
  workerd.

**sharp is deliberately absent** from `payload.config.ts`. Do not reintroduce it
as a conditional `await import()`: the bundler turns that into a hashed external
chunk OpenNext's esbuild pass cannot resolve. Resizing happens at the edge via
Cloudflare Transformations instead.

### Environment

`payload.config.ts` validates `process.env` with zod at module scope, so a
missing or half-configured variable fails the *build* rather than surfacing as a
broken admin panel. Two rules encoded there:

- **`PAYLOAD_SECRET` must exist at build time**, not just runtime — the config is
  imported during `next build`.
- **The `S3_*` group is all-five-or-none.** A partial set silently falls back to
  local disk, and on Workers that means uploads that appear to save and then
  cannot be read back.

### Runtime detection

```ts
const inWorkerd = globalThis.navigator?.userAgent === 'Cloudflare-Workers'
```

Detected from the runtime, never from an env var, because it must be **false in
every Node process including `next build`**. In Node, `getCloudflareContext()`
boots a Miniflare instance via wrangler's platform proxy; `next build` collects
page data in parallel workers that each import the config, each spins up its own
workerd against the same `.wrangler/state` SQLite, and they deadlock:

```
Fatal uncaught kj::Exception: ... database is locked: SQLITE_BUSY
```

### Database: Postgres through Hyperdrive

Inside the Worker the connection string comes from the `HYPERDRIVE` binding;
everywhere else from `DATABASE_URL`. Hyperdrive must point at Neon's **direct**
(non-pooled) string — it does the pooling itself.

`maxUses: 1` is applied **only** when Hyperdrive supplied the connection.
workerd forbids reusing a TCP socket opened during one request in a later one,
so an idle pooled connection handed to the next request dies with

```
Cannot perform I/O on behalf of a different request   (error 1101)
```

or simply hangs. Hyperdrive does the real pooling upstream, so throwing the
connection away is cheap. Applying it in local dev is not — there it just
discards working connections, which is why it is conditional.

### Schema changes: migrations only, never dev push

```ts
push: isLocalDatabase(connectionString),
```

Drizzle's dev schema push may only ever touch a database on `localhost`. Without
that gate, **any** dev-mode process that calls `getPayload()` — the seed, a
one-off `tsx` script, `next dev` with the wrong `DATABASE_URL` — pushes schema
straight at whatever the connection string names, and leaves a `batch = -1` row
in `payload_migrations` that makes every later `payload migrate` prompt instead
of migrating, stalling deploys.

There are two independent levers on that door, on purpose:

1. `push: isLocalDatabase(...)` — gates on the *target*.
2. `NODE_ENV=production` in the seed scripts — gates on the *mode*.

The same "is this local?" test also gates the seed runner and the integration
tests, both of which boot a real Payload instance against whatever `.env`
contains.

`src/lib/localDatabase.ts` is the single definition of "local", because two
lists of hostnames drift and the drift is silent.

Remote schema changes go through `pnpm db:migrate:create` → commit the migration
→ deploy, which runs `payload migrate` before `wrangler deploy`.

### Seeding

`pnpm db:seed` runs `src/seed/run.ts`, which **refuses to seed a non-local
`DATABASE_URL`** unless passed `--allow-remote`. That guard is on the target,
not on which npm script was typed, because the realistic failure is an `.env`
left pointing at Neon after a debugging session — and this repo's `.env` has
been in exactly that state.

`pnpm db:seed:prod` is the deliberate path: it prints the host, database and
user, takes a typed confirmation, clears the purge credentials so one seed does
not fire hundreds of purges, and pins `NODE_ENV=production`.

## The frontend Worker

Nuxt 4 on Nitro, `cloudflare_module` preset. Requests for `public/` and
`_nuxt/` are answered by the ASSETS binding before the Worker runs — which is
why their headers come from `routeRules` (compiled into
`.output/public/_headers`) and not from the cache plugin, which never sees them.

### Talking to Payload

`server/utils/payload.ts` prefers the `BACKEND` service binding and falls back
to HTTP via `PAYLOAD_URL` when there isn't one (local dev, any non-Workers
host). The binding ignores the hostname, so `https://backend${path}` is fine —
only path and query reach the Payload Worker.

**That also means the binding bypasses anything protecting the public CMS
hostname.** Every value interpolated into an upstream path is validated first:
recipe slugs against the shape the CMS generates, upload paths against a
no-traversal pattern. Cloudflare's edge happens to normalise `../` today; that
is not a safe place to put a traversal guard.

The media proxy additionally refuses to return anything that is not
`image|video|audio/*`, so it can never serve `text/html` from the site's own
origin, and returns a flat 404 rather than forwarding the upstream status —
403-vs-404 is an oracle for internal CMS state.

## Edge caching and purge-on-publish

### The one cache layer

`server/plugins/edge-cache.ts` wraps Nitro's `localFetch` and stores cacheable
GET responses in `caches.default` with a `Cache-Tag`.

There is exactly **one** cache layer and this is it. That is a rule, not an
accident:

- Nitro's own cache (`defineCachedEventHandler`, `routeRules.swr`) lives in
  Nitro storage, which on Workers defaults to **per-isolate memory**. Not shared
  between colos, not shared between isolates, and not reachable by Cloudflare's
  purge API. This repo shipped with `/recipes/**` on a seven-day `swr` and no
  way to make an edit appear early; changes landed whenever an isolate recycled.
- `caches.default` is the cache a zone-level purge clears.

A second, unpurgeable TTL in front of a purgeable one means the purge stops
working and **nothing reports it**. So the Nitro layer was removed rather than
supplemented.

Why `localFetch` and not a Nitro hook: it is the one seam that both receives the
original `Request` (the cache key a purge names) and returns a finished
`Response` (the bytes to store). `beforeResponse` sees the handler's return
value before serialisation, which would mean caching a guess at what Nitro is
about to send.

Headers:

```
Cache-Control: public, max-age=0, must-revalidate, s-maxage=86400, stale-while-revalidate=86400
```

`max-age=0, must-revalidate` is the browser half and is deliberate: a private
copy in one visitor's browser cannot be purged, so personal caches revalidate
and the shared edge — which *is* purgeable — does the work. Uploads are the one
exception (`public, max-age=31536000, immutable`), because Payload gives a
colliding filename a new suffix rather than overwriting, so their bytes genuinely
never change.

`x-edge-cache: HIT|MISS` is on every cacheable response. It is the only way to
answer "is the cache working?" without timing requests and guessing.

### Purge-on-publish

`apps/payload/src/hooks/purgeFrontendCache.ts` fires on `afterChange` and
`afterDelete` for every publicly-read collection and global, spread in as
`publishHooks` from `hooks/onPublish.ts`.

**Freshness comes from the purge, never from the TTL.** If edits start taking a
day to appear, the purge is broken — fix that. Shortening the lifetime trades
away the hit rate without fixing anything and hides the fault.

The hook:

- Names **exact URLs**. The zone hosts other sites, so `purge_everything` is not
  an option.
- Enumerates recipe slugs and upload filenames from the database, because those
  are not a fixed list.
- Adds `stalePaths` — this document's URLs *before* the change as well as after,
  which is what catches a renamed slug whose old page is still cached.
- Also purges by tag, which catches URLs that did not exist when the list was
  built (a brand-new recipe).
- **Never throws.** A failed purge must not fail a save; the TTL backstops it and
  saving again retries. Both outcomes are logged — without a success line there
  is no way to tell a working purge from a silently dead one.

A `cache.delete()` from inside a Worker would clear only the colo that Worker
happens to be in. Only the zone API clears them all.

### Purge-on-deploy

Publishing is not the only event that invalidates a cached page. A **deploy**
does too, and for a reason that has nothing to do with content: the HTML names
its CSS and JS by content hash (`/_nuxt/entry.<hash>.css`), and a deploy replaces
the whole asset manifest. Every hash that changed stops existing the moment the
new Worker goes live.

So a page cached before the deploy is served after it against an asset set that
no longer contains what it asks for. The assets binding answers 404 with an empty
body and **no `Content-Type`**, `X-Content-Type-Options: nosniff` turns that into
a hard block, and the site renders unstyled — for the full 24h TTL, with nothing
in the Worker logs, because the Worker is never reached.

`apps/frontend/scripts/purge-cache.ts` closes it, run by `pnpm cf:ci:deploy`
immediately after `wrangler deploy`. It builds its URLs from the same
`@soyboy/shared` contract, and — having no database — reads recipe slugs back
from the site's own `/api/recipes/all`, which it purges first so the answer is a
fresh render through the build that just shipped. Uploads are left alone: their
bytes are immutable and a deploy does not touch them.

Unlike the CMS hook it **fails the build red**, because the deploy has already
succeeded by then and a stale-HTML site is precisely the failure that otherwise
goes unnoticed for a day. The one exception is missing credentials, which warns
and exits 0.

### The sync contract

`packages/shared/src/cache-contract.ts` is the single definition of every
cacheable URL. Both apps import it.

A Cloudflare purge matches its cache key **exactly**. If the frontend serves
`/api/recipes/all` and the purge asks for `/api/recipes`, the purge misses
forever and nothing errors. Query parameter *order* is part of the key too.
Keeping two hand-written lists in step is the failure mode that rots silently,
so there is only ever one string.

`apps/frontend/server/utils/cache.test.ts` asserts the invariant directly: every
path the edge will cache is a path the purge can name.

### Manual setup this depends on

Two things live in the Cloudflare dashboard and cannot be inferred from the repo:

1. **A cache-purge API token**, stored as the `CF_CACHE_PURGE_TOKEN` secret on
   `soyboy-payload`. It needs exactly one permission: *Zone → Cache Purge →
   Purge*, scoped to this zone. Nothing else.
2. **`CF_ZONE_ID`**, from the zone's dashboard overview.

Both are needed in **two** places: as runtime values on `soyboy-payload` (for
purge-on-publish) and as Workers Builds environment variables on
`soyboy-frontend` (for purge-on-deploy) — see `docs/cloudflare-builds.md`. The
same token serves both.

Without them the purge no-ops — silently in the CMS hook, because that is the
correct behaviour in local dev and in the seed; loudly in the deploy script,
because a deploy that skips the purge ships a broken site. Check the Worker logs
for `frontend cache purged: N URLs` after an edit, and the build log for
`frontend cache purged on deploy: N URLs` after a push, to confirm both are
live.

### Image transformations

`@nuxt/image` rewrites sources to `/cdn-cgi/image/<opts>/<src>` on the custom
domain, with the media proxy as the source so the Payload URL stays private.
This needs **Image Transformations enabled on the zone** plus the
`global_fetch_strictly_public` compatibility flag (already in
`apps/frontend/wrangler.jsonc`) — without the flag, same-zone fetches loop back
internally and fail with Cloudflare error 1042.

## CI — Workers Builds

Both Workers build from Git. The build command, deploy command and watch paths
are **dashboard-only settings**; `wrangler.jsonc` is not consulted for them. See
[cloudflare-builds.md](cloudflare-builds.md) for the values to enter.

`.github/workflows/ci.yml` runs lint, typecheck and build on every push and PR.
It does not deploy.

## Operations runbook

### Verify caching on prod

```bash
curl -sS -o /dev/null -D - https://soyboy.saajanpatel.co.uk/recipes
```

Use GET. `curl -I` sends HEAD, which is deliberately not cached, and will
mislead you. Look for `x-edge-cache: HIT` on the second request.

### Confirm purge is wired up

Edit any recipe in the admin panel, save, then check the Worker logs:

```bash
npx wrangler tail soyboy-payload --format pretty
```

`frontend cache purged: N URLs + tag soyboy-content` means it worked.
`frontend cache purge failed: …` or nothing at all means it did not.

### Manual purge

Cloudflare dashboard → Caching → Configuration → Purge by tag:
`soyboy-content`.

### Local development

```bash
pnpm db:up          # Postgres on :5432
pnpm db:migrate     # apply migrations
pnpm db:seed        # refuses a non-local DATABASE_URL
pnpm dev            # frontend :4000, CMS :3000
```

The edge cache is inert locally — `caches.default` only exists inside workerd.
Use `wrangler dev` against `.output/` to exercise it.

### Before calling a change done

```bash
pnpm check     # typecheck + lint across the workspace
pnpm test      # needs pnpm db:up, and a LOCAL DATABASE_URL — the CMS's
               # integration tests refuse a remote target
pnpm build
```

## Where soyboy differs

Deliberate divergences from the sibling repos. Everything **not** on this list
should match them.

| | Siblings | Soyboy | Why |
| --- | --- | --- | --- |
| Frontend | Vite + React SPA, prerendered | Nuxt 4 SSR | Pre-existing; converting it would be a rewrite, not an upgrade |
| Rebuild-on-publish | Deploy-hook trigger alongside the purge | **None** | Nothing is baked at build time — pages, `<head>` tags and the sitemap are all rendered per request, so there is nothing a rebuild would refresh. **If a prerendered route is ever added, the rebuild hook has to arrive in the same commit.** |
| Cache implementation | Hand-written Worker with an allowlist proxy | Nitro `localFetch` wrapper | Same behaviour — allowlist, `caches.default`, `Cache-Tag` — against a different runtime |
| Local Postgres port | 5429 (bms), 5439 (starter) | 5432 | Each project needs its own; these three collide otherwise |
| S3 bucket env var | `S3_BUCKET` | `S3_BUCKET_NAME` | Already deployed under this name; renaming means re-setting a live Worker secret for no gain |
| Rich text | Lexical, serialised in the frontend | Plain text/textarea fields | The content model never needed it |

## Production incidents, and the rules they set

| Symptom | Cause | Rule |
| --- | --- | --- |
| Worker cannot reach the database, builds fine | OpenNext mangled `cloudflare:sockets` | Keep the patch; re-verify on every bump |
| `Cannot perform I/O on behalf of a different request` | Pooled connection reused across requests | `maxUses: 1` under Hyperdrive |
| `SQLITE_BUSY` during `next build` | Parallel builds each booting workerd | Gate on `inWorkerd`, never an env var |
| Deploys stall at `payload migrate` | A dev push left `batch = -1` | Never dev-push a remote database |
| Uploads save but 404 on read | Partial `S3_*` config fell back to local disk | All five or none, enforced by zod |
| Admin edits rejected as "not allowed" | `serverURL` missing from the CSRF list | Keep `csrf` = origins + `serverURL` |
| Content changes not appearing | Cache in Nitro storage, unpurgeable | One cache layer, in `caches.default`, purged on publish |
| Site renders unstyled, `/_nuxt/*.css` blocked for MIME type `""` | Day-old cached HTML naming asset hashes a deploy had replaced | Purge the edge cache on deploy as well as on publish |
