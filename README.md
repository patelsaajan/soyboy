# Sidequest Saajan — Payload Monorepo

A Turborepo monorepo for building and selling Payload CMS-powered client sites. Each client gets their own app. Shared functionality lives in plugin packages that any app can install.

## Structure

```
apps/
├── payload-vanilla/        # Base template — copy this when starting a new client app
└── <client-name>/          # Client apps

packages/
├── plugin-vanilla/         # Base plugin template — copy this when creating a new plugin
├── plugin-<name>/          # Feature plugins (collections, fields, hooks)
├── ui/                     # Shared React components
├── eslint-config/          # Shared ESLint config
└── typescript-config/      # Shared tsconfig presets
```

### How it works

- **Apps** are full Payload + Next.js sites. They own their own database, `.env`, and any site-specific config.
- **Plugins** are TypeScript packages that export a Payload plugin function. They add collections, fields, hooks, and endpoints to whichever app installs them.
- Apps consume plugins by adding them to `dependencies` and registering them in `payload.config.ts`.

## Prerequisites

- [pnpm](https://pnpm.io) `>= 9`
- [Docker](https://www.docker.com) (for local Postgres)
- Node `>= 20.9.0`

## Getting started

**1. Install dependencies from the monorepo root:**

```bash
pnpm install
```

**2. Start the database for the app you want to run:**

```bash
cd apps/<app-name>
docker compose up postgres -d
```

**3. Set up your `.env`:**

```bash
cp .env.example .env
```

Minimum required variables:

```env
DATABASE_URL=postgresql://postgres:payload@localhost:5432/<db-name>
PAYLOAD_SECRET=your-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**4. Run the app:**

```bash
pnpm dev
```

Admin panel is at `http://localhost:3000/admin`.

## Creating a new client app

1. Copy the vanilla app:
   ```bash
   cp -r apps/payload-vanilla apps/<client-name>
   ```

2. Update `apps/<client-name>/package.json`:
   ```json
   { "name": "@sidequest-saajan/<client-name>" }
   ```

3. Update `docker-compose.yml` — change `POSTGRES_DB` to match the new app name.

4. Create `.env` with a fresh `DATABASE_URL` and `PAYLOAD_SECRET`.

5. Install plugins the client needs by adding them to `dependencies` and registering in `payload.config.ts`.

6. Update `next.config.ts` — add any local plugins to `transpilePackages`.

7. Run `pnpm install` from the monorepo root.

## Creating a new plugin

1. Copy the vanilla plugin:
   ```bash
   cp -r packages/plugin-vanilla packages/plugin-<name>
   ```

2. Update `packages/plugin-<name>/package.json`:
   ```json
   { "name": "@sidequest-saajan/plugin-<name>" }
   ```

3. Build your collections and logic in `src/collections/` and wire them into `src/index.ts`.

4. Add the plugin to an app's `package.json`:
   ```json
   { "dependencies": { "@sidequest-saajan/plugin-<name>": "workspace:*" } }
   ```

5. Register it in the app's `payload.config.ts`:
   ```ts
   import { myPlugin } from '@sidequest-saajan/plugin-<name>'

   export default buildConfig({
     plugins: [myPlugin({})],
   })
   ```

6. Add it to `transpilePackages` in `next.config.ts`:
   ```ts
   transpilePackages: ['@sidequest-saajan/plugin-<name>']
   ```

7. Run `pnpm install` from the monorepo root.

## Deploying to Railway

Each client app deploys as its own Railway service pointing at the monorepo root.

### Prerequisites

- A Railway project with a Postgres database service added
- The monorepo pushed to GitHub and connected to Railway

### Service settings

**Root Directory:** `/`

**Custom Build Command:**
```
pnpm --filter @sidequest-saajan/<app-name> build
```

**Pre-deploy Step** (click "+ Add pre-deploy step"):
```
pnpm --filter @sidequest-saajan/<app-name> payload migrate
```

**Custom Start Command:**
```
pnpm --filter @sidequest-saajan/<app-name> start
```

**Watch Paths** (so Railway only redeploys when relevant files change):
```
apps/<app-name>/**
packages/plugin-<name>/**
```

### Environment variables

Set these in the Railway service → Variables tab:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `PAYLOAD_SECRET` | Any long random string |
| `NEXT_PUBLIC_SERVER_URL` | Your Railway public URL (e.g. `https://your-app.up.railway.app`) |

### Notes

- `pnpm-lock.yaml` and `pnpm-workspace.yaml` must be committed — Railway uses them to install dependencies
- The pre-deploy step runs `payload migrate` once after the build, before the new instance starts serving traffic
- Migrations are intentionally separate from startup to prevent race conditions on scaled deployments

## Common commands

| Command | What it does |
|---|---|
| `pnpm install` | Install/link all workspace dependencies |
| `pnpm dev` | Run the app in the current directory |
| `pnpm run build` | Build the app |
| `pnpm run generate:types` | Regenerate `payload-types.ts` after schema changes |
| `docker compose up postgres -d` | Start the local Postgres container in the background |
| `docker compose down` | Stop Postgres |
| `docker compose down -v` | Stop Postgres and wipe all data |
| `pnpm --filter @sidequest-saajan/<app-name> build` | Build a specific app |
| `pnpm --filter @sidequest-saajan/<app-name> dev` | Run a specific app |
