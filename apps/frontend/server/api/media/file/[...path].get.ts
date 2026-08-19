/**
 * Media proxy — serves Payload uploads from the frontend origin so the Payload
 * URL never appears in the browser. On Cloudflare the bytes come from Payload
 * over the BACKEND service binding (internal, no public hop); locally it falls
 * back to HTTP via payloadUrl.
 *
 * Long-lived immutable cache header → browsers cache for a year, and Cloudflare
 * Image Transformations edge-caches the resized variants it derives from this,
 * so this origin is hit rarely.
 */

/**
 * Upload filenames only: segments of [A-Za-z0-9._-], no traversal. The wildcard
 * segment is concatenated into an upstream URL that the service binding sends
 * straight to the Payload Worker — bypassing anything protecting the public CMS
 * hostname — so `../../../admin` must not survive to that point. Cloudflare's
 * edge happens to normalise that today, but relying on an external normaliser
 * for a traversal guard is not a safe place to sit.
 */
const MEDIA_PATH = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path || path.length > 256 || !MEDIA_PATH.test(path) || path.split('/').includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid media path' })
  }

  const res = await payloadRaw(event, `/api/media/file/${path}`)
  // Fixed 404 rather than forwarding res.status: the upstream status is an
  // oracle for internal Payload state (403 vs 404 are distinguishable).
  if (!res.ok) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

  const contentType = res.headers.get('content-type') ?? ''
  // Never let this proxy serve text/html from our own origin.
  if (!/^(image|video|audio)\//.test(contentType)) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  setResponseHeader(event, 'content-type', contentType)
  setResponseHeader(event, 'x-content-type-options', 'nosniff')
  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return new Uint8Array(await res.arrayBuffer())
})
