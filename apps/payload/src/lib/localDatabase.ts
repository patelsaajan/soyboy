/**
 * Is this connection string pointing at the developer's own machine?
 *
 * Two guards depend on the answer and must not disagree:
 *
 *   - `payload.config.ts` enables drizzle's dev schema push only for local
 *     hosts, so no dev-mode process can alter a remote schema.
 *   - `src/seed/index.ts` refuses to seed a remote target without an explicit
 *     opt-in, so an `.env` left pointing at Neon cannot be seeded by accident.
 *
 * One definition, because two lists of hostnames drift and the drift is silent.
 */

// `new URL('postgres://u@[::1]:5432/db').hostname` is '[::1]' — brackets
// included. Listing bare '::1' would silently never match.
const LOCAL_DB_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', 'postgres'])

/** The host a connection string names, or '' if it cannot be parsed. */
export function databaseHost(connectionString: string): string {
  try {
    return new URL(connectionString).hostname
  } catch {
    return ''
  }
}

/**
 * Unparseable connection strings are treated as remote. Failing closed is the
 * cheap mistake: the cost is a refused local seed, not a pushed prod schema.
 *
 * `postgres` is in the list because that is the service name inside the
 * docker-compose network — the CMS container reaches its own database under
 * that hostname, and it is no less local for it.
 */
export function isLocalDatabase(connectionString: string): boolean {
  return LOCAL_DB_HOSTS.has(databaseHost(connectionString))
}
