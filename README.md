# Sidequest Saajan — Payload Monorepo

A Turborepo monorepo for building and selling Payload CMS-powered client sites. Each client gets their own app. Shared functionality lives in plugin packages that any app can install.

## Structure

```
apps/
├── payload-vanilla/        # Base template — copy this when starting a new client app
└── payload-soyboy/         # Recipe website (soyboy.saajan.dev)

packages/
├── plugin-vanilla/         # Base plugin template — copy this when creating a new plugin
├── plugin-recipes/         # Recipe CMS plugin (collections, fields, hooks)
├── ui/                     # Shared React components
├── eslint-config/          # Shared ESLint config
└── typescript-config/      # Shared tsconfig presets
```

### How it works

- **Apps** are full Payload + Next.js sites. They own their own database, `.env`, and any site-specific config.
- **Plugins** are TypeScript packages that export a Payload plugin function. They add collections, fields, hooks, and endpoints to whichever app installs them.
- Apps consume plugins by adding them to `dependencies` and registering them in `payload.config.ts`.

## Prerequisites

- [Bun](https://bun.sh) `>= 1.2`
- [Docker](https://www.docker.com) (for local Postgres)
- Node `>= 18`

## Getting started

**1. Install dependencies from the monorepo root:**

```bash
bun install
```

**2. Start the database for the app you want to run:**

```bash
cd apps/payload-soyboy
docker compose up postgres -d
```

**3. Set up your `.env`:**

```bash
cp .env.example .env  # if one exists, otherwise create it
```

Minimum required variables:

```env
DATABASE_URL=postgresql://postgres:payload@localhost:5432/<db-name>
PAYLOAD_SECRET=your-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**4. Run the app:**

```bash
bun dev
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
   { "dependencies": { "@sidequest-saajan/plugin-<name>": "*" } }
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

7. Run `bun install` from the monorepo root.

## Common commands

| Command | What it does |
|---|---|
| `bun install` | Install/link all workspace dependencies |
| `bun dev` | Run the app in the current directory |
| `bun run build` | Build the app |
| `bun run generate:types` | Regenerate `payload-types.ts` after schema changes |
| `docker compose up postgres -d` | Start the local Postgres container in the background |
| `docker compose down` | Stop Postgres |
| `docker compose down -v` | Stop Postgres and wipe all data |
| `turbo build` | Build all apps and packages |
| `turbo dev --filter=@sidequest-saajan/<app>` | Run a specific app |
