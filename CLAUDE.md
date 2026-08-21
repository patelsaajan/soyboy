# Soyboy

A Turborepo monorepo: a Nuxt 4 recipe site and the Payload CMS behind it, both
deployed as Cloudflare Workers.

## Read this first

`docs/cloudflare-payload-stack.md` is the reference for how the stack fits
together and why. The working subset — the invariants that break silently — is
the `cloudflare-payload-stack` skill in `.claude/skills/`. **Load it before
touching a cached route, a collection, a wrangler config, a build script, or
anything about caching.** `apps/payload/.claude/skills/payload/` is the Payload
API reference.

## The two things most likely to bite

1. **`apps/payload/.env` has pointed at production Neon.** Check before running
   anything that calls `getPayload()`. The guards in `payload.config.ts` and
   `src/seed/run.ts` exist because of this, and none of them should be removed.
2. **There is exactly one cache layer** — `caches.default`, written by
   `apps/frontend/server/plugins/edge-cache.ts` and cleared by
   `apps/payload/src/hooks/purgeFrontendCache.ts`. Do not add a second one.
   `defineCachedEventHandler` and `routeRules.swr` are unpurgeable on Workers and
   were deliberately removed.

## Conventions

This is a **Nuxt/Vue** project, so it follows the Nuxt conventions in the global
config — `app/` as srcDir, file-based routing, auto-imported components and
composables, `@nuxt/ui`, Tailwind v4 tokens in `app/assets/css/main.css`. Do not
bring React-stack conventions into it.

The CMS app is Next.js, because Payload 3 is a Next application. That is the one
place React lives.

## Commands

```bash
pnpm db:up      # local Postgres on :5432
pnpm dev        # frontend :4000, CMS :3000
pnpm check      # typecheck + lint, every package
pnpm test       # unit tests; the CMS's integration tests need db:up
pnpm build
```

## Parity

Three sibling repos run the same stack with a React frontend:
`payload-cloudflare-starter`, `bryans-motorcycle-school`, `karagama-ent-1`. An
infrastructure fix belongs in all of them. The deliberate differences are
tabulated in `docs/cloudflare-payload-stack.md` → *Where soyboy differs*;
anything not on that list should match.
