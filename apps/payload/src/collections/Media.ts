import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // media is served publicly by design
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
