import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config.js'
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

async function getOrUploadImage(payload: Awaited<ReturnType<typeof getPayload>>, imgSrc: string, altText: string) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: imgSrc } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0]

  const imagePath = path.join(IMGS_DIR, imgSrc)
  if (!fs.existsSync(imagePath)) {
    console.warn(`  Image not found: ${imgSrc}`)
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

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding recipes...')

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
        },
      })
      console.log(`  Updated "${recipe.title}"`)
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

    console.log(`  Created "${recipe.title}"`)
  }

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
