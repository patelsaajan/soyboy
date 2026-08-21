import 'dotenv/config'
import type { Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'
import { databaseHost, isLocalDatabase } from '../lib/localDatabase'
import { seed } from './index'

/**
 * Refuse to seed a remote database unless the caller has explicitly opted in.
 *
 * This script reads whatever `.env` happens to contain. The moment a Neon
 * connection string lands there — pasted in to debug something and left behind
 * is the usual way — a bare `pnpm seed` would run against production silently.
 * Guarding on the *target* rather than on which npm script was typed is what
 * actually closes that.
 *
 * `pnpm seed:prod` passes --allow-remote, having already printed the target and
 * taken a confirmation (scripts/seed-prod.sh).
 */
const databaseUrl = process.env.DATABASE_URL
if (databaseUrl && !isLocalDatabase(databaseUrl) && !process.argv.includes('--allow-remote')) {
  console.error(
    `\nRefusing to seed: DATABASE_URL points at ${databaseHost(databaseUrl) || 'an unparseable host'}, ` +
      `which is not local.\n` +
      `Use \`pnpm seed:prod\` — it prints the target and confirms before writing.\n` +
      `(If you really mean to seed a remote database directly, pass --allow-remote.)`,
  )
  process.exit(1)
}

/**
 * payload.config.ts only allows the dev schema push against local databases, so
 * seeding no longer leaves a dev-push row (batch = -1) behind — but a run from
 * before that guard existed may have. Flag it rather than deleting it: on a
 * database someone genuinely did dev-push, that row is a real warning about
 * schema drift, and clearing it is a decision for a human with the context.
 */
const warnOnDevPushRow = async (payload: Payload): Promise<void> => {
  const { docs } = await payload.find({
    collection: 'payload-migrations',
    where: { batch: { equals: -1 } },
    limit: 1,
  })
  if (docs.length === 0) return

  payload.logger.warn(
    'payload_migrations contains a dev-push row (batch = -1), left by an earlier seed. ' +
      'Until it is gone, `payload migrate` treats this database as dev-pushed and prompts ' +
      'instead of migrating, which stalls deploys. If the schema really is up to date, ' +
      'clear it with: DELETE FROM payload_migrations WHERE batch = -1;',
  )
}

const main = async () => {
  const payload = await getPayload({ config })
  await seed(payload)
  await warnOnDevPushRow(payload)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
