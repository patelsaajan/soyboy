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
  // sharp: native binary, can't run on Workers (kept external so build passes).
  // pg / pg-cloudflare: keep them out of webpack's bundle — webpack resolves
  // pg-cloudflare to its node/"default" export (an empty stub), which breaks the
  // Cloudflare socket at runtime ("b2 is not a constructor"). Left external,
  // OpenNext bundles them with the "workerd" condition and the real socket.
  serverExternalPackages: ['sharp', 'pg', 'pg-cloudflare'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // The admin panel shipped with no security headers at all — it was framable
  // by any origin, which makes the Delete button clickjackable for a logged-in
  // admin.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Payload's admin bundle requires both of these.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
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
