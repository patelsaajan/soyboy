import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Recipes } from './collections/Recipes'
import { RecipeOfTheDay } from './globals/RecipeOfTheDay'
import { rotateRecipeOfTheDayTask } from './tasks/rotateRecipeOfTheDay'
import { config } from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
  jobs: {
    tasks: [rotateRecipeOfTheDayTask],
    autoRun: [{ cron: '* * * * *', queue: 'default' }],
    access: {
      run: ({ req }) => !!req.user,
    },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
    enabled: !!(process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME),
    collections : {
      media: true,
    },
    bucket: process.env.S3_BUCKET_NAME || '',
    config: {
      region: process.env.S3_REGION || '',
      endpoint: process.env.S3_ENDPOINT_URL || '',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      }
    }
  }),
  ],
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:4000',
    process.env.PAYLOAD_URL || 'http://localhost:3000',
    'http://localhost:4000', // Local development,
    'http://localhost:4001', // Preview mode
  ].filter(Boolean),
})
