import type { H3Event } from 'h3'
import type { Recipe } from '~~/types/recipes'

/** Minimal shape of a Cloudflare service binding (a fetcher to another Worker). */
type ServiceBinding = { fetch: (request: Request) => Promise<Response> }

/**
 * Payload base URL. Only used as a server-side fallback when the BACKEND service
 * binding isn't present (local dev / non-Workers hosts). In production the
 * binding handles everything, so this URL is never sent to the browser — the
 * Payload origin stays private.
 */
export function payloadBase(): string {
  const { payloadUrl } = useRuntimeConfig()
  return (payloadUrl as string).replace(/\/$/, '')
}

/** The BACKEND service binding, if we're running on Cloudflare Workers. */
function backendBinding(event: H3Event): ServiceBinding | undefined {
  return (event.context as { cloudflare?: { env?: Record<string, unknown> } })
    .cloudflare?.env?.BACKEND as ServiceBinding | undefined
}

/**
 * Fetch a raw Response from Payload (used to proxy media). Goes worker-to-worker
 * via the binding when available, else public HTTP via payloadUrl for local dev.
 */
export async function payloadRaw(event: H3Event, path: string): Promise<Response> {
  const backend = backendBinding(event)
  if (backend) {
    return backend.fetch(new Request(`https://backend${path}`))
  }
  return fetch(`${payloadBase()}${path}`)
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

  const backend = backendBinding(event)

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

export function mapRecipe(doc: PayloadRecipeDoc): Recipe {
  // Keep media URLs RELATIVE so the browser loads them from the frontend origin,
  // where /api/media/file/** is proxied to Payload over the service binding.
  // This keeps the Payload URL out of the page entirely.
  const heroUrl = doc.featuredImage?.url ?? null
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
