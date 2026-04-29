import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Cuisine', value: 'cuisine' },
        { label: 'Meal Type', value: 'meal-type' },
        { label: 'Diet', value: 'diet' },
      ],
    },
  ],
}
