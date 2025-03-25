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
        published: z.boolean().optional(),
        imgSrc: z.string().optional(),
        time: z.string().optional(),
        serves: z.number().optional(),
        cuisine: z.string().optional(),
        description: z.string().optional(),
        ingredients: z
          .array(
            z.object({
              quantity: z.string().optional(),
              item: z.string().optional(),
            })
          )
          .optional(),
        nutritional: z
          .array(
            z.object({
              item: z.string().optional(),
              value: z.string().optional(),
            })
          )
          .optional(),
      }),
    }),
  },
});
