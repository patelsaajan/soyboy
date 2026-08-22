/**
 * What the Cloudflare Cron Trigger actually does.
 *
 * Lives here rather than in `worker.ts` so it is type-checked: the Worker entry
 * has to import `.open-next/worker.js`, which is build output and absent on a
 * fresh checkout, so that file is excluded from `tsc` (see
 * `apps/payload/tsconfig.json`). Keeping the entry down to wiring means the only
 * unchecked code is three lines that cannot be wrong in an interesting way.
 */

/** The route the trigger drives. Must match the folder under `src/app/(cron)/`. */
export const ROTATE_CRON_PATH = '/cron/rotate-recipe-of-the-day'

/**
 * The subset of the Worker's bindings this needs.
 *
 * Read off the `env` argument, not `process.env`: OpenNext populates
 * `process.env` from the bindings *inside* its request wrapper, and a scheduled
 * invocation has not entered one yet.
 */
export type CronEnv = {
  CRON_SECRET?: string
  PAYLOAD_URL?: string
}

/** `handler.fetch` with `env`/`ctx` already bound. */
export type BoundFetch = (request: Request) => Promise<Response>

/**
 * Drive the rotation route through the Worker's own fetch handler.
 *
 * Going back in through `fetch` rather than calling `getPayload()` here is the
 * whole point: `payload.config.ts` resolves its connection string from the
 * Hyperdrive binding via `getCloudflareContext()`, and that context is
 * established by OpenNext's request wrapper. A scheduled handler that reached
 * for Payload directly would find no context, fall through to `DATABASE_URL`
 * (unset on the Worker) and throw — and only at midnight, where nobody is
 * looking. This way the cron exercises the same path as every other request.
 *
 * Throws on any non-2xx so the run is recorded as failed in the Cron Triggers
 * dashboard. A cron that reports success while doing nothing is the failure this
 * feature already had once.
 */
export async function runScheduledRotation(fetch: BoundFetch, env: CronEnv): Promise<void> {
  if (!env.CRON_SECRET) {
    throw new Error(
      'CRON_SECRET is not set on this Worker — the rotation route will reject the ' +
        'trigger. Set it with `wrangler secret put CRON_SECRET`.',
    )
  }

  // The origin is not used for routing (the request never leaves the isolate),
  // but Next reads it off the URL, so give it the real one where we have it.
  const origin = (env.PAYLOAD_URL ?? 'https://cms.soyboy.saajanpatel.co.uk')
    .split(',')[0]!
    .trim()
    .replace(/\/$/, '')

  const response = await fetch(
    new Request(`${origin}${ROTATE_CRON_PATH}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    }),
  )

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`Recipe of the day rotation failed: ${response.status} ${body}`)
  }

  console.log(`Recipe of the day rotation: ${body}`)
}
