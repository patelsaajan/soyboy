/**
 * Picking the recipe of the day.
 *
 * Kept out of the task handler because two very different callers need it and
 * neither can reach the other: Payload's job runner (an admin pressing "run", or
 * the `payload jobs:run` CLI) and the Cron Trigger's HTTP route
 * (`/cron/rotate-recipe-of-the-day`). Workers has no persistent process, so
 * `jobs.autoRun` never fires there — see the note in `payload.config.ts`.
 *
 * Writing the global is what makes the change visible: `RecipeOfTheDay` spreads
 * `publishGlobalHooks`, so the update purges the frontend's cached `/` and
 * `/api/recipes/daily`. Without that the site would keep serving yesterday's
 * pick for the rest of the edge TTL — a full day — with the cron already moved
 * on and nothing reporting a fault.
 */
import type { Payload } from 'payload'

export type RotationResult =
  | { rotated: true; id: number | string; slug: string; candidates: number }
  | { rotated: false; reason: 'no-published-recipes' }

/**
 * Choose a new recipe of the day at random and write it to the global.
 *
 * The current pick is excluded whenever there is anything else to choose from.
 * A uniform draw over the whole set would land on yesterday's recipe roughly
 * 1-in-N times, and a "recipe of the day" that visibly did not change reads as a
 * broken cron rather than as chance — which is the exact failure this rotation
 * is meant to make impossible to have silently.
 *
 * `Math.random()` is enough here: this is a cosmetic choice, not a security one,
 * and it behaves the same in workerd as it does under the Node CLI.
 */
export async function rotateRecipeOfTheDay(payload: Payload): Promise<RotationResult> {
  const published = await payload.find({
    collection: 'recipes',
    where: { _status: { equals: 'published' } },
    depth: 0,
    pagination: false,
    limit: 0,
  })

  if (published.docs.length === 0) {
    return { rotated: false, reason: 'no-published-recipes' }
  }

  // depth 0 leaves the relationship as a bare id, which is all that is needed to
  // exclude it.
  const current = await payload.findGlobal({ slug: 'recipe-of-the-day', depth: 0 })
  const currentId = current?.recipe ?? null

  const eligible = published.docs.filter((doc) => doc.id !== currentId)
  // Falls back to the full set when the only published recipe is the current
  // one — re-picking it is better than leaving the global pointing at a recipe
  // that may since have been unpublished.
  const candidates = eligible.length > 0 ? eligible : published.docs

  const picked = candidates[Math.floor(Math.random() * candidates.length)]!

  await payload.updateGlobal({
    slug: 'recipe-of-the-day',
    data: {
      recipe: picked.id,
      lastRotated: new Date().toISOString(),
    },
  })

  return {
    rotated: true,
    id: picked.id,
    slug: typeof picked.slug === 'string' ? picked.slug : String(picked.id),
    candidates: candidates.length,
  }
}
