/**
 * Development-only stand-in for Cloudflare Image Transformations.
 *
 * In production `/cdn-cgi/image/<opts>/<src>` is intercepted by Cloudflare's
 * edge and never reaches this Worker, so this route is dead code there — it
 * exists so that `nuxt dev` can serve the exact same URLs the deployed site
 * emits. The alternative (pointing the image provider at the production domain
 * in dev) made every image cross-origin, tripped the site's own
 * `img-src 'self'` CSP, and pulled production's bytes into local pages.
 *
 * No resizing happens here. The transformation options are parsed only far
 * enough to strip them off and validate their shape; the original source is
 * returned untouched. That is enough for local work — layout, srcset selection
 * and cache behaviour are all exercised — and it keeps `sharp` out of the
 * frontend, which the Workers build deliberately does not carry.
 */

// Cloudflare's option segment, e.g. `w=320,f=auto,q=80` or `width=320,fit=cover`.
const OPTIONS_SEGMENT = /^[a-z]+=[\w.%-]+(?:,[a-z]+=[\w.%-]+)*$/

// The sources this site actually references: CMS uploads through the media
// proxy, and static art under public/. Anything else is rejected rather than
// fetched — this handler concatenates a caller-supplied path into an internal
// request, the same hazard server/api/media/file guards against, and a
// dev-only route is still a route.
const ALLOWED_SOURCE = /^\/(?:api\/media\/file|imgs)\/[\w./-]+$/

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const path = getRouterParam(event, 'path')
  if (!path) throw createError({ statusCode: 400, statusMessage: 'Invalid image path' })

  const separator = path.indexOf('/')
  if (separator < 1) throw createError({ statusCode: 400, statusMessage: 'Invalid image path' })

  const options = path.slice(0, separator)
  if (!OPTIONS_SEGMENT.test(options)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transformation options' })
  }

  const source = '/' + path.slice(separator + 1)
  if (source.split('/').includes('..') || !ALLOWED_SOURCE.test(source)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid image source' })
  }

  // Fetched over this server's own origin rather than dispatched internally:
  // files under public/ are served by the dev middleware, not the Nitro route
  // table, so an internal $fetch 404s on every /imgs/** source.
  const res = await fetch(new URL(source, getRequestURL(event).origin))

  const contentType = res.headers.get('content-type') ?? ''
  if (!res.ok || !contentType.startsWith('image/')) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  setResponseHeader(event, 'content-type', contentType)
  setResponseHeader(event, 'x-content-type-options', 'nosniff')
  return new Uint8Array(await res.arrayBuffer())
})
