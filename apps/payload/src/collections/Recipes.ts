import type { CollectionConfig } from 'payload'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  access: {
    read: () => true,
  },
  admin: {
    defaultColumns: ['title', 'status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'highlighted',
      type: 'checkbox',
      label: 'Highlighted',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show in the Highlights section on the recipe archive page' },
    },
    {
      name: 'slug',
      type: 'text',
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return value
          },
        ],
      },
      index: true,
      unique: true,
    },
    {
      name: 'cuisine',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'time',
      type: 'text',
      label: 'Cook Time (display)',
      admin: { position: 'sidebar', description: 'e.g. "30 minutes"' },
    },
    {
      name: 'cookTime',
      type: 'number',
      label: 'Cook Time (minutes)',
      admin: { position: 'sidebar' },
      min: 0,
    },
    {
      name: 'servings',
      type: 'number',
      admin: { position: 'sidebar' },
      min: 1,
    },
    {
      name: 'imgSrc',
      type: 'text',
      label: 'Image filename',
      admin: { position: 'sidebar', description: 'e.g. "aglio-e-olio.jpg"' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { rows: 4 },
              required: true,
            },
            {
              name: 'intro',
              type: 'textarea',
              admin: { rows: 4 },
            },
          ],
        },
        {
          label: 'Ingredients',
          fields: [
            {
              name: 'ingredients',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '@/components/IngredientRowLabel#IngredientRowLabel',
                },
              },
              fields: [
                { name: 'item', type: 'text', required: true },
                { name: 'quantity', type: 'text', required: true },
                { name: 'unit', type: 'text' },
              ],
              minRows: 1,
            },
          ],
        },
        {
          label: 'Method',
          fields: [
            {
              name: 'steps',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '@/components/StepRowLabel#StepRowLabel',
                },
              },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
              ],
              minRows: 1,
            },
            {
              name: 'suggestions',
              type: 'array',
              label: 'Variations / Suggestions',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Nutrition',
          fields: [
            {
              name: 'nutritional',
              type: 'array',
              label: 'Nutritional Information',
              fields: [
                { name: 'item', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
}
