import type { Recipe } from '~~/types/recipes'

// ─── Payload REST API types ───────────────────────────────────────────────────

type PayloadIngredient = { id?: string; item: string; quantity: string; unit?: string }
type PayloadStep = { id?: string; title: string; description: string }
type PayloadNutritional = { id?: string; item: string; value: string }
type PayloadSuggestion = { id?: string; title: string; text: string }

type PayloadRecipeDoc = {
  id: string
  slug: string
  highlighted?: boolean
  cuisine?: string
  time?: string
  cookTime?: number
  servings: number
  imgSrc?: string
  title: string
  description: string
  intro?: string
  featuredImage?: { url: string; alt?: string } | null
  ingredients?: PayloadIngredient[]
  steps?: PayloadStep[]
  nutritional?: PayloadNutritional[]
  suggestions?: PayloadSuggestion[]
  _status: string
  createdAt: string
  updatedAt: string
}

type PayloadListResponse = {
  docs: PayloadRecipeDoc[]
  totalDocs: number
  limit: number
  page: number
}

type PayloadRecipeOfTheDayResponse = {
  recipe?: PayloadRecipeDoc | null
  lastRotated?: string | null
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

function mapRecipe(doc: PayloadRecipeDoc, base: string): Recipe {
  const heroUrl = doc.featuredImage?.url
    ? doc.featuredImage.url.startsWith('http')
      ? doc.featuredImage.url
      : `${base}${doc.featuredImage.url}`
    : null
  return {
    title: doc.title,
    date: doc.createdAt,
    published: doc._status === 'published',
    cuisine: doc.cuisine ?? '',
    time: doc.time ?? (doc.cookTime ? `${doc.cookTime} minutes` : ''),
    serves: doc.servings,
    description: doc.description,
    imgSrc: heroUrl ?? (doc.imgSrc ? `/imgs/food/${doc.imgSrc}` : ''),
    uri: doc.slug,
    intro: doc.intro ?? '',
    ingredients: (doc.ingredients ?? []).map((i) => ({
      quantity: parseFloat(i.quantity) || 0,
      unit: i.unit ?? '',
      item: i.item,
    })),
    nutritional: (doc.nutritional ?? []).map((n) => ({ item: n.item, value: n.value })),
    method: (doc.steps ?? []).map((s) => ({ title: s.title, text: s.description })),
    suggestions: (doc.suggestions ?? []).map((s) => ({ title: s.title, text: s.text })),
  }
}

// ─── Composables ─────────────────────────────────────────────────────────────

export function useAllRecipes() {
  const config = useRuntimeConfig()
  const base = (config.public.payloadUrl as string).replace(/\/$/, '')
  return useFetch<Recipe[]>(`${base}/api/recipes`, {
    query: { limit: 100, depth: 1 },
    transform: (res: PayloadListResponse) => res.docs.map(doc => mapRecipe(doc, base)),
    default: (): Recipe[] => [],
    key: 'all-recipes',
  })
}

export function useRecentRecipes() {
  const config = useRuntimeConfig()
  const base = (config.public.payloadUrl as string).replace(/\/$/, '')
  return useFetch<Recipe[]>(`${base}/api/recipes`, {
    query: { limit: 5, depth: 1, sort: '-createdAt' },
    transform: (res: PayloadListResponse) => res.docs.map(doc => mapRecipe(doc, base)),
    default: (): Recipe[] => [],
    key: 'recent-recipes',
  })
}

export function useHighlightedRecipes() {
  const config = useRuntimeConfig()
  const base = (config.public.payloadUrl as string).replace(/\/$/, '')
  return useFetch<Recipe[]>(`${base}/api/recipes`, {
    query: { 'where[highlighted][equals]': true, limit: 4, depth: 1, sort: '-createdAt' },
    transform: (res: PayloadListResponse) => res.docs.map(doc => mapRecipe(doc, base)),
    default: (): Recipe[] => [],
    key: 'highlighted-recipes',
  })
}

export function useRecipeOfTheDay() {
  const config = useRuntimeConfig()
  const base = (config.public.payloadUrl as string).replace(/\/$/, '')
  return useFetch<Recipe | null>(`${base}/api/globals/recipe-of-the-day`, {
    query: { depth: 1 },
    transform: (res: PayloadRecipeOfTheDayResponse) =>
      res.recipe ? mapRecipe(res.recipe, base) : null,
    default: (): Recipe | null => null,
    key: 'recipe-of-the-day',
  })
}

export function useRecipeBySlug(slug: string) {
  const config = useRuntimeConfig()
  const base = (config.public.payloadUrl as string).replace(/\/$/, '')
  return useFetch<Recipe | null>(`${base}/api/recipes`, {
    query: { 'where[slug][equals]': slug, limit: 1, depth: 1 },
    transform: (res: PayloadListResponse) => res.docs[0] ? mapRecipe(res.docs[0], base) : null,
    default: (): Recipe | null => null,
    key: `recipe-${slug}`,
  })
}
