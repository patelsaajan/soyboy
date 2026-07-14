import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  transpilePackages: [''],
  // Required by OpenNext. We drive `next build --webpack` ourselves (see the
  // cf:* scripts) with --skipNextBuild, which bypasses OpenNext's automatic
  // standalone injection — so we set it here. outputFileTracingRoot points at
  // the monorepo root so file tracing resolves workspace deps correctly.
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../..'),
  // sharp is a native binary and can't be bundled into the Worker. Keep it
  // external so the OpenNext build succeeds. NOTE: it still won't *execute* on
  // Workers — image resizing will fail at runtime until it's replaced
  // (e.g. Cloudflare Images). Fine for local/Railway, which run real Node.
  serverExternalPackages: ['sharp'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

// Makes getCloudflareContext() (Hyperdrive/R2 bindings) available during
// `next dev`. No-op in production builds.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
