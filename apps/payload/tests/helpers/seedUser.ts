import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  // This creates a full-admin account with a well-known default password
  // (dev@payloadcms.com / test) against whatever DATABASE_URL is set. Running
  // the e2e suite against staging or production would plant that account there,
  // and the cleanup below only runs if the suite completes.
  const databaseUrl = process.env.DATABASE_URL ?? ''
  const isLocalDatabase = /localhost|127\.0\.0\.1|host\.docker\.internal/.test(databaseUrl)
  if (process.env.NODE_ENV === 'production' || !isLocalDatabase) {
    throw new Error(
      'seedTestUser refuses to run: DATABASE_URL does not point at a local database.',
    )
  }

  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
