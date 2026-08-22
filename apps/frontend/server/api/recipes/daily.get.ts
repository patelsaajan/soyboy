import type { Recipe } from '~~/types/recipes'

export default defineEventHandler(async (event) => {
  const res = await payloadFetch<PayloadRecipeOfTheDayResponse>(
    event,
    '/api/globals/recipe-of-the-day',
    { depth: 1 },
  )

  // `recipe` comes back as a bare id rather than a document whenever Payload
  // declines to populate it — which is what happens if the rotation's pick has
  // since been unpublished, since the relationship is read with the public's
  // access. Mapping that id would produce a card with every field undefined, so
  // treat anything unpopulated as "no recipe today" and let the next rotation
  // fix it.
  const recipe = typeof res.recipe === 'object' && res.recipe !== null ? res.recipe : null

  return (recipe ? mapRecipe(recipe) : null) as Recipe | null
})
