import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
    }),
    recipes: defineCollection({
      type: "page",
      source: "recipes/**/*.md",
      schema: z.object({
        uri: z.string().optional(),
        imgSrc: z.string().optional(),
        time: z.string().optional(),
        serves: z.number().optional(),
        cuisine: z.string().optional(),
        description: z.string().optional(),
      }),
    }),
  },
});
