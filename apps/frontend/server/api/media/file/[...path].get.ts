import { MEDIA_CACHE_CONTROL } from '@soyboy/shared'
import { isMediaPath } from '../../../utils/cache'

/**
 * Media proxy — serves Payload uploads from the frontend origin so the Payload
 * URL never appears in the browser. On Cloudflare the bytes come from Payload
 * over the BACKEND service binding (internal, no public hop); locally it falls
 * back to HTTP via payloadUrl.
 *
 * Serving uploads from this origin is also what makes them purgeable: a file
 * linked at its Payload URL sits on a hostname the zone purge does not cover.
 *
 * The path shape is validated by the same predicate the edge cache uses, so a
 * path this handler would serve is exactly the set the cache will store. The
 * wildcard segment is concatenated into an upstream URL that the service binding
 * sends straight to the Payload Worker — bypassing anything protecting the
 * public CMS hostname — so `../../../admin` must not survive to that point.
 * Cloudflare's edge happens to normalise that today, but relying on an external
 * normaliser for a traversal guard is not a safe place to sit.
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path || !isMediaPath(path)) {
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
  // Set here as well as by the edge-cache plugin: this handler also runs in
  // local dev and on the node preview, where the plugin is inert.
  setResponseHeader(event, 'cache-control', MEDIA_CACHE_CONTROL)
  return new Uint8Array(await res.arrayBuffer())
})
