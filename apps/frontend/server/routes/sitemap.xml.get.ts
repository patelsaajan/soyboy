import { STATIC_PAGE_PATHS, recipePagePath } from '@soyboy/shared'

/**
 * Hand-rolled rather than via @nuxtjs/sitemap: no build-time Payload dependency
 * and nothing extra to resolve on Workers.
 *
 * Paths come from the shared contract so a recipe's sitemap entry, its page URL
 * and the URL the CMS purges are all the same string. A sitemap listing a URL
 * the purge does not know about is how a renamed recipe ends up advertised at a
 * stale address for a day.
 */
export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)
  const origin = String(siteUrl).replace(/\/$/, '')

  const res = await payloadFetch<PayloadListResponse>(event, '/api/recipes', {
    limit: 500,
    depth: 0,
    'where[_status][equals]': 'published',
  })

  const escapeXml = (value: string) =>
    value.replace(/[<>&'"]/g, c =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string))

  const entries = [
    ...STATIC_PAGE_PATHS.map((path, index) => ({
      loc: `${origin}${path}`,
      changefreq: 'weekly',
      priority: index === 0 ? '1.0' : '0.9',
      lastmod: undefined as string | undefined,
    })),
    ...res.docs
      .filter(doc => doc.slug)
      .map(doc => ({
        loc: `${origin}${recipePagePath(doc.slug)}`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: doc.updatedAt,
      })),
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(entry => [
      '  <url>',
      `    <loc>${escapeXml(entry.loc)}</loc>`,
      entry.lastmod ? `    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : null,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].filter(Boolean).join('\n')),
    '</urlset>',
    '',
  ].join('\n')

  // The edge-cache plugin owns cache-control for this route; setting it here
  // too would be a second source of truth for the same header.
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
