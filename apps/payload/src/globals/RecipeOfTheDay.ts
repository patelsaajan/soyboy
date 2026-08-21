import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'
import { publishGlobalHooks } from '../hooks/onPublish'

export const RecipeOfTheDay: GlobalConfig = {
  slug: 'recipe-of-the-day',
  access: {
    read: () => true,
    update: authenticated,
  },
  // The rotation task writes this global, and the home page reads it — without a
  // purge the site would keep showing yesterday's pick for a full day after the
  // cron has already moved on.
  hooks: publishGlobalHooks,
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
