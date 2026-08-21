/**
 * What "publishing" means for a collection the public site reads.
 *
 * Spread this into **every** publicly-read collection and global. One that the
 * site reads but nobody purges is a stale-content bug waiting to happen, and it
 * will not announce itself — the page simply keeps showing yesterday's copy.
 * Exposing the hooks as a single named object is what stops that being a
 * per-collection decision someone forgets to make.
 *
 * Sibling repos on this stack (bryans-motorcycle-school, payload-cloudflare-
 * starter) pair the purge with a rebuild-on-publish trigger, because their
 * frontends prerender HTML, `<head>` tags and a sitemap at build time — none of
 * which a cache purge can refresh. Soyboy renders every one of those per
 * request, so there is nothing frozen into the build for a rebuild to update
 * and no deploy hook here. If the frontend ever gains a prerendered route, that
 * stops being true, and the rebuild hook has to arrive in the same commit.
 */
import { purgeAfterChange, purgeAfterDelete, purgeGlobalAfterChange } from './purgeFrontendCache'

export const publishHooks = {
  afterChange: [purgeAfterChange],
  afterDelete: [purgeAfterDelete],
}

/** Globals have no afterDelete. */
export const publishGlobalHooks = {
  afterChange: [purgeGlobalAfterChange],
}
