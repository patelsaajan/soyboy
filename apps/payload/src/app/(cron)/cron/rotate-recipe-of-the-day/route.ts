/**
 * The HTTP entry point the Cloudflare Cron Trigger uses to rotate the recipe of
 * the day.
 *
 * Why a route rather than doing the work straight inside the Worker's
 * `scheduled` handler: `payload.config.ts` resolves its database connection from
 * the Hyperdrive binding via `getCloudflareContext()`, and that context is
 * established by OpenNext's *request* wrapper. Going back in through
 * `handler.fetch` means the rotation runs on exactly the code path that already
 * works for every other request, instead of a second, subtly different one that
 * would only be exercised once a day at midnight. See `apps/payload/worker.ts`.
 *
 * The Worker is reachable at cms.soyboy.saajanpatel.co.uk, so this route is
 * public and has to authenticate itself. `CRON_SECRET` is a Worker secret; the
 * scheduled handler reads it from the binding and presents it as a bearer token.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { rotateRecipeOfTheDay } from '@/lib/rotateRecipeOfTheDay'

// This route writes to the database on every call; nothing about it may be
// prerendered or cached.
export const dynamic = 'force-dynamic'

/**
 * Constant-time string comparison.
 *
 * Written out rather than reaching for `crypto.timingSafeEqual`, which throws on
 * a length mismatch — the exact case an attacker probing the secret's length
 * would produce. Comparing the lengths first and the bytes always keeps the work
 * independent of how much of the prefix matched.
 */
function secretsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET

  // Deliberately loud. A deploy that forgot the secret must not leave an
  // unauthenticated endpoint that rewrites site content — better a cron that
  // fails visibly in the Worker logs.
  if (!secret) {
    return Response.json(
      { error: 'CRON_SECRET is not configured on this Worker' },
      { status: 503 },
    )
  }

  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!secretsMatch(provided, secret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  try {
    const result = await rotateRecipeOfTheDay(payload)

    if (!result.rotated) {
      payload.logger.warn(`Recipe of the day not rotated: ${result.reason}`)
      // 200, not an error: an empty CMS is a legitimate state, and a red cron
      // in the dashboard should mean something is actually broken.
      return Response.json(result, { status: 200 })
    }

    payload.logger.info(
      `Recipe of the day rotated to: ${result.slug} (from ${result.candidates} candidates)`,
    )
    return Response.json(result, { status: 200 })
  } catch (err) {
    payload.logger.error(`Recipe of the day rotation failed: ${String(err)}`)
    return Response.json({ error: 'Rotation failed' }, { status: 500 })
  }
}
