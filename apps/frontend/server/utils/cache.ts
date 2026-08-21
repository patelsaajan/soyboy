/**
 * Which URLs the edge caches, and under what headers.
 *
 * Kept as pure functions with no Nitro or Workers imports so the rules can be
 * unit-tested directly — see `cache.test.ts`. The plumbing that applies them
 * lives in `server/plugins/edge-cache.ts`.
 *
 * The list is deliberately an allowlist rather than "cache everything except…".
 * A new route added tomorrow is uncached until someone decides it should be,
 * which is the safe default: an over-cached authenticated or personalised
 * response is a data leak, an under-cached one is a slow page.
 */
import {
  CACHE_TAG,
  EDGE_TTL,
  MEDIA_CACHE_CONTROL,
  SITEMAP_PATH,
  STATIC_PAGE_PATHS,
  cacheControl,
} from '@soyboy/shared'

export { CACHE_TAG }

/**
 * Recipe slugs as the CMS generates them (see `apps/payload/src/fields/slug.ts`).
 * Matching the shape here — rather than accepting any path segment — keeps an
 * attacker from minting unbounded cache entries: every miss is a service-binding
 * hop plus a Neon query through Hyperdrive, and nothing rate-limits that.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 96

export const isRecipeSlug = (value: string): boolean =>
  value.length > 0 && value.length <= MAX_SLUG_LENGTH && SLUG.test(value)

/** Upload filenames: no traversal, no path separators beyond simple segments. */
const MEDIA_PATH = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/
const MAX_MEDIA_PATH_LENGTH = 256

export const isMediaPath = (value: string): boolean =>
  value.length > 0 &&
  value.length <= MAX_MEDIA_PATH_LENGTH &&
  MEDIA_PATH.test(value) &&
  !value.split('/').includes('..')

/**
 * The `Cache-Control` this pathname should be served with, or `null` if it must
 * not be cached at the edge at all.
 *
 * A returned string means two things at once, and they must stay coupled: the
 * response is stored in the Workers cache, *and* it carries a `Cache-Tag` that a
 * purge can name. Anything cached without the tag would be unreachable by the
 * only mechanism that clears it early.
 */
export function edgeCacheControl(pathname: string): string | null {
  if ((STATIC_PAGE_PATHS as readonly string[]).includes(pathname)) {
    return cacheControl(EDGE_TTL.page)
  }
  if (pathname === SITEMAP_PATH) {
    return cacheControl(EDGE_TTL.sitemap)
  }

  const media = pathname.match(/^\/api\/media\/file\/(.+)$/)
  if (media) return isMediaPath(media[1]!) ? MEDIA_CACHE_CONTROL : null

  const recipePage = pathname.match(/^\/recipes\/([^/]+)$/)
  if (recipePage) return isRecipeSlug(recipePage[1]!) ? cacheControl(EDGE_TTL.page) : null

  const recipeApi = pathname.match(/^\/api\/recipes\/([^/]+)$/)
  // `all`, `recent`, `highlighted` and `daily` are valid slugs by shape, so the
  // collection endpoints and the per-recipe ones are covered by the same test.
  if (recipeApi) return isRecipeSlug(recipeApi[1]!) ? cacheControl(EDGE_TTL.api) : null

  return null
}

/**
 * Headers to strip before a response is stored.
 *
 * `set-cookie` is the one that matters: the Cache API refuses to store a
 * response carrying it, and a cookie shared between visitors would be a session
 * leak if it ever did. Nothing on a cacheable route should be setting one — if
 * this ever fires, that is the bug, not the stripping.
 */
export const UNCACHEABLE_HEADERS = ['set-cookie'] as const
