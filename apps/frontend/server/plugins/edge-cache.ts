/**
 * Wires the edge cache into the request path.
 *
 * Everything public is served out of Cloudflare's cache and stays there for a
 * day; freshness comes from the CMS purging on publish
 * (`apps/payload/src/hooks/purgeFrontendCache.ts`), never from a short TTL. If
 * edits start taking a day to appear, the purge path is broken — fix that,
 * rather than shortening the lifetime, which costs the hit rate and hides the
 * fault.
 *
 * Why this, and not `defineCachedEventHandler` or `routeRules.swr`, which is
 * what it replaced:
 *
 *   - Nitro's cache lives in its own storage, which on Workers defaults to
 *     per-isolate memory. It is not shared between colos, not shared between
 *     isolates in the same colo, and — the part that matters — not reachable by
 *     Cloudflare's purge API. There was no way to make an edit appear early, so
 *     `/recipes/**` sat behind a seven-day TTL and content changes landed
 *     whenever an isolate happened to recycle.
 *   - `caches.default` is the cache a zone-level purge clears, so one call from
 *     the CMS empties it everywhere at once.
 *
 * Two layers would be worse than one: an unpurgeable TTL in front of a purgeable
 * one means the purge stops working and nothing says so. So there is exactly
 * one, and it is this.
 *
 * Why patch `localFetch` rather than use a Nitro hook: `localFetch` is the one
 * seam that both receives the original `Request` (the cache key a purge names)
 * and returns a finished `Response` (the bytes to store). `beforeResponse` sees
 * the handler's return value *before* serialisation, which would mean guessing
 * at the body Nitro is about to send and caching something subtly different
 * from what the visitor got.
 */
import { withEdgeCache } from '../utils/edgeCache'
import type { EdgeCache, NitroLocalFetch } from '../utils/edgeCache'

export default defineNitroPlugin((nitroApp) => {
  // `caches.default` exists only inside workerd. Local `nuxt dev` and the node
  // preview run uncached rather than emulating one — a stale local page is a far
  // worse debugging experience than a slow one, and the production path is
  // exercised by `wrangler dev`.
  const cache = (globalThis as { caches?: { default?: EdgeCache } }).caches?.default
  if (!cache) return

  const inner = nitroApp.localFetch.bind(nitroApp) as NitroLocalFetch
  nitroApp.localFetch = withEdgeCache(inner, cache) as typeof nitroApp.localFetch
})
