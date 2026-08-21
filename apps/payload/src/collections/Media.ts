import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'
import { publishHooks } from '../hooks/onPublish'

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
  // Replacing or deleting an image has to invalidate the URL the site serves it
  // from, which is on the frontend origin rather than Payload's. See
  // hooks/onPublish.ts.
  hooks: publishHooks,
}
