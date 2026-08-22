/* eslint-disable @typescript-eslint/ban-ts-comment -- see below */
// @ts-nocheck — the import below is build output; see the note on tsconfig's
// `exclude`. This file is not in the `tsc` project, so the directive alters no
// compilation; it is here so editors, which fall back to an inferred project,
// do not redden the file on a fresh checkout.
/**
 * The Worker entry point — OpenNext's handler plus a `scheduled` handler.
 *
 * `wrangler.jsonc` points `main` here rather than straight at
 * `.open-next/worker.js` because a Cron Trigger needs a `scheduled` export, and
 * that has to sit on the *same* default export as `fetch`. OpenNext regenerates
 * its worker on every build, so it cannot be edited in place — it gets wrapped
 * instead.
 *
 * Two things this file must keep doing:
 *
 *  - **Re-export the Durable Object classes.** wrangler resolves DO bindings
 *    against the entry module's exports; drop them and a deploy that uses the
 *    queue or the sharded tag cache fails to start. `export *` picks up whatever
 *    the adapter emits, so an adapter bump that adds a class does not silently
 *    break the deploy.
 *  - **Spread `handler`, not just `fetch`.** Later adapter versions may add
 *    handlers of their own.
 *
 * The file is excluded from `tsc` (see `tsconfig.json`) because
 * `.open-next/worker.js` does not exist until `opennextjs-cloudflare build` has
 * run, and CI type-checks a fresh checkout. It is therefore kept to wiring:
 * everything with real logic lives in `src/lib/scheduledRotation.ts`, which is
 * checked.
 */
import handler from './.open-next/worker.js'

import { runScheduledRotation } from './src/lib/scheduledRotation'

const worker = {
  ...handler,
  async scheduled(_controller, env, ctx) {
    // Awaited rather than handed to `ctx.waitUntil`: the promise this returns is
    // what Cloudflare records as the run's outcome, so awaiting is what makes a
    // failed rotation show up red in the Cron Triggers dashboard.
    await runScheduledRotation((request) => handler.fetch(request, env, ctx), env)
  },
}

export default worker

export * from './.open-next/worker.js'
