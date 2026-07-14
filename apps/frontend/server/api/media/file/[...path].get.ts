/**
 * Media proxy — serves Payload uploads from the frontend origin so the Payload
 * URL never appears in the browser. On Cloudflare the bytes come from Payload
 * over the BACKEND service binding (internal, no public hop); locally it falls
 * back to HTTP via payloadUrl.
 *
 * Responses are stored in the Cloudflare edge cache (Cache API), so repeat
 * requests are served from the edge without invoking the binding or R2 at all —
 * and browsers cache them for a year (immutable).
 */
type CfCache = { match: (req: Request) => Promise<Response | undefined>; put: (req: Request, res: Response) => Promise<void> }

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path) throw createError({ statusCode: 400, statusMessage: 'Missing media path' })

  const cache = (globalThis as unknown as { caches?: { default?: CfCache } }).caches?.default
  const cacheKey = new Request(getRequestURL(event).toString())

  // Edge cache hit → skip the binding + R2 entirely.
  const hit = await cache?.match(cacheKey)
  if (hit) return hit

  const res = await payloadRaw(event, `/api/media/file/${path}`)
  if (!res.ok) throw createError({ statusCode: res.status, statusMessage: 'Media not found' })

  const response = new Response(await res.arrayBuffer(), {
    status: 200,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })

  // Populate the edge cache in the background so it doesn't delay this response.
  const waitUntil = (event.context as { cloudflare?: { context?: { waitUntil?: (p: Promise<unknown>) => void } } })
    .cloudflare?.context?.waitUntil
  if (cache && waitUntil) waitUntil(cache.put(cacheKey, response.clone()))

  return response
})
