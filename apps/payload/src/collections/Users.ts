import type { CollectionConfig } from 'payload'

// Secure cookies require HTTPS. Local dev serves the admin over
// http://localhost, where a Secure cookie would never be stored and login would
// silently fail — so this is production-only.
const isProduction = process.env.NODE_ENV === 'production'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'updatedAt'],
  },
  auth: {
    // Payload's defaults are `secure: false, sameSite: 'Lax'` (see
    // payload/dist/collections/config/defaults.js). `secure: false` means the
    // session cookie is sent over plaintext HTTP, so any http:// request to the
    // CMS host before HSTS is pinned exposes the admin JWT.
    cookies: {
      secure: isProduction,
      sameSite: 'Lax',
    },
    tokenExpiration: 7200,
    // These match the current defaults — set explicitly so a future refactor
    // can't silently drop the login throttling.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    // Authentication is not authorisation: without these, any authenticated
    // user could edit or delete any other user's account.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user }, id }) => Boolean(user) && user?.id === id,
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Email and password are added by the auth config.
  ],
}
