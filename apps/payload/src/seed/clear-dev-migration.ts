/**
 * One-time cleanup: remove Payload's "dev" migration marker.
 *
 * When Payload runs in dev mode it push-syncs the schema and records a
 * `{ name: 'dev', batch: -1 }` row in `payload_migrations`. `payload migrate`
 * then detects that row and prompts interactively ("you've run Payload in dev
 * mode…"), which hangs CI (no TTY). Our Neon DB picked this up from the seed run.
 *
 * The real schema is correct (all 3 migrations applied, app works), so this just
 * deletes the dev marker to leave a clean production migration state.
 *
 * Run once against Neon:
 *   pnpm --filter @soyboy/payload db:clear-dev-marker
 * (reads DATABASE_URL from apps/payload/.env — point it at Neon)
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const payload = await getPayload({ config })
await payload.db.drizzle.execute("delete from payload_migrations where batch = '-1' or name = 'dev'")
const rows = await payload.db.drizzle.execute('select id, name, batch from payload_migrations order by id')
console.log('Remaining migrations (dev marker should be gone):')
for (const r of (rows.rows ?? rows)) console.log(' ', JSON.stringify(r))
process.exit(0)
