import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'
import { getCloudflareContext } from '@opennextjs/cloudflare'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Recipes } from './collections/Recipes'
import { RecipeOfTheDay } from './globals/RecipeOfTheDay'
import { rotateRecipeOfTheDayTask } from './tasks/rotateRecipeOfTheDay'
import { config } from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Resolve the Postgres connection string.
 *
 * On Cloudflare Workers we route through the Hyperdrive binding (edge connection
 * pooling + query caching); everywhere else (local dev, Payload CLI, build,
 * Railway) we fall back to DATABASE_URL. getCloudflareContext() throws outside
 * the Workers runtime, so the try/catch is the switch between the two.
 */
function resolveConnectionString(): string {
  try {
    const { env } = getCloudflareContext()
    const hyperdrive = (env as { HYPERDRIVE?: { connectionString?: string } }).HYPERDRIVE
    if (hyperdrive?.connectionString) return hyperdrive.connectionString
  } catch {
    // Not inside the Workers runtime — use the plain connection string below.
  }
  return process.env.DATABASE_URL || ''
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      icons: [{ rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }],
    },
  },
  collections: [Users, Media, Recipes],
  globals: [RecipeOfTheDay],
  // The task stays registered (so its slug is typed and a Cloudflare Cron
  // Trigger can invoke it later), but autoRun is intentionally omitted:
  // Payload's autoRun scheduler needs a persistent process, which Workers
  // doesn't have. Nothing runs this until a Cron Trigger hits the jobs endpoint.
  jobs: {
    tasks: [rotateRecipeOfTheDayTask],
    access: {
      run: ({ req }) => !!req.user,
    },
  },
  editor: lexicalEditor(),
  // The frontend consumes REST over the service binding; GraphQL is unused, so
  // disable it to shrink the public attack surface (and the bundle).
  graphQL: { disable: true },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: resolveConnectionString(),
      // Workers isolates each request, so a long-lived pool can't be reused
      // across them — Hyperdrive does the pooling instead. maxUses: 1 keeps
      // node-postgres from holding connections open between requests.
      maxUses: 1,
    },
  }),
  // sharp intentionally omitted: it's a native binary that can't run on
  // Cloudflare Workers. Payload's Media collection has no imageSizes/resize
  // pipeline, so the only loss is auto width/height metadata + admin
  // thumbnails. On-the-fly resizing is handled at the edge (Cloudflare Images
  // / @nuxt/image) instead.
  plugins: [
    s3Storage({
      enabled: !!(process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME),
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET_NAME || '',
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT_URL || '',
        // R2 requires path-style addressing.
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:4000',
    process.env.PAYLOAD_URL || 'http://localhost:3000',
    'http://localhost:4000', // Local development,
    'http://localhost:4001', // Preview mode
  ].filter(Boolean),
})
