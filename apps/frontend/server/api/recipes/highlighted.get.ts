export default defineCachedEventHandler(async () => {
  const { payloadUrl } = useRuntimeConfig()
  const base = (payloadUrl as string).replace(/\/$/, '')
  const res = await $fetch<PayloadListResponse>(`${base}/api/recipes`, {
    query: { 'where[highlighted][equals]': true, limit: 4, depth: 1, sort: '-createdAt' },
  })
  return res.docs.map(doc => mapRecipe(doc, base))
}, { maxAge: 60 * 15, name: 'recipes-highlighted', getKey: () => 'highlighted' })
