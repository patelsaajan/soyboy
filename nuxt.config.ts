// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/icon",
    "@nuxt/fonts",
  ],

  css: ["~/assets/css/main.css"],
});
