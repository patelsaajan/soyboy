// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2026-04-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      payloadUrl: process.env.PAYLOAD_URL || 'http://localhost:3000',
    },
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/icon",
    "@nuxt/fonts",
  ],
});