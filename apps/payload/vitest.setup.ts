import 'dotenv/config'

import { databaseHost, isLocalDatabase } from './src/lib/localDatabase'

/**
 * Refuse to run the integration tests against a non-local database.
 *
 * These tests boot a real Payload instance against whatever `DATABASE_URL` this
 * app's `.env` happens to contain — and in this repo that has been the
 * production Neon string. Reads are harmless, but a test suite is the last place
 * that distinction should be left to luck: the next test someone adds may well
 * write.
 *
 * Same guard, same definition of "local", as the seed (`src/seed/run.ts`) and
 * the schema-push gate in `payload.config.ts`. One definition, in
 * `src/lib/localDatabase.ts`, because three lists of hostnames drift.
 */
const databaseUrl = process.env.DATABASE_URL
if (databaseUrl && !isLocalDatabase(databaseUrl)) {
  throw new Error(
    `Refusing to run integration tests: DATABASE_URL points at ` +
      `${databaseHost(databaseUrl) || 'an unparseable host'}, which is not local.\n` +
      `Start the local database with \`pnpm db:up\` and point DATABASE_URL at it.`,
  )
}
