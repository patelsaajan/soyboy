type SeoInput = {
  title: string
  description: string
  /** Path only, e.g. '/recipes/lentil-bolognese' */
  path: string
  /** Absolute URL or site-relative path to the share image. */
  image?: string
  type?: 'website' | 'article'
}

/**
 * Sets title, description, canonical, Open Graph and Twitter tags in one call.
 *
 * Every page previously shipped with no metadata at all, so search results fell
 * back to Nuxt's default title and an invented description, and shared links had
 * no preview.
 */
export function useSeo(input: SeoInput) {
  const { public: { siteUrl, siteName } } = useRuntimeConfig()
  const origin = String(siteUrl).replace(/\/$/, '')
  const url = `${origin}${input.path}`
  const rawImage = input.image || '/imgs/food/default-food.jpg'
  const image = rawImage.startsWith('http') ? rawImage : `${origin}${rawImage}`

  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description,
    ogImage: image,
    ogImageAlt: input.title,
    ogUrl: url,
    ogType: input.type ?? 'website',
    ogSiteName: String(siteName),
    ogLocale: 'en_GB',
    twitterCard: 'summary_large_image',
    twitterTitle: input.title,
    twitterDescription: input.description,
    twitterImage: image,
    twitterImageAlt: input.title,
  })

  useHead({ link: [{ rel: 'canonical', href: url }] })
}

/**
 * Serialises a JSON-LD graph into a script tag. `<` is escaped because recipe
 * copy containing it would otherwise break out of the script element.
 */
export function useJsonLd(data: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[]>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() => JSON.stringify(toValue(data)).replace(/</g, '\\u003c')),
      },
    ],
  })
}
