import type { Access } from 'payload'

/** Any signed-in CMS user. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * Public read for published documents only.
 *
 * Returning a query constraint (rather than a boolean) is Payload's row-level
 * security pattern: signed-in editors see everything, anonymous callers get a
 * `_status = 'published'` filter applied to every find. Without this, a
 * collection with `versions.drafts` enabled serves never-published drafts over
 * the public REST API — Payload does not filter them out for you.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
