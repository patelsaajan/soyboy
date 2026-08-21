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

  // Cache-control for public routes is set by server/plugins/edge-cache.ts, which
  // is also what stores the response in Cloudflare's cache. Route rules here
  // carry only what is true regardless of caching: security headers, and the
  // crawler directive on the JSON endpoints.
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
    // Files under public/ are served by the ASSETS binding before the Worker
    // runs, so the edge-cache plugin never sees them. Nitro compiles these rules
    // into .output/public/_headers, which is what actually applies to them —
    // which is also why their cache-control belongs here rather than in a
    // hand-written _headers file that would duplicate half of it.
    '/imgs/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.svg': { headers: { 'cache-control': 'public, max-age=604800' } },
    '/favicon.ico': { headers: { 'cache-control': 'public, max-age=604800' } },
    // The JSON endpoints exist to hydrate pages, not to be indexed in their own
    // right; without this, search results carry raw API payloads.
    '/api/recipes/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
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