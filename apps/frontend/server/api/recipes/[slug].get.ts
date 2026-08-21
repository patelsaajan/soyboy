import type { Recipe } from '~~/types/recipes'
import { isRecipeSlug } from '../../utils/cache'

/**
 * The slug is validated before anything downstream runs, against the same shape
 * that gates what the edge will cache (`server/utils/cache.ts`). One definition,
 * so the two agree by construction: a slug this handler serves is a slug the
 * cache stores, and one it rejects never becomes a cache entry.
 *
 * That coupling is the point. Every miss is a service-binding hop plus a Neon
 * query through Hyperdrive and nothing rate-limits it, so an unbounded slug
 * space is an unbounded number of entries an attacker can mint.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !isRecipeSlug(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    'where[slug][equals]': slug,
    // Defence in depth: Recipes.access.read already constrains anonymous reads
    // to published documents.
    'where[_status][equals]': 'published',
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] ? mapRecipe(res.docs[0]) : null) as Recipe | null
})
