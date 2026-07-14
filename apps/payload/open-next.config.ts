import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Minimal OpenNext config. Incremental cache / tag cache can be added later
// (e.g. R2/KV-backed) once the base deploy is verified.
export default defineCloudflareConfig()
