/**
 * The site's one cache layer, as a function of an inner fetch and a Cache.
 *
 * Kept out of the Nitro plugin so it can be tested against a fake `Cache` — the
 * plugin itself is then a wiring file with nothing in it worth getting wrong.
 * See `edgeCache.test.ts`.
 */
import { CACHE_TAG, UNCACHEABLE_HEADERS, edgeCacheControl } from './cache'

export interface NitroFetchInit {
  context?: {
    waitUntil?: (promise: Promise<unknown>) => void
    _platform?: { cloudflare?: { request?: Request } }
  }
  [key: string]: unknown
}

export type NitroLocalFetch = (input: string, init?: NitroFetchInit) => Promise<Response>

/** The subset of the Cache API this uses. */
export interface EdgeCache {
  match: (request: Request) => Promise<Response | undefined>
  put: (request: Request, response: Response) => Promise<void>
}

export function withEdgeCache(inner: NitroLocalFetch, cache: EdgeCache): NitroLocalFetch {
  return async (input, init) => {
    const request = init?.context?._platform?.cloudflare?.request
    // The Cache API keys on GET only. HEAD and every mutating method go
    // straight through.
    if (!request || request.method !== 'GET') return inner(input, init)

    const cacheControl = edgeCacheControl(new URL(request.url).pathname)
    if (!cacheControl) return inner(input, init)

    const hit = await cache.match(request)
    if (hit) return served(hit, cacheControl, 'HIT')

    const response = await inner(input, init)
    // Only success is cached. A 404 or a 500 stored for a day would outlive
    // whatever caused it, and an error page is exactly the thing that must not
    // become sticky.
    if (response.status !== 200) return response

    const toStore = new Response(response.clone().body, response)
    for (const header of UNCACHEABLE_HEADERS) toStore.headers.delete(header)
    toStore.headers.set('cache-control', cacheControl)
    // The tag is what makes a blanket purge possible when the changed content
    // has no predictable URL — a newly created recipe, say, whose page nothing
    // could have named in advance.
    toStore.headers.set('cache-tag', CACHE_TAG)

    // A failed write must not fail the request: the visitor already has their
    // page, and the next request simply misses again.
    const write = cache.put(request, toStore).catch(() => {})
    const waitUntil = init?.context?.waitUntil
    if (waitUntil) waitUntil(write)
    else await write

    return served(response, cacheControl, 'MISS')
  }
}

/**
 * The copy the visitor gets.
 *
 * `cache-tag` is dropped on the way out: it is an instruction to Cloudflare's
 * cache, not information the browser has any use for, and leaving it on
 * publishes the purge vocabulary to anyone reading response headers.
 *
 * `x-edge-cache` is kept deliberately — without it, "is the cache working?" can
 * only be answered by timing requests and guessing.
 */
function served(response: Response, cacheControl: string, state: 'HIT' | 'MISS'): Response {
  const out = new Response(response.body, response)
  out.headers.set('cache-control', cacheControl)
  out.headers.delete('cache-tag')
  out.headers.set('x-edge-cache', state)
  return out
}
