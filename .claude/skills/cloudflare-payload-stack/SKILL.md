---
name: cloudflare-payload-stack
description: Use when working on this Payload CMS + Nuxt site deployed as two Cloudflare Workers — the Nitro site Worker and the OpenNext CMS Worker. Covers the edge cache and purge-on-publish contract in packages/shared, the service-binding boundary, Hyperdrive/pg gotchas, the OpenNext bundling chain, and the migrations-only rule. Load it before changing a cached route, a collection, a wrangler config, a build script, or anything about caching.
---

# The Cloudflare + Payload stack (soyboy)

The full reference is `docs/cloudflare-payload-stack.md`. This skill is the
working subset: the invariants that break silently, and the rules that come from
them.

## The architecture in one picture

```
browser ─▶ soyboy-frontend ─▶ caches.default ─▶ BACKEND binding ─▶ soyboy-payload ─▶ Hyperdrive ─▶ Neon
            (Nitro SSR)        (the ONE cache)                          │
                                     ▲                                  │
                                     └──── zone purge API ◀── afterChange
```

Two principles everything else serves:

1. **The CMS origin is never exposed to the browser.** All CMS traffic crosses
   the `BACKEND` service binding — including uploads, which is why
   `/api/media/file/**` exists rather than linking Payload's `url`.
2. **Only one cache layer holds content — the one we can purge.**

## Rule 1 — the sync contract lives in `packages/shared`

A Cloudflare purge matches its cache key **exactly**, query-parameter order
included. If the site serves `/api/recipes/all` and the purge asks for
`/api/recipes`, the purge misses **forever**, with no error anywhere.

So both apps import `packages/shared/src/cache-contract.ts`. There is only one
string.

**Adding a cacheable route means editing `cache-contract.ts` first**, then
`edgeCacheControl` in `apps/frontend/server/utils/cache.ts`. The test
`caches only URLs the purge hook can name` fails if the two fall apart.

`edgeCacheControl` is an **allowlist**, deliberately not derived from the
contract: widening what the edge will store should be a conscious act. A new
route is uncached until someone decides otherwise — an over-cached personalised
response is a data leak; an under-cached one is a slow page.

## Rule 2 — freshness comes from purging, never from the TTL

```
Cache-Control: public, max-age=0, must-revalidate, s-maxage=86400, stale-while-revalidate=86400
```

- **`max-age=0` is load-bearing.** A purge cannot reach a copy in a visitor's
  browser cache, so browsers must not keep one.
- `s-maxage=86400` is the **backstop for a missed purge**. If edits start
  appearing slowly, the purge path is broken — fix that. **Never shorten the TTL
  to make edits appear faster**; it costs the hit rate and hides the fault.

Uploads are the one exception (`max-age=31536000, immutable`) because a colliding
filename gets a new suffix rather than overwriting, so a URL's bytes never
change.

## Rule 3 — exactly one cache layer, and it is `caches.default`

`server/plugins/edge-cache.ts` wraps Nitro's `localFetch`. Do **not** reach for
`defineCachedEventHandler` or `routeRules.swr` — Nitro's cache storage on
Workers is per-isolate memory: not shared between colos, not shared between
isolates, and **not reachable by the purge API**. That is what this repo shipped
with, and it is why `/recipes/**` sat behind a seven-day TTL with no way to make
an edit appear early.

A second unpurgeable TTL in front of a purgeable one means the purge stops
working and nothing reports it.

`localFetch` is the seam because it both receives the original `Request` (the
cache key a purge names) and returns a finished `Response` (the bytes to store).
`beforeResponse` sees the handler's return value *before* serialisation, so
caching there means caching a guess.

`CACHE_TAG` must be one string, imported. A rename that misses a copy kills the
tag purge silently.

## Rule 4 — purge by exact URL, never `purge_everything`

The zone hosts other sites. A `Cache-Tag` purge goes alongside because
Cloudflare documents URL purge as unreliable for Workers Cache API entries, and
because a brand-new recipe has a URL no list could have predicted.

**`cache.delete()` inside a Worker is not a purge** — it clears the one colo that
instance runs in. Cloudflare caps single-file purge at **30 URLs per request**;
the hook chunks.

Purging must also name the document's *previous* URLs (`stalePathsFor`), or a
renamed slug leaves its old page cached for a day.

## Rule 5 — hooks are fail-soft and log both outcomes

A failed purge must never fail an editor's save; the TTL backstops it.

- No-op silently when `CF_ZONE_ID`/`CF_CACHE_PURGE_TOKEN` are absent (local dev,
  seeds).
- `AbortSignal.timeout(5_000)` — a hanging purge must not hang a save.
- Log failures **and successes**. Without a success line you cannot tell a
  working purge from a silently dead one.

Every publicly-read collection and global spreads `publishHooks` /
`publishGlobalHooks` from `apps/payload/src/hooks/onPublish.ts`. One that the
site reads but nobody purges is a stale-content bug waiting to happen.

**Soyboy has no rebuild-on-publish hook**, unlike the sibling repos — nothing is
baked at build time here. If a prerendered route is ever added, the rebuild hook
has to arrive in the same commit.

## Rule 6 — cache only what is safe to share

GET only (not HEAD — it would make `curl -I` misleading). Only status 200. Strip
`Set-Cookie`. Key on the URL with no cookie in the key, which is valid **only**
because no authenticated traffic crosses this hostname — the admin panel is on
its own domain. If that stops being true, this rule changes.

## Rule 7 — the service binding bypasses your hostname's defences

`backend.fetch()` reaches the Payload Worker directly, past anything protecting
`cms.soyboy.saajanpatel.co.uk`. So every value interpolated into an upstream
path is validated **before** the call: slugs against the shape the CMS
generates, upload paths against a no-traversal pattern. Cloudflare's edge
happens to normalise `../` today; that is not a safe place to put a traversal
guard.

The media proxy also refuses any content-type that is not `image|video|audio/*`
(so it can never serve `text/html` from the site's origin) and returns a flat
404 rather than forwarding upstream status (403-vs-404 is an oracle for internal
CMS state).

## Rule 8 — the OpenNext bundling chain

If Postgres works locally but not deployed, suspect this chain first:

- `output: 'standalone'` + `outputFileTracingRoot` at the **workspace root**.
- `serverExternalPackages: ['sharp', 'pg', 'pg-cloudflare']` — otherwise the
  bundler inlines the `pg-cloudflare` stub and you get
  `b2 is not a constructor` at runtime.
- The **`patches/@opennextjs__cloudflare@*.patch`** marking `cloudflare:sockets`
  external. **Re-check on every adapter bump.** Without it everything builds and
  deploys cleanly and the Worker simply cannot reach the database.
- `nodejs_compat` with a compatibility date ≥ 2024-09-23.

Plus two runtime rules:

- **`maxUses: 1`** on the pg pool, **only** when Hyperdrive supplied the
  connection. workerd forbids reusing a socket across requests — classic pooling
  gives intermittent error 1101 and hangs. Applying it in local dev just discards
  working connections.
- The **`inWorkerd` guard** (`globalThis.navigator?.userAgent ===
  'Cloudflare-Workers'`) stays runtime-detected, never env-driven: it must be
  false during `next build`, or parallel page-data workers each boot their own
  workerd and fight over `.wrangler/state` (`SQLITE_BUSY`).

## Rule 9 — Payload conventions

- **Schema changes go through migrations only.** Dev-mode `getPayload()` pushes
  schema to whatever `DATABASE_URL` points at and leaves a sticky `batch = -1`
  row that makes every later `payload migrate` prompt and exit 0 — silently
  skipping migrations on a TTY-less deploy. Three guards, none of them
  removable: `push: isLocalDatabase(...)` in `payload.config.ts`,
  `NODE_ENV=production` in the seed scripts, and `run.ts` refusing a non-local
  target without `--allow-remote`. One definition of "local" lives in
  `src/lib/localDatabase.ts` — note `new URL(...).hostname` gives `[::1]` with
  brackets for IPv6 loopback.
- **This repo's `.env` has pointed at production Neon.** Assume it still might.
  Never run a dev-mode Payload process without checking, and never override
  `DATABASE_URL` casually.
- **Any collection change needs a migration in the same commit** —
  `pnpm db:migrate:create` — or the deploy ships code against an older schema.
  (Note: `required: true` on a field of a drafts-enabled collection is validated
  in the application layer and does *not* change the Postgres schema.)
- **All `@payloadcms/*` packages on the exact same version.** A mismatch gives a
  duplicate `@payloadcms/ui` and a separate React context, surfacing as a
  client-only admin error with nothing in the Worker logs.
- **Register plugins unconditionally, gate with `enabled`.** Conditionally
  excluding the S3 plugin makes `generate:importmap` omit its client component,
  and the deployed admin warns that `S3ClientUploadHandler` is missing.
- **`serverURL` must be in the `csrf` list**, or every admin edit fails with
  "You are not allowed to perform this action".
- **Every recipe needs a slug** (`src/fields/slug.ts`). A recipe reachable only
  by numeric id is a page the purge hook cannot name. Slugs are derived on first
  save and never auto-updated — retitling must not move a published URL.
- **`sharp` is never wired up** — and never as a conditional `await import()`,
  which the bundler turns into a hashed chunk esbuild cannot resolve.

## Rule 10 — three repos, one stack

`payload-cloudflare-starter`, `bryans-motorcycle-school` and `karagama-ent-1`
run the same infrastructure with a React frontend. **An infrastructure fix
belongs in all of them.** The legitimate differences are tabulated in
`docs/cloudflare-payload-stack.md` → *Where soyboy differs*; anything not on
that list should match.

---

## Before calling a change done

```bash
pnpm check     # typecheck + lint, every package
pnpm test      # needs `pnpm db:up` first
pnpm build
```

Then verify against **prod, not typechecks** — the interesting failures only
exist in the deployed system:

```bash
# GET, not HEAD: HEAD is deliberately uncached and will mislead you.
curl -sS -o /dev/null -D - https://soyboy.saajanpatel.co.uk/recipes \
  | grep -iE 'cache-control|x-edge-cache|cf-cache-status|^age'

npx wrangler tail soyboy-payload --format pretty   # watch the purge log while editing
```

Expect `x-edge-cache: HIT` on the second request; then edit in `/admin` and
expect `frontend cache purged: N URLs + tag soyboy-content` in the tail, and the
new value on the next request.

**A purge you have not watched work is a purge that does not work.**

## Working rules for changes here

- **Encode cross-file contracts as one artifact**, not paired comments —
  `cache-contract.ts` exists because two hand-maintained lists rot silently.
- **When something breaks, work from the exact error string**, not an
  interpretation.
- **After a local emergency deploy, commit and push in the same sitting** — the
  next Git-connected build otherwise rolls prod back.
- New dependency with a native binary? It needs an `allowBuilds` entry in
  `pnpm-workspace.yaml`, and `minimumReleaseAge` means it is not installable for
  24h after publish.
