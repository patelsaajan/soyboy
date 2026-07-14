// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2026-04-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  app: {
    head: {
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
    '/':            { swr: 60 * 60 * 24 },      // home — revalidate daily
    '/recipes':     { swr: 60 * 60 * 24 * 7 },  // recipes index — weekly
    '/recipes/**':  { swr: 60 * 60 * 24 * 7 },  // recipe pages — weekly
  },

  // Image optimization via Cloudflare Transformations (resize + WebP/AVIF at the
  // edge, no sharp). REQUIRES the frontend on a Cloudflare custom domain with
  // Image Transformations enabled (dashboard → Images → Transformations). It does
  // NOT work on *.workers.dev. Until then this is off and NuxtImg passes images
  // through full-size. Flip it on once the domain is live:
  // image: {
  //   provider: 'cloudflare',
  //   cloudflare: { baseURL: 'https://<your-frontend-domain>' },
  // },

  runtimeConfig: {
    payloadUrl: process.env.PAYLOAD_URL || 'http://localhost:3000',
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/icon",
    "@nuxt/fonts",
  ],
});