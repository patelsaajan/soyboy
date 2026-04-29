import type { CollectionConfig } from 'payload'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'difficulty', 'status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'prepTime',
      type: 'number',
      label: 'Prep Time (minutes)',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'cookTime',
      type: 'number',
      label: 'Cook Time (minutes)',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'servings',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'ingredients',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'quantity',
          type: 'text',
          required: true,
        },
        {
          name: 'unit',
          type: 'text',
        },
        {
          name: 'item',
          type: 'text',
          required: true,
        },
        {
          name: 'notes',
          type: 'text',
        },
      ],
    },
    {
      name: 'instructions',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'step',
          type: 'richText',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
      label: 'Chef\'s Notes',
    },
  ],
}
