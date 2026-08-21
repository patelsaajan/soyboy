# Soyboy

Saajan Patel's vegan recipe site. A Turborepo monorepo containing the public
site and the CMS that backs it, both deployed to Cloudflare Workers.

## Structure

```
apps/
├── frontend/    Nuxt 4 public site (soyboy.saajanpatel.co.uk)
└── payload/     Payload CMS 3 on Next.js (cms.soyboy.saajanpatel.co.uk)

packages/
├── shared/            The cache/purge contract, imported by both apps
├── eslint-config/     Shared ESLint config
├── typescript-config/ Shared tsconfig presets
└── ui/                Unused leftover from create-turbo
```

The frontend talks to Payload over a Cloudflare **service binding** (`BACKEND`),
so the CMS origin never appears in the browser — uploads included, which is what
`/api/media/file/**` is for. Everything public is therefore served from one
origin, which is what makes it purgeable.

Pages and JSON are cached in `caches.default` for a day and **purged by the CMS
on publish**, so edits appear in seconds. `docs/cloudflare-payload-stack.md`
explains the whole arrangement and the reasons behind each piece.

## Prerequisites

- Node `>= 22.13.0`
- [pnpm](https://pnpm.io) 11
- [Docker](https://www.docker.com) (local Postgres for the CMS)

## Getting started

```bash
cp apps/payload/.env.example apps/payload/.env
cp apps/frontend/.env.example apps/frontend/.env

pnpm install
pnpm db:up          # local Postgres on :5432
pnpm db:migrate
pnpm db:seed
pnpm dev            # frontend on :4000, CMS on :3000
```

`pnpm db:seed` and the CMS's integration tests both refuse to run against a
non-local `DATABASE_URL`. If either stops you, check what `apps/payload/.env` is
pointing at — it has been left pointing at production Neon before now.

## Common tasks

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run both apps |
| `pnpm build` | Build both apps |
| `pnpm check` | Type-check and lint the whole workspace |
| `pnpm test` | Unit tests (the CMS's integration tests need `db:up` and a local `DATABASE_URL`) |
| `pnpm db:up` / `db:down` | Start/stop local Postgres |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:migrate:create` | Generate a migration from a schema change |
| `pnpm db:seed` | Seed recipes (local only) |
| `pnpm db:seed:prod` | Seed production, with confirmation |

## Documentation

| | |
| --- | --- |
| [docs/cloudflare-payload-stack.md](docs/cloudflare-payload-stack.md) | How the stack works and why — start here |
| [docs/cloudflare-builds.md](docs/cloudflare-builds.md) | Workers Builds dashboard settings |
| [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md) | First-time Cloudflare setup (Hyperdrive, R2, secrets) |
| [docs/railway-to-cloudflare.md](docs/railway-to-cloudflare.md) | The original migration write-up, kept as history |

The CMS uses Neon Postgres via Hyperdrive and R2 for media storage.
