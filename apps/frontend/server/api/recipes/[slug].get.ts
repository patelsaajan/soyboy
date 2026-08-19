import type { Recipe } from '~~/types/recipes'

/**
 * Matches exactly what the CMS generates (Recipes.ts lowercases and collapses
 * to [a-z0-9-]). Validating before the cache key is set stops an attacker
 * minting unbounded cache entries — each miss is a service-binding hop plus a
 * Neon query through Hyperdrive, and there is no rate limit in front of it.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 96

const isValidSlug = (slug: string | undefined): slug is string =>
  Boolean(slug) && slug!.length <= MAX_SLUG_LENGTH && SLUG.test(slug!)

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    'where[slug][equals]': slug,
    // Defence in depth: Recipes.access.read already constrains anonymous reads
    // to published documents.
    'where[_status][equals]': 'published',
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] ? mapRecipe(res.docs[0]) : null) as Recipe | null
}, {
  maxAge: 60 * 10,
  name: 'recipes-slug',
  getKey: (event) => {
    const slug = getRouterParam(event, 'slug')
    return isValidSlug(slug) ? slug : 'invalid'
  },
})
