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
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path) throw createError({ statusCode: 400, statusMessage: 'Missing media path' })

  const res = await payloadRaw(event, `/api/media/file/${path}`)
  if (!res.ok) throw createError({ statusCode: res.status, statusMessage: 'Media not found' })

  setResponseHeader(event, 'content-type', res.headers.get('content-type') ?? 'application/octet-stream')
  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return new Uint8Array(await res.arrayBuffer())
})
