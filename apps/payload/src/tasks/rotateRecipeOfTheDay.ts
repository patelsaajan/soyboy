import type { TaskConfig } from 'payload'

export const rotateRecipeOfTheDayTask: TaskConfig = {
  slug: 'rotate-recipe-of-the-day',
  label: 'Rotate Recipe of the Day',
  schedule: [{ cron: '0 0 * * *', queue: 'default' }],
  handler: async ({ req }) => {
    const result = await req.payload.find({
      collection: 'recipes',
      where: { _status: { equals: 'published' } },
      limit: 0,
      depth: 0,
    })

    if (!result.docs.length) {
      return { output: {} }
    }

    const randomIndex = Math.floor(Math.random() * result.docs.length)
    const picked = result.docs[randomIndex]!

    await req.payload.updateGlobal({
      slug: 'recipe-of-the-day',
      data: {
        recipe: picked.id,
        lastRotated: new Date().toISOString(),
      },
    })

    req.payload.logger.info(`Recipe of the day rotated to: ${picked.slug}`)
    return { output: {} }
  },
}
