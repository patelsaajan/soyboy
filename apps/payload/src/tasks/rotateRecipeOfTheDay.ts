import type { TaskConfig } from 'payload'

import { rotateRecipeOfTheDay } from '../lib/rotateRecipeOfTheDay'

/**
 * The rotation as a Payload job.
 *
 * On Workers nothing runs this on a timer — `jobs.autoRun` needs a persistent
 * process, and the Cron Trigger goes through `/cron/rotate-recipe-of-the-day`
 * instead. The task stays registered because it is still the way to rotate
 * *now*: from the admin UI, or `pnpm payload jobs:run --queue default` against a
 * local database.
 *
 * `schedule` is left in for the same reason — it documents the intended cadence
 * and is what a Node deployment of this config would use. It must stay in step
 * with `triggers.crons` in `apps/payload/wrangler.jsonc`, which is what actually
 * fires in production.
 */
export const rotateRecipeOfTheDayTask: TaskConfig = {
  slug: 'rotate-recipe-of-the-day',
  label: 'Rotate Recipe of the Day',
  schedule: [{ cron: '0 0 * * *', queue: 'default' }],
  handler: async ({ req }) => {
    const result = await rotateRecipeOfTheDay(req.payload)

    if (result.rotated) {
      req.payload.logger.info(
        `Recipe of the day rotated to: ${result.slug} (from ${result.candidates} candidates)`,
      )
    } else {
      req.payload.logger.warn(`Recipe of the day not rotated: ${result.reason}`)
    }

    return { output: {} }
  },
}
