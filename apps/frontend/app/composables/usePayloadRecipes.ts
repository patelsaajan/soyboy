import type { Recipe } from '~~/types/recipes'

function getCachedData(key: string, nuxtApp: ReturnType<typeof useNuxtApp>) {
  const cached = nuxtApp.payload.data[key]
  return cached !== undefined ? cached : nuxtApp.static.data[key]
}

export function useAllRecipes() {
  return useFetch<Recipe[]>('/api/recipes/all', {
    key: 'all-recipes',
    default: (): Recipe[] => [],
    getCachedData,
  })
}

export function useRecentRecipes() {
  return useFetch<Recipe[]>('/api/recipes/recent', {
    key: 'recent-recipes',
    default: (): Recipe[] => [],
    getCachedData,
  })
}

export function useHighlightedRecipes() {
  return useFetch<Recipe[]>('/api/recipes/highlighted', {
    key: 'highlighted-recipes',
    default: (): Recipe[] => [],
    getCachedData,
  })
}

export function useRecipeOfTheDay() {
  return useFetch<Recipe | null>('/api/recipes/daily', {
    key: 'recipe-of-the-day',
    default: (): Recipe | null => null,
    getCachedData,
  })
}

export function useRecipeBySlug(slug: string) {
  return useFetch<Recipe | null>(`/api/recipes/${slug}`, {
    key: `recipe-${slug}`,
    default: (): Recipe | null => null,
    getCachedData,
  })
}
