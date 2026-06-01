import type { Recipe } from '~~/types/recipes'

export default defineCachedEventHandler(async () => {
  const { payloadUrl } = useRuntimeConfig()
  const base = (payloadUrl as string).replace(/\/$/, '')
  const res = await $fetch<PayloadRecipeOfTheDayResponse>(
    `${base}/api/globals/recipe-of-the-day`,
    { query: { depth: 1 } }
  )
  return (res.recipe ? mapRecipe(res.recipe, base) : null) as Recipe | null
}, { maxAge: 60 * 60, name: 'recipes-daily', getKey: () => 'daily' })
