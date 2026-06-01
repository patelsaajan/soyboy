import type { Recipe } from '~~/types/recipes'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const { payloadUrl } = useRuntimeConfig()
  const base = (payloadUrl as string).replace(/\/$/, '')
  const res = await $fetch<PayloadListResponse>(`${base}/api/recipes`, {
    query: { 'where[slug][equals]': slug, limit: 1, depth: 1 },
  })
  return (res.docs[0] ? mapRecipe(res.docs[0], base) : null) as Recipe | null
}, {
  maxAge: 60 * 10,
  name: 'recipes-slug',
  getKey: (event) => getRouterParam(event, 'slug') ?? 'unknown',
})
