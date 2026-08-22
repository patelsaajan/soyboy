import { describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { rotateRecipeOfTheDay } from '@/lib/rotateRecipeOfTheDay'

/**
 * The selection rules, against a stub rather than a database.
 *
 * What is worth pinning here is the *choosing*, not the querying: that the
 * current pick is excluded (a recipe of the day that does not change reads as a
 * broken cron), that an empty CMS is handled rather than throwing at midnight,
 * and that the single-recipe case does not deadlock itself into picking nothing.
 * Those are decisions in this function; the `find`/`updateGlobal` round-trip is
 * Payload's and is covered by actually running it.
 */
type Doc = { id: number; slug: string }

function stubPayload(published: Doc[], currentId: number | null) {
  const updates: { recipe: number; lastRotated: string }[] = []

  const payload = {
    find: async () => ({ docs: published }),
    findGlobal: async () => ({ recipe: currentId }),
    updateGlobal: async ({ data }: { data: { recipe: number; lastRotated: string } }) => {
      updates.push(data)
      return data
    },
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  } as unknown as Payload

  return { payload, updates }
}

const RECIPES: Doc[] = [
  { id: 1, slug: 'aglio-e-olio' },
  { id: 2, slug: 'banana-bread' },
  { id: 3, slug: 'pancakes' },
]

describe('rotateRecipeOfTheDay', () => {
  it('never picks the recipe that is already showing', async () => {
    // Repeated because the choice is random: a single pass would pass by luck
    // roughly two times in three even if the exclusion were removed entirely.
    for (let i = 0; i < 50; i++) {
      const { payload, updates } = stubPayload(RECIPES, 2)
      const result = await rotateRecipeOfTheDay(payload)

      expect(result.rotated).toBe(true)
      expect(result).toMatchObject({ candidates: 2 })
      expect(updates).toHaveLength(1)
      expect(updates[0]!.recipe).not.toBe(2)
    }
  })

  it('writes the pick and a lastRotated stamp to the global', async () => {
    const { payload, updates } = stubPayload(RECIPES, null)
    const result = await rotateRecipeOfTheDay(payload)

    expect(result.rotated).toBe(true)
    if (!result.rotated) return
    expect(updates[0]!.recipe).toBe(result.id)
    expect(Date.parse(updates[0]!.lastRotated)).not.toBeNaN()
  })

  it('can reach every published recipe', async () => {
    const seen = new Set<number>()
    for (let i = 0; i < 200; i++) {
      const { updates, payload } = stubPayload(RECIPES, null)
      await rotateRecipeOfTheDay(payload)
      seen.add(updates[0]!.recipe)
    }
    expect(seen.size).toBe(RECIPES.length)
  })

  it('re-picks the only recipe rather than leaving the global unwritten', async () => {
    const only = [RECIPES[0]!]
    const { payload, updates } = stubPayload(only, only[0]!.id)
    const result = await rotateRecipeOfTheDay(payload)

    expect(result).toMatchObject({ rotated: true, candidates: 1 })
    expect(updates[0]!.recipe).toBe(only[0]!.id)
  })

  it('reports rather than throws when nothing is published', async () => {
    const { payload, updates } = stubPayload([], null)
    const result = await rotateRecipeOfTheDay(payload)

    expect(result).toEqual({ rotated: false, reason: 'no-published-recipes' })
    expect(updates).toHaveLength(0)
  })
})
