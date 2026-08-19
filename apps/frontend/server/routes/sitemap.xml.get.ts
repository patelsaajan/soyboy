/**
 * Hand-rolled rather than via @nuxtjs/sitemap: no build-time Payload dependency
 * and nothing extra to resolve on Workers.
 */
export default defineCachedEventHandler(async (event) => {
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
    { loc: `${origin}/`, changefreq: 'weekly', priority: '1.0', lastmod: undefined as string | undefined },
    { loc: `${origin}/recipes`, changefreq: 'weekly', priority: '0.9', lastmod: undefined as string | undefined },
    ...res.docs
      .filter(doc => doc.slug)
      .map(doc => ({
        loc: `${origin}/recipes/${doc.slug}`,
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

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return body
}, { maxAge: 60 * 60, name: 'sitemap', getKey: () => 'sitemap' })
