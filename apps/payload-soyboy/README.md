# payload-vanilla

## Getting started

1. Copy the example env file:
   ```sh
   cp .env.example .env
   ```

2. Start the project:
   ```sh
   docker compose up --build
   ```

The app will be available at [http://localhost:3000](http://localhost:3000). Follow the on-screen instructions to create your first admin user.

## Resetting the database

If you need a clean slate (e.g. after changing database credentials):

```sh
docker compose down -v
docker volume rm payload-vanilla_pgdata
docker compose up --build
```

## Questions

If you have any issues or questions, reach out on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
