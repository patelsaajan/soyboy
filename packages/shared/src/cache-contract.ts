/**
 * The sync contract between what the site *serves from cache* and what the CMS
 * *purges*.
 *
 * A Cloudflare purge matches its cache key exactly. If the site serves
 * `/api/recipes/all` and the purge hook asks for `/api/recipes`, the purge
 * misses forever — an editor's change then waits out the full edge TTL, and
 * nothing anywhere raises an error. Two hand-maintained lists is the failure
 * mode that rots silently, so both ends import from this file instead: there is
 * only ever one string, and changing it moves the serve and the purge together.
 *
 * Query parameter order is part of the cache key too (`?a=1&b=2` and `?b=2&a=1`
 * are separate entries), which is the other reason URLs get built in exactly one
 * place rather than assembled at each call site.
 *
 * Paths here are root-relative and are what the *browser* requests from
 * soyboy.saajanpatel.co.uk — not what Nitro requests from Payload. The Payload
 * origin is never cached publicly and never purged; it sits behind the BACKEND
 * service binding with no public route of its own.
 */

/**
 * Tag set on every cacheable response, so a single tag purge can clear
 * everything the site holds when a URL-by-URL purge is not enough (or when a
 * new URL exists that no list could have predicted).
 *
 * Must match the `Cache-Tag` header the frontend sets — see
 * `apps/frontend/server/utils/cache.ts`. Nothing checks this at build time
 * because the two live in different runtimes; it is asserted in
 * `apps/frontend/server/utils/cache.test.ts` instead.
 */
export const CACHE_TAG = 'soyboy-content'

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

/** SSR pages that render CMS content and are not addressed by a recipe slug. */
export const STATIC_PAGE_PATHS: readonly string[] = ['/', '/recipes']

/** A recipe's public page. */
export const recipePagePath = (slug: string): string =>
  `/recipes/${encodeURIComponent(slug)}`

// ---------------------------------------------------------------------------
// JSON endpoints
//
// These are the frontend's own endpoints, which the pages hydrate from. They are
// separate cache entries from the pages that embed the same data — a purge has
// to name both, or a client-side navigation will pull JSON that the freshly
// purged HTML no longer agrees with.
// ---------------------------------------------------------------------------

export const RECIPES_ALL_PATH = '/api/recipes/all'
export const RECIPES_RECENT_PATH = '/api/recipes/recent'
export const RECIPES_HIGHLIGHTED_PATH = '/api/recipes/highlighted'
export const RECIPE_OF_THE_DAY_PATH = '/api/recipes/daily'

/** Every collection-wide JSON endpoint. Per-recipe ones are built by slug. */
export const STATIC_API_PATHS: readonly string[] = [
  RECIPES_ALL_PATH,
  RECIPES_RECENT_PATH,
  RECIPES_HIGHLIGHTED_PATH,
  RECIPE_OF_THE_DAY_PATH,
]

export const recipeApiPath = (slug: string): string =>
  `/api/recipes/${encodeURIComponent(slug)}`

/** Generated from the CMS, so it changes whenever a recipe is added or removed. */
export const SITEMAP_PATH = '/sitemap.xml'

/**
 * An uploaded file as the site references it.
 *
 * Uploads are proxied through the frontend origin rather than linked at their
 * Payload URL, which is what keeps the CMS origin out of the browser *and*
 * makes the bytes purgeable on this zone. Anything that renders an image must
 * build its URL here — a Payload `url` used directly bypasses both.
 */
export const mediaFilePath = (filename: string): string =>
  `/api/media/file/${encodeURIComponent(filename)}`

/**
 * Everything cacheable that does not depend on a specific document — the list a
 * purge always includes, whatever changed.
 */
export const STATIC_CACHEABLE_PATHS: readonly string[] = [
  ...STATIC_PAGE_PATHS,
  ...STATIC_API_PATHS,
  SITEMAP_PATH,
]

/**
 * The absolute URL for a path, as both the browser requests it and the purge API
 * must name it. `origin` carries no trailing slash.
 */
export const siteUrl = (origin: string, path: string): string => `${origin}${path}`

// ---------------------------------------------------------------------------
// Cache lifetimes
//
// One number per class of URL, in one place, because the header the frontend
// sends and the expectation the runbook documents have to be the same number.
//
// These are deliberately long. Freshness is the purge hook's job (see
// apps/payload/src/hooks/purgeFrontendCache.ts); the TTL exists only as the
// backstop for a purge that failed. Shortening it to "make edits appear faster"
// trades away the hit rate without fixing the purge, and hides the breakage.
// ---------------------------------------------------------------------------

const DAY = 86_400

/** Edge lifetime, in seconds, for each class of cacheable URL. */
export const EDGE_TTL = {
  page: DAY,
  api: DAY,
  sitemap: DAY,
} as const

/**
 * `stale-while-revalidate` window. A purge removes the entry outright, so this
 * only ever governs the TTL-expiry path: it lets the edge serve the old copy
 * once while it refreshes, instead of making one visitor wait for a full SSR
 * render.
 */
export const STALE_WHILE_REVALIDATE = DAY

/**
 * The cache-control string for a cacheable response.
 *
 * `max-age=0, must-revalidate` is the browser half and is not a mistake: a
 * private copy in one visitor's browser cannot be purged from Cloudflare, so
 * personal caches revalidate every time and the shared edge cache — which *is*
 * purgeable — does the actual work.
 */
export const cacheControl = (sMaxAge: number): string =>
  `public, max-age=0, must-revalidate, s-maxage=${sMaxAge}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`

/**
 * Uploads are the one exception to the revalidate-always rule above, because
 * they are genuinely immutable: Payload gives a colliding filename a new suffix
 * rather than overwriting, so the bytes at a given URL never change. That makes
 * a year-long private cache safe, and saves a revalidation round-trip on every
 * image on the page.
 *
 * The purge hook still names an upload's filename when the document is replaced
 * or deleted — not because the bytes changed, but because nothing should be
 * left serving a file the CMS no longer knows about.
 */
export const MEDIA_CACHE_CONTROL = 'public, max-age=31536000, immutable'
