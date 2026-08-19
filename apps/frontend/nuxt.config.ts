// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2026-04-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      titleTemplate: '%s | Soyboy Saajan',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  nitro: {
    preset: 'cloudflare_module',
  },

  // Stale-while-revalidate: serve cached HTML instantly and revalidate in the
  // background, so most page views skip a full SSR render.
  routeRules: {
    // Baseline security headers on every response.
    '/**': {
      headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        // Recipe copy is CMS-authored. Vue escapes it today, so there is no
        // live XSS — but the moment rich text is rendered with v-html this is
        // the only thing standing between a CMS compromise and script
        // execution on the public origin.
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // Nuxt inlines its hydration payload
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
        ].join('; '),
      },
    },
    // Static images are content-addressed by filename and never mutate in
    // place; without this they inherit Workers' default
    // `max-age=0, must-revalidate` and pay a round-trip on every page view.
    '/imgs/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    // JSON endpoints are cached server-side by defineCachedEventHandler but had
    // no client/edge caching at all.
    '/api/recipes/**': {
      headers: {
        'cache-control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
    '/':            { swr: 60 * 60 * 24 },      // home — revalidate daily
    '/recipes':     { swr: 60 * 60 * 24 * 7 },  // recipes index — weekly
    '/recipes/**':  { swr: 60 * 60 * 24 * 7 },  // recipe pages — weekly
  },

  // Image optimization via Cloudflare Transformations (resize + WebP/AVIF at the
  // edge, no sharp). NuxtImg rewrites srcs to /cdn-cgi/image/<opts>/<src> on the
  // custom domain; the source is the hidden media proxy so the Payload URL stays
  // private. Needs Image Transformations enabled on the zone + the
  // global_fetch_strictly_public flag (see wrangler.jsonc) so same-zone fetches
  // don't trip Cloudflare error 1042.
  image: {
    provider: 'cloudflare',
    cloudflare: { baseURL: 'https://soyboy.saajanpatel.co.uk' },
    // Default quality for every transformed image. Format conversion is driven
    // by format="auto" on NuxtImg (→ f=auto, Cloudflare serves AVIF/WebP per
    // the browser's Accept header) and resizing by the `sizes` prop.
    quality: 80,
  },

  runtimeConfig: {
    payloadUrl: process.env.PAYLOAD_URL || 'http://localhost:3000',
    public: {
      // Canonical origin for absolute URLs in meta tags, JSON-LD and sitemap.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://soyboy.saajanpatel.co.uk',
      siteName: 'Soyboy Saajan',
    },
  },

  // @nuxt/ui already declares @nuxt/icon and @nuxt/fonts as module dependencies
  // (with defaults like icon's cssLayer: 'base'). Listing them again after it
  // risks them initialising without those defaults.
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
  ],

  // Without a local bundle the server resolver fetches every icon from
  // api.iconify.design at runtime, putting a third party on the render path.
  icon: {
    serverBundle: { collections: ['ph', 'lucide'] },
  },

  fonts: {
    families: [
      { name: 'Bungee', provider: 'google' },
      { name: 'Nunito', provider: 'google' },
    ],
  },
});