export default defineEventHandler(async (event) => {
  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    limit: 100,
    // Defence in depth: Recipes.access.read already constrains anonymous
    // reads to published documents.
    'where[_status][equals]': 'published',
    depth: 1,
  })
  return res.docs.map(doc => mapRecipe(doc))
})
