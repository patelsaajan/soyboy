export default defineCachedEventHandler(async (event) => {
  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    limit: 5,
    sort: '-createdAt',
    depth: 1,
  })
  return res.docs.map(doc => mapRecipe(doc, payloadBase()))
}, { maxAge: 60 * 5, name: 'recipes-recent', getKey: () => 'recent' })
