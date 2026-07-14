import type { H3Event } from 'h3'
import type { Recipe } from '~~/types/recipes'

/** Minimal shape of a Cloudflare service binding (a fetcher to another Worker). */
type ServiceBinding = { fetch: (request: Request) => Promise<Response> }

/**
 * The public Payload base URL, used to build absolute image URLs the browser
 * can load directly. This stays the public origin even when API calls go
 * through the service binding — the binding only serves the SSR fetch, not the
 * user's browser.
 */
export function payloadBase(): string {
  const { payloadUrl } = useRuntimeConfig()
  return (payloadUrl as string).replace(/\/$/, '')
}

/**
 * Fetch JSON from Payload. On Cloudflare, if the BACKEND service binding is
 * present, the request goes worker-to-worker (no public hop, lower latency, no
 * egress). Otherwise it falls back to public HTTP via payloadUrl — so this also
 * works in local dev and on any non-Workers host.
 */
export async function payloadFetch<T>(
  event: H3Event,
  path: string,
  query?: Record<string, string | number | boolean>,
): Promise<T> {
  const qs = query
    ? '?' +
      new URLSearchParams(
        Object.entries(query).map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''

  const backend = (event.context as { cloudflare?: { env?: Record<string, unknown> } })
    .cloudflare?.env?.BACKEND as ServiceBinding | undefined

  if (backend) {
    // The service binding ignores the host, so any absolute URL works — only
    // the path + query reach the Payload Worker.
    const res = await backend.fetch(new Request(`https://backend${path}${qs}`))
    if (!res.ok) {
      throw createError({ statusCode: res.status, statusMessage: `Payload ${res.status}` })
    }
    return (await res.json()) as T
  }

  return await $fetch<T>(`${payloadBase()}${path}${qs}`)
}

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
