import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { z } from 'zod'
import path from 'path'

import { isLocalDatabase } from './lib/localDatabase'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Recipes } from './collections/Recipes'
import { RecipeOfTheDay } from './globals/RecipeOfTheDay'
import { rotateRecipeOfTheDayTask } from './tasks/rotateRecipeOfTheDay'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ---------------------------------------------------------------------------
// Environment
//
// Validated at module scope so a missing or half-configured variable fails the
// build rather than surfacing as a broken admin panel in production. This is
// why PAYLOAD_SECRET has to be present at *build* time as well as at runtime —
// see docs/cloudflare-payload-stack.md → Workers Builds.
// ---------------------------------------------------------------------------

const env = z
  .object({
    // Optional here, deliberately: inside a Worker the connection comes from
    // the HYPERDRIVE binding and DATABASE_URL is genuinely absent. Requiring it
    // at module scope would stop the Worker booting over a variable it never
    // uses. What must hold is that *something* resolves — asserted below, once
    // Hyperdrive has had its say.
    DATABASE_URL: z.string().optional(),
    PAYLOAD_SECRET: z.string().min(1),
    // Media storage (R2 over the S3 API). Optional as a group: all five, or
    // none at all — a partial set silently falls back to local disk, which on
    // Workers means uploads that appear to succeed and then cannot be read.
    S3_BUCKET_NAME: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ENDPOINT_URL: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    // Where the public site is served from. Also the origin list the purge hook
    // builds its URLs against.
    FRONTEND_URL: z.string().optional(),
    // This CMS's own public URL (the admin panel origin).
    PAYLOAD_URL: z.string().optional(),
  })
  .refine(
    (e) => {
      const s3Vars = [
        e.S3_BUCKET_NAME,
        e.S3_REGION,
        e.S3_ENDPOINT_URL,
        e.S3_ACCESS_KEY_ID,
        e.S3_SECRET_ACCESS_KEY,
      ]
      const set = s3Vars.filter(Boolean).length
      return set === 0 || set === s3Vars.length
    },
    { message: 'S3_* env vars must be set together (all five) or not at all.' },
  )
  .parse(process.env)

// ---------------------------------------------------------------------------
// Runtime detection
//
// Detected from the runtime itself rather than an env var, because this must be
// false in every Node process — including `next build`.
//
// The guard is load-bearing. In Node, `getCloudflareContext()` boots a
// Miniflare/workerd instance (via wrangler's platform proxy) just to synthesise
// the bindings, and `next build` collects page data in several parallel worker
// processes that each import this file — so each spins up its own workerd
// against the same .wrangler/state SQLite and they fight over it:
//   Fatal uncaught kj::Exception: ... database is locked: SQLITE_BUSY.
// In the real Worker the context is already on globalThis (OpenNext's entry
// sets it before importing the Next handler), so the call resolves from there
// and never reaches for wrangler.
// ---------------------------------------------------------------------------

const inWorkerd = globalThis.navigator?.userAgent === 'Cloudflare-Workers'

// Inside a Worker the DB is reached through the Hyperdrive binding, which pools
// connections upstream. Everywhere else — local dev, the `payload` CLI,
// `next build` — there is no Worker context, so fall back to DATABASE_URL.
let connectionString = env.DATABASE_URL ?? ''
let usingHyperdrive = false
if (inWorkerd) {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env: cfEnv } = getCloudflareContext()
    const hyperdrive = (cfEnv as { HYPERDRIVE?: { connectionString?: string } }).HYPERDRIVE
    if (hyperdrive?.connectionString) {
      connectionString = hyperdrive.connectionString
      usingHyperdrive = true
    }
  } catch {
    // Context not available on this code path — keep the DATABASE_URL fallback.
  }
}

if (!connectionString) {
  throw new Error(
    'No database connection resolved. Set DATABASE_URL (local dev, the payload CLI, ' +
      'next build), or bind HYPERDRIVE on the Worker.',
  )
}

// ---------------------------------------------------------------------------
// Origins
// ---------------------------------------------------------------------------

// Allowed CORS/CSRF origins come from env — never hard-coded, never wildcarded.
// localhost is development-only: shipping it in production means anything served
// from localhost:4000 gets a passing CORS preflight against the live CMS.
const isProduction = process.env.NODE_ENV === 'production'

const allowedOrigins = [
  env.FRONTEND_URL,
  env.PAYLOAD_URL,
  ...(isProduction ? [] : ['http://localhost:4000', 'http://localhost:3000']),
]
  .flatMap((value) => (value ?? '').split(','))
  .map((origin) => origin.trim())
  .filter(Boolean)

// serverURL must be set for Payload to populate its CSRF allowlist: with both
// `csrf` and `serverURL` empty, extractJWT's origin check short-circuits and
// accepts a cookie-borne token from ANY origin.
const serverURL = env.PAYLOAD_URL || 'http://localhost:3000'

// The admin panel's own origin must be CSRF-trusted: browsers send an Origin
// header on every mutating request (even same-origin), and Payload drops the
// auth cookie for any origin not in this list — without serverURL here, every
// edit in the admin UI fails with "You are not allowed to perform this action".
const csrfOrigins = [...new Set([...allowedOrigins, serverURL])]

const s3Enabled = Boolean(env.S3_BUCKET_NAME)

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
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Drizzle's dev schema push may only ever touch a local database. Any
    // dev-mode process that calls getPayload() — the seed, a one-off tsx
    // script, `next dev` with the wrong DATABASE_URL — would otherwise push
    // schema straight at whatever the connection string points to, and leave a
    // batch = -1 row in payload_migrations that stalls every later deploy.
    // Remote databases change schema through migrations only.
    push: isLocalDatabase(connectionString),
    pool: {
      connectionString,
      // workerd forbids reusing a TCP socket opened during one request in a
      // later one — an idle pooled connection handed to the next request dies
      // with "Cannot perform I/O on behalf of a different request" (error 1101)
      // or hangs without ever resolving. maxUses: 1 discards each connection
      // after a single use; Hyperdrive does the real pooling upstream, so
      // per-connection setup stays cheap. Local dev keeps normal pooling —
      // applying maxUses there just throws away working connections.
      ...(usingHyperdrive ? { maxUses: 1 } : {}),
    },
  }),
  // sharp is intentionally not wired up: it is a native binary that cannot run
  // on workerd, and Cloudflare is the only deploy target. The Media collection
  // has no imageSizes/resize pipeline, so the only loss is auto width/height
  // metadata and admin thumbnails. Delivery-side resizing happens at the edge
  // via Cloudflare Transformations (@nuxt/image on the frontend) instead.
  plugins: [
    // Always registered so `generate:importmap` emits the plugin's client
    // components in every environment — conditionally *excluding* it when the
    // bucket is unset (CI, local dev) makes the deployed admin panel warn that
    // S3ClientUploadHandler is missing. Register always, gate with `enabled`.
    s3Storage({
      enabled: s3Enabled,
      collections: {
        media: true,
      },
      bucket: env.S3_BUCKET_NAME ?? '',
      config: {
        // R2 requires the "auto" region and path-style addressing (bucket in
        // the path, not the hostname).
        region: env.S3_REGION ?? 'auto',
        endpoint: env.S3_ENDPOINT_URL ?? '',
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? '',
        },
      },
    }),
  ],
  serverURL,
  cors: allowedOrigins,
  csrf: csrfOrigins,
})
