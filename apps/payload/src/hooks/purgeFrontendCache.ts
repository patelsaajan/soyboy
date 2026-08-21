/**
 * Purge-on-publish: drop the frontend's cached pages and JSON whenever public
 * content changes.
 *
 * Freshness comes from this hook, never from the TTL. The edge holds a recipe
 * page for a day; if edits start taking that long to appear, the purge path is
 * broken — fix it here rather than shortening the cache lifetime, which tanks
 * the hit rate without fixing anything and hides the fault.
 *
 * Purges name exact URLs (the zone hosts other sites, so `purge_everything` is
 * not an option) and are built from the same `@soyboy/shared` helpers the
 * frontend serves and links with, so the two cannot drift.
 *
 * `cache.delete()` from inside a Worker is no use here — it clears only the colo
 * that Worker happens to be running in. A zone-level API purge clears them all.
 */
import {
  CACHE_TAG,
  STATIC_CACHEABLE_PATHS,
  mediaFilePath,
  recipeApiPath,
  recipePagePath,
  siteUrl,
} from '@soyboy/shared'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
  PayloadRequest,
} from 'payload'

/** A hanging purge must not hang the editor's save. */
const PURGE_TIMEOUT_MS = 5_000

/** Cloudflare accepts at most 30 URLs per single-file purge below Enterprise. */
const PURGE_URLS_PER_REQUEST = 30

/**
 * Upper bound on documents enumerated per purge. Well above the real corpus;
 * it exists so a runaway collection cannot turn one save into hundreds of API
 * calls. Anything past it is covered by the tag purge.
 */
const MAX_DOCS_PER_PURGE = 500

/** Where the site is served from — the same list CORS is built from. */
function siteOrigins(): string[] {
  return (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

/**
 * Every URL the frontend may be holding.
 *
 * The static pages and collection endpoints are a fixed list. Recipe pages and
 * uploads are not, so they are enumerated from the database rather than guessed
 * at.
 *
 * `stalePaths` carries URLs that are no longer derivable from the database — a
 * deleted recipe, or an upload's previous filename. Those entries are still
 * cached and would otherwise be orphaned until the TTL expired.
 */
async function pathsToPurge(payload: Payload, stalePaths: string[]): Promise<string[]> {
  const paths = new Set<string>([...STATIC_CACHEABLE_PATHS, ...stalePaths])

  const recipes = await payload.find({
    collection: 'recipes',
    limit: MAX_DOCS_PER_PURGE,
    depth: 0,
    pagination: false,
  })
  for (const doc of recipes.docs) {
    if (typeof doc.slug === 'string' && doc.slug) {
      paths.add(recipePagePath(doc.slug))
      paths.add(recipeApiPath(doc.slug))
    }
  }

  const media = await payload.find({
    collection: 'media',
    limit: MAX_DOCS_PER_PURGE,
    depth: 0,
    pagination: false,
  })
  for (const doc of media.docs) {
    if (typeof doc.filename === 'string') paths.add(mediaFilePath(doc.filename))
  }

  return [...paths]
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function purgeCloudflare(
  zoneId: string,
  token: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; detail: string }> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(PURGE_TIMEOUT_MS),
  })
  return { ok: res.ok, detail: res.ok ? '' : `${res.status} ${await res.text()}` }
}

/**
 * Never throws. A failed purge must not fail a save — the TTL backstops it, and
 * saving again retries. Both outcomes are logged: without a success line there
 * is no way to tell a working purge from a silently dead one.
 */
export async function purgeFrontendCache(
  payload: Payload,
  stalePaths: string[] = [],
): Promise<void> {
  const zoneId = process.env.CF_ZONE_ID
  const token = process.env.CF_CACHE_PURGE_TOKEN
  // Absent in local dev and in the seed — there is nothing at an edge to purge.
  if (!zoneId || !token) return

  const origins = siteOrigins()
  if (origins.length === 0) {
    payload.logger.error('frontend cache purge skipped: FRONTEND_URL is empty')
    return
  }

  try {
    const paths = await pathsToPurge(payload, stalePaths)
    const files = origins.flatMap((origin) => paths.map((path) => siteUrl(origin, path)))

    const results = await Promise.all(
      chunk(files, PURGE_URLS_PER_REQUEST).map((batch) =>
        purgeCloudflare(zoneId, token, { files: batch }),
      ),
    )

    // Cloudflare documents single-file purge as not reliably covering assets
    // written through the Workers Cache API, and recommends tags for those. The
    // frontend tags everything it stores, so this catches whatever the URL list
    // missed — including a page whose URL did not exist when the list was built.
    results.push(await purgeCloudflare(zoneId, token, { tags: [CACHE_TAG] }))

    const failures = results.filter((r) => !r.ok)
    if (failures.length === 0) {
      payload.logger.info(`frontend cache purged: ${files.length} URLs + tag ${CACHE_TAG}`)
    } else {
      payload.logger.error(
        `frontend cache purge failed for ${failures.length}/${results.length} requests: ` +
          failures.map((f) => f.detail).join(' | '),
      )
    }
  } catch (err) {
    payload.logger.error(`frontend cache purge failed: ${String(err)}`)
  }
}

/**
 * URLs worth purging beyond what is still derivable from the database — this
 * document's own addresses before and after the change.
 *
 * Renaming a recipe's slug is the case that needs it: the new slug is in the
 * database and will be enumerated, the old one is not, and its page would keep
 * being served for a day.
 */
function stalePathsFor(doc: unknown, previousDoc?: unknown): string[] {
  const paths: string[] = []
  for (const d of [doc, previousDoc]) {
    const record = d as { slug?: unknown; filename?: unknown } | undefined
    if (typeof record?.slug === 'string' && record.slug) {
      paths.push(recipePagePath(record.slug), recipeApiPath(record.slug))
    }
    if (typeof record?.filename === 'string') {
      paths.push(mediaFilePath(record.filename))
    }
  }
  return paths
}

export const purgeAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await purgeFrontendCache((req as PayloadRequest).payload, stalePathsFor(doc, previousDoc))
  return doc
}

export const purgeAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await purgeFrontendCache((req as PayloadRequest).payload, stalePathsFor(doc))
  return doc
}

export const purgeGlobalAfterChange: GlobalAfterChangeHook = async ({ doc, req }) => {
  await purgeFrontendCache((req as PayloadRequest).payload)
  return doc
}
