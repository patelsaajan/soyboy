import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'

export const RecipeOfTheDay: GlobalConfig = {
  slug: 'recipe-of-the-day',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'recipe',
      type: 'relationship',
      relationTo: 'recipes',
      required: true,
    },
    {
      name: 'lastRotated',
      type: 'date',
      admin: { readOnly: true, description: 'Last time the recipe was automatically rotated' },
    },
  ],
}
