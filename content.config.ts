import { defineContentConfig, defineCollection } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
    }),
    recipes: defineCollection({
      type: "page",
      source: "recipes/**/*.md",
    }),
  },
});
