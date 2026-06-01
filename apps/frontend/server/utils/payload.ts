import type { Recipe } from '~~/types/recipes'

export type PayloadIngredient  = { id?: string; item: string; quantity: string; unit?: string }
export type PayloadStep        = { id?: string; title: string; description: string }
export type PayloadNutritional = { id?: string; item: string; value: string }
export type PayloadSuggestion  = { id?: string; title: string; text: string }

export type PayloadRecipeDoc = {
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

export type PayloadListResponse = {
  docs: PayloadRecipeDoc[]
  totalDocs: number
  limit: number
  page: number
}

export type PayloadRecipeOfTheDayResponse = {
  recipe?: PayloadRecipeDoc | null
  lastRotated?: string | null
}

export function mapRecipe(doc: PayloadRecipeDoc, base: string): Recipe {
  const heroUrl = doc.featuredImage?.url
    ? doc.featuredImage.url.startsWith('http')
      ? doc.featuredImage.url
      : `${base}${doc.featuredImage.url}`
    : null
  return {
    title: doc.title,
    date: doc.createdAt,
    published: doc._status === 'published',
    highlighted: doc.highlighted ?? false,
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
