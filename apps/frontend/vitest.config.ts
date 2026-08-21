import { defineConfig } from 'vitest/config'

/**
 * Unit tests only — no Nuxt runtime, no DOM, no database.
 *
 * What is worth testing here is the cache policy: which URLs get stored at the
 * edge, and whether that set is the same one the CMS knows how to purge. Both
 * halves are pure functions over strings precisely so this file can stay this
 * small.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts'],
  },
})
