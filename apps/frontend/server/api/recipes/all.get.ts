export default defineCachedEventHandler(async () => {
  const { payloadUrl } = useRuntimeConfig()
  const base = (payloadUrl as string).replace(/\/$/, '')
  const res = await $fetch<PayloadListResponse>(`${base}/api/recipes`, {
    query: { limit: 100, depth: 1 },
  })
  return res.docs.map(doc => mapRecipe(doc, base))
}, { maxAge: 60 * 10, name: 'recipes-all', getKey: () => 'all' })
