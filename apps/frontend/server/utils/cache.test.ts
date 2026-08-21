import { describe, expect, it } from 'vitest'
import {
  MEDIA_CACHE_CONTROL,
  STATIC_CACHEABLE_PATHS,
  mediaFilePath,
  recipeApiPath,
  recipePagePath,
} from '@soyboy/shared'
import { CACHE_TAG, edgeCacheControl, isMediaPath, isRecipeSlug } from './cache'

describe('edge cache policy', () => {
  /**
   * The invariant the whole freshness story rests on: anything the edge stores
   * must be something the CMS can name in a purge. A URL that is cacheable but
   * unpurgeable goes stale for a day and nothing reports it.
   */
  it('caches only URLs the purge hook can name', () => {
    for (const path of STATIC_CACHEABLE_PATHS) {
      expect(edgeCacheControl(path), path).not.toBeNull()
    }
    expect(edgeCacheControl(recipePagePath('lentil-bolognese'))).not.toBeNull()
    expect(edgeCacheControl(recipeApiPath('lentil-bolognese'))).not.toBeNull()
    expect(edgeCacheControl(mediaFilePath('aglio-e-olio.jpg'))).not.toBeNull()
  })

  it('refuses to cache anything not on the allowlist', () => {
    for (const path of [
      '/admin',
      '/api/recipes',
      '/api/recipes/a/b',
      '/recipes/a/b',
      '/api/media/file/',
      '/some/new/route',
      '',
    ]) {
      expect(edgeCacheControl(path), path).toBeNull()
    }
  })

  it('rejects slugs the CMS could never produce', () => {
    for (const slug of ['Lentil', 'lentil bolognese', 'lentil--x', '-lentil', 'lentil-', '']) {
      expect(isRecipeSlug(slug), slug).toBe(false)
      expect(edgeCacheControl(`/recipes/${slug}`), slug).toBeNull()
    }
  })

  it('rejects media paths that could escape the uploads prefix', () => {
    for (const path of ['../admin', 'a/../../b', 'a/../b/..', 'a b.jpg', '']) {
      expect(isMediaPath(path), path).toBe(false)
    }
    expect(isMediaPath('aglio-e-olio.jpg')).toBe(true)
  })

  /**
   * Uploads are the one thing served with a private, immutable cache, because
   * their bytes genuinely never change. If this ever picked up the
   * revalidate-always header the rest of the site uses, every image on the page
   * would cost a round-trip.
   */
  it('serves uploads immutable and everything else revalidating', () => {
    expect(edgeCacheControl(mediaFilePath('x.jpg'))).toBe(MEDIA_CACHE_CONTROL)
    for (const path of STATIC_CACHEABLE_PATHS) {
      expect(edgeCacheControl(path), path).toContain('max-age=0, must-revalidate')
      expect(edgeCacheControl(path), path).toContain('s-maxage=')
    }
  })

  /**
   * The tag the frontend writes and the tag the CMS purges are the same string
   * only because both import it. This asserts the re-export has not been
   * shadowed by a local literal.
   */
  it('tags responses with the tag the CMS purges', () => {
    expect(CACHE_TAG).toBe('soyboy-content')
  })
})
