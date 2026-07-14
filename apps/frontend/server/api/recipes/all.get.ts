export default defineCachedEventHandler(async (event) => {
  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    limit: 100,
    depth: 1,
  })
  return res.docs.map(doc => mapRecipe(doc))
}, { maxAge: 60 * 10, name: 'recipes-all', getKey: () => 'all' })
