export default defineCachedEventHandler(async (event) => {
  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    'where[highlighted][equals]': true,
    limit: 4,
    depth: 1,
    sort: '-createdAt',
  })
  return res.docs.map(doc => mapRecipe(doc))
}, { maxAge: 60 * 15, name: 'recipes-highlighted', getKey: () => 'highlighted' })
