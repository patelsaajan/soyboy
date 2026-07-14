import type { Recipe } from '~~/types/recipes'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    'where[slug][equals]': slug,
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] ? mapRecipe(res.docs[0], payloadBase()) : null) as Recipe | null
}, {
  maxAge: 60 * 10,
  name: 'recipes-slug',
  getKey: (event) => getRouterParam(event, 'slug') ?? 'unknown',
})
