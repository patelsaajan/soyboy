/**
 * Purge-on-deploy: drop the frontend's cached HTML whenever new code ships.
 *
 * The edge holds a rendered page for a day (see `packages/shared`), and that
 * page names its CSS and JS by content hash — `/_nuxt/entry.<hash>.css`. A
 * deploy replaces the whole asset manifest, so every hash that changed is gone
 * from the ASSETS binding the moment the new Worker goes live.
 *
 * Nothing purged the cache on deploy, so the old HTML kept being served against
 * the new asset set: the browser asked for a stylesheet that no longer existed,
 * the assets binding answered 404 with no `Content-Type`, and `nosniff` turned
 * that into a hard block. An unstyled site for the full 24h TTL, with no error
 * anywhere in the logs — the Worker was never even reached.
 *
 * Purge-on-publish (`apps/payload/src/hooks/purgeFrontendCache.ts`) cannot cover
 * this: content had not changed, only the code that renders it. The two hooks
 * are the same idea on the two events that invalidate a cached page — an editor
 * saving, and a build shipping.
 *
 * URLs come from the same `@soyboy/shared` contract the site serves and the CMS
 * purges with, so a route cannot be cached by one and missed by the other.
 * Recipe pages are not a fixed list and this process has no database, so they
 * are read back from the site's own `/api/recipes/all` — purged first, so the
 * response is a fresh render through the Worker that just deployed.
 *
 * Uploads are deliberately not purged: their bytes are immutable (Payload
 * suffixes a colliding filename rather than overwriting) and a deploy does not
 * change them.
 */
import {
  CACHE_TAG,
  RECIPES_ALL_PATH,
  STATIC_CACHEABLE_PATHS,
  recipeApiPath,
  recipePagePath,
  siteUrl,
} from '@soyboy/shared'

/** Cloudflare accepts at most 30 URLs per single-file purge below Enterprise. */
const PURGE_URLS_PER_REQUEST = 30

/** Generous compared to the CMS hook's 5s — no editor is waiting on a deploy. */
const PURGE_TIMEOUT_MS = 10_000

/** Matches `runtimeConfig.public.siteUrl` in nuxt.config.ts. */
const origin = (process.env.NUXT_PUBLIC_SITE_URL || 'https://soyboy.saajanpatel.co.uk')
  .trim()
  .replace(/\/$/, '')

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function purge(
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

/** Purges a URL list in chunks. Resolves to the failures, so callers can count. */
async function purgeUrls(zoneId: string, token: string, urls: string[]): Promise<string[]> {
  const results = await Promise.all(
    chunk(urls, PURGE_URLS_PER_REQUEST).map((batch) => purge(zoneId, token, { files: batch })),
  )
  return results.filter((r) => !r.ok).map((r) => r.detail)
}

/**
 * Every published recipe's slug, as the site itself reports it.
 *
 * Called after the collection endpoint has been purged, so this is the new
 * build's own answer rather than the copy that is about to be invalidated.
 */
async function recipeSlugs(): Promise<string[]> {
  const res = await fetch(siteUrl(origin, RECIPES_ALL_PATH), {
    signal: AbortSignal.timeout(PURGE_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`${RECIPES_ALL_PATH} returned ${res.status}`)

  const body: unknown = await res.json()
  if (!Array.isArray(body)) throw new Error(`${RECIPES_ALL_PATH} did not return an array`)

  return body
    .map((doc) => (doc as { uri?: unknown }).uri)
    .filter((uri): uri is string => typeof uri === 'string' && uri.length > 0)
}

async function main(): Promise<void> {
  const zoneId = process.env.CF_ZONE_ID
  const token = process.env.CF_CACHE_PURGE_TOKEN
  if (!zoneId || !token) {
    // Loud rather than silent: a deploy that skips this ships new asset hashes
    // behind day-old HTML, which is the exact breakage this script exists for.
    // Still exit 0, so the script can land before the credentials do.
    console.warn(
      'WARNING: frontend cache NOT purged — CF_ZONE_ID / CF_CACHE_PURGE_TOKEN are unset. ' +
        'Cached pages will reference asset hashes this build has replaced. ' +
        'Set them as build environment variables (see docs/cloudflare-builds.md).',
    )
    return
  }

  const staticFailures = await purgeUrls(
    zoneId,
    token,
    STATIC_CACHEABLE_PATHS.map((path) => siteUrl(origin, path)),
  )

  const slugs = await recipeSlugs()
  const recipeFailures = await purgeUrls(
    zoneId,
    token,
    slugs.flatMap((slug) => [
      siteUrl(origin, recipePagePath(slug)),
      siteUrl(origin, recipeApiPath(slug)),
    ]),
  )

  // Best-effort, and never fatal: tag purge is an Enterprise feature, so on a
  // lower plan this fails every time. The URL purges above are the ones that
  // have to work — everything a deploy invalidates is enumerable, unlike the
  // brand-new recipe the CMS hook has to catch.
  const tag = await purge(zoneId, token, { tags: [CACHE_TAG] })
  if (!tag.ok) console.warn(`tag purge skipped (${CACHE_TAG}): ${tag.detail}`)

  const failures = [...staticFailures, ...recipeFailures]
  const count = STATIC_CACHEABLE_PATHS.length + slugs.length * 2
  if (failures.length > 0) {
    throw new Error(`purge failed for ${failures.length} request(s): ${failures.join(' | ')}`)
  }
  console.log(`frontend cache purged on deploy: ${count} URLs across ${slugs.length} recipes`)
}

main().catch((err: unknown) => {
  // Fail the build red. The deploy itself has already succeeded by this point,
  // so this is a report, not a rollback — but a stale-HTML site is exactly the
  // failure that goes unnoticed for a day if nothing goes red.
  console.error(`frontend cache purge on deploy failed: ${String(err)}`)
  process.exit(1)
})
