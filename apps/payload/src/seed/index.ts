import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'
import { rotateRecipeOfTheDay } from '../lib/rotateRecipeOfTheDay'
import { recipes } from './recipes/index'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMGS_DIR = path.resolve(__dirname, '../../public/imgs/food')

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function parseCookTime(time: string): number {
  const match = time.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

async function getOrUploadImage(payload: Payload, imgSrc: string, altText: string) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: imgSrc } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0]

  const imagePath = path.join(IMGS_DIR, imgSrc)
  if (!fs.existsSync(imagePath)) {
    payload.logger.warn(`  Image not found: ${imgSrc}`)
    return null
  }

  const data = fs.readFileSync(imagePath)
  const mimetype = MIME_MAP[path.extname(imgSrc).toLowerCase()] ?? 'image/jpeg'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (payload.create as any)({
    collection: 'media',
    data: { alt: altText },
    file: { data, mimetype, name: imgSrc, size: data.length },
  })
}

/**
 * Idempotent by design: every recipe is looked up by slug first, so a second run
 * updates rather than duplicates. That is what makes it safe to point at a
 * database that already has content — the destructive path is `--force` in
 * scripts/seed-prod.sh, and it is deliberately somewhere else.
 *
 * Running it is `run.ts`, which guards the target before this function is
 * reached. Keeping the two apart is what stops `tsx src/seed/index.ts` from
 * being a way around the guard.
 */
export async function seed(payload: Payload): Promise<void> {
  payload.logger.info('Seeding recipes...')

  for (const recipe of recipes) {
    const existing = await payload.find({
      collection: 'recipes',
      where: { slug: { equals: recipe.uri } },
      limit: 1,
    })

    const mediaDoc = await getOrUploadImage(payload, recipe.imgSrc, recipe.title)

    if (existing.docs.length > 0) {
      const existingDoc = existing.docs[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.update as any)({
        collection: 'recipes',
        id: existingDoc.id,
        data: {
          ...(existingDoc.featuredImage ? {} : { featuredImage: mediaDoc?.id ?? undefined }),
          highlighted: recipe.highlighted ?? false,
          _status: 'published',
        },
      })
      payload.logger.info(`  Updated "${recipe.title}"`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (payload.create as any)({
      collection: 'recipes',
      data: {
        slug: recipe.uri,
        title: recipe.title,
        description: recipe.description,
        cuisine: recipe.cuisine,
        time: recipe.time,
        cookTime: parseCookTime(recipe.time),
        servings: recipe.serves,
        imgSrc: recipe.imgSrc,
        featuredImage: mediaDoc?.id ?? undefined,
        highlighted: recipe.highlighted ?? false,
        intro: recipe.intro ?? '',
        ingredients: recipe.ingredients.map((i) => ({
          item: i.item,
          quantity: String(i.quantity),
          unit: i.unit ?? '',
        })),
        steps: recipe.method.map((s) => ({
          title: s.title,
          description: s.text,
        })),
        nutritional: (recipe.nutritional ?? []).map((n) => ({
          item: n.item,
          value: n.value,
        })),
        suggestions: (recipe.suggestions ?? []).map((s) => ({
          title: s.title,
          text: s.text,
        })),
        _status: 'published',
      },
    })

    payload.logger.info(`  Created "${recipe.title}"`)
  }

  await seedRecipeOfTheDay(payload)

  payload.logger.info('Done.')
}

/**
 * Give the `recipe-of-the-day` global a value.
 *
 * Without this a freshly seeded database has an empty global, `/api/recipes/daily`
 * answers `null`, and the home page renders the Recipe of the Day strip with no
 * card behind it — a feature that looks broken rather than absent. The cron only
 * fires at midnight, so nothing else would fill it in on the first day.
 *
 * Skipped when the global already points somewhere, so re-running the seed does
 * not stomp on whatever the rotation last chose.
 */
async function seedRecipeOfTheDay(payload: Payload): Promise<void> {
  const current = await payload.findGlobal({ slug: 'recipe-of-the-day', depth: 0 })
  if (current?.recipe) {
    payload.logger.info('Recipe of the day already set — leaving it alone.')
    return
  }

  const result = await rotateRecipeOfTheDay(payload)

  payload.logger.info(
    result.rotated
      ? `Recipe of the day set to "${result.slug}"`
      : `Recipe of the day not set: ${result.reason}`,
  )
}
