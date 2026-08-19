# Soyboy

Saajan Patel's vegan recipe site. A Turborepo monorepo containing the public
site and the CMS that backs it, both deployed to Cloudflare Workers.

## Structure

```
apps/
├── frontend/    # Nuxt 4 public site (soyboy.saajanpatel.co.uk)
└── payload/     # Payload CMS 3 on Next.js (cms.soyboy.saajanpatel.co.uk)

packages/
├── ui/                  # Shared React components (currently unused)
├── eslint-config/       # Shared ESLint config
└── typescript-config/   # Shared tsconfig presets
```

The frontend talks to Payload over a Cloudflare **service binding** (`BACKEND`),
so the CMS origin never appears in the browser. Media is proxied through
`/api/media/file/**` on the frontend for the same reason.

## Prerequisites

- Node `>= 22.13.0`
- [pnpm](https://pnpm.io) 11
- [Docker](https://www.docker.com) (local Postgres for the CMS)

## Getting started

```bash
pnpm install
pnpm db:up          # start local Postgres
pnpm db:migrate:fresh
pnpm db:seed
pnpm dev            # frontend on :4000, CMS on :3000
```

Copy `.env.example` to `.env` in each app first.

## Common tasks

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run both apps |
| `pnpm build` | Build both apps |
| `pnpm lint` | ESLint across the workspace |
| `pnpm check-types` | Type-check across the workspace |
| `pnpm db:up` / `db:down` | Start/stop local Postgres |
| `pnpm db:seed` | Seed recipes |

## Deployment

Both apps deploy to Cloudflare Workers. See `RAILWAY-TO-CLOUDFLARE.md` for the
migration write-up and `CLOUDFLARE_BUILDS.md` for build configuration.

The CMS uses Neon Postgres via Hyperdrive and R2 for media storage.
