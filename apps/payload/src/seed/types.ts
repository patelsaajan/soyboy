export type SeedIngredient = { quantity: number | string; unit?: string; item: string }
export type SeedStep = { title: string; text: string }
export type SeedNutritional = { item: string; value: string }
export type SeedSuggestion = { title: string; text: string }

export type SeedRecipe = {
  title: string
  uri: string
  cuisine: string
  time: string
  serves: number
  description: string
  imgSrc: string
  intro: string
  ingredients: SeedIngredient[]
  method: SeedStep[]
  nutritional?: SeedNutritional[]
  suggestions?: SeedSuggestion[]
  servingSuggestions?: string[]
  highlighted?: boolean
}
