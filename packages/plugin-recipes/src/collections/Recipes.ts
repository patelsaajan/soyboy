import type { CollectionConfig } from 'payload'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    defaultColumns: ['title', 'status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
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
      name: 'cookTime',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
      label: 'Cook Time (minutes)',
      min: 0,
    },
    {
      name: 'servings',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
      min: 1,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
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
              admin: {
                rows: 4,
              },
              required: true,
            },
          ],
          label: 'Overview',
        },
        {
          fields: [
            {
              name: 'ingredients',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '@sidequest-saajan/plugin-recipes/client#IngredientRowLabel',
                },
              },
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'quantity',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'unit',
                  type: 'text',
                },
              ],
              minRows: 1,
            },
          ],
          label: 'Ingredients',
        },
        {
          fields: [
            {
              name: 'steps',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '@sidequest-saajan/plugin-recipes/client#StepRowLabel',
                },
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
              ],
              minRows: 1,
            },
          ],
          label: 'Method',
        },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
}
