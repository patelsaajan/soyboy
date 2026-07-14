import type { Recipe } from '~~/types/recipes'

export default defineCachedEventHandler(async (event) => {
  const res = await payloadFetch<PayloadRecipeOfTheDayResponse>(
    event,
    '/api/globals/recipe-of-the-day',
    { depth: 1 },
  )
  return (res.recipe ? mapRecipe(res.recipe, payloadBase()) : null) as Recipe | null
}, { maxAge: 60 * 60, name: 'recipes-daily', getKey: () => 'daily' })
