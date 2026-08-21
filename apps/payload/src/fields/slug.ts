import type { Field } from 'payload'

/**
 * A URL slug, derived from another field on first save and stable thereafter.
 *
 * Slugs are the site's public addresses: `/recipes/<slug>`, and the key the
 * purge hook names when a recipe changes. Three rules follow, and all three are
 * enforced here rather than left to editor discipline.
 *
 * 1. **Shape is validated, not just suggested.** A slug with a space, a slash or
 *    an uppercase letter produces a URL that either 404s or resolves
 *    inconsistently once encoded — and the failure only shows up on the live
 *    site. The pattern is the same one the frontend accepts before it will cache
 *    a response (`apps/frontend/server/utils/cache.ts`); a slug this rejects is
 *    a page that would never be cached.
 * 2. **It is required.** A recipe without one is addressed by numeric id, which
 *    no purge list can predict — the page would go stale and stay stale.
 * 3. **It is auto-filled but never auto-*updated*.** Retitling a published
 *    recipe must not silently move its URL and orphan every inbound link, so the
 *    derivation runs only when the field is empty. Deliberately changing it is
 *    still allowed; the purge hook handles the old URL (see `stalePathsFor`).
 */
export function slugField({
  from,
  description,
}: {
  /** The field to derive from when the slug is left blank. */
  from: string
  description: string
}): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description,
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim() !== '') return slugify(value)
          const source = data?.[from]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
    validate: (value: string | null | undefined) => {
      if (typeof value !== 'string' || value === '') return 'A slug is required.'
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
        return 'Use lower-case letters, numbers and single hyphens only, e.g. "lentil-bolognese".'
      }
      return true
    },
  }
}

function slugify(input: string): string {
  return (
    input
      .normalize('NFKD')
      // Strip accents, so "Aglio e Olio à la Maison" keeps its words instead of
      // losing them to the non-alphanumeric pass below.
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}
