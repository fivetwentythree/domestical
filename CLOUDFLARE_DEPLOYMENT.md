# Cloudflare Deployment

This repo is set up to deploy for free with:

- Cloudflare Pages for `apps/web`
- Cloudflare Workers for `apps/api`
- Cloudflare D1 for the SQLite-backed data model
- Cloudflare Cron Triggers for the 15-minute sync loop

GitHub Pages is not a fit for the full app because the calendar depends on a live API, scheduled sync jobs, and a database.

## 1. Create the D1 database

Create a D1 database in Cloudflare named `atlas-calendar`, then copy the generated database ID into [apps/api/wrangler.toml](/Users/lochana-mbp/Documents/DEV/master-cal/apps/api/wrangler.toml).

## 2. Apply the schema

From the repo root:

```bash
cd apps/api
npx wrangler d1 migrations apply atlas-calendar --remote
```

The migration source is [apps/api/migrations/0001_init.sql](/Users/lochana-mbp/Documents/DEV/master-cal/apps/api/migrations/0001_init.sql).

## 3. Export the existing SQLite data

Generate a seed file from the local database:

```bash
node apps/api/scripts/export-sqlite-to-d1.mjs > /tmp/atlas-d1-seed.sql
```

This reads `data/atlas.db` by default. You can also pass a custom SQLite path:

```bash
node apps/api/scripts/export-sqlite-to-d1.mjs /absolute/path/to/atlas.db > /tmp/atlas-d1-seed.sql
```

Do not use `npm run export:sqlite ... > file` here unless you also pass npm's silent flag, because npm prepends banner lines like `> @atlas/api...` to stdout and that will corrupt the SQL file.

The generated seed file should not contain `BEGIN TRANSACTION` or `COMMIT` statements. Cloudflare D1 remote execution rejects those wrappers during import.

Import it into D1:

```bash
cd apps/api
npx wrangler d1 execute atlas-calendar --remote --file /tmp/atlas-d1-seed.sql
```

## 4. Verify row counts

The export script prints source counts in SQL comments at the top of the generated file. After import, compare them with:

```bash
cd apps/api
npx wrangler d1 execute atlas-calendar --remote --command "SELECT 'properties' AS table_name, COUNT(*) AS count FROM properties UNION ALL SELECT 'calendar_events', COUNT(*) FROM calendar_events UNION ALL SELECT 'sync_runs', COUNT(*) FROM sync_runs"
```

## 5. Configure Worker environment

For local Worker development, copy [apps/api/.dev.vars.example](/Users/lochana-mbp/Documents/DEV/master-cal/apps/api/.dev.vars.example) to `.dev.vars` and set the frontend origin you want to allow.

For the deployed Worker, set `ALLOWED_ORIGIN` in the Cloudflare dashboard to your Pages domain, for example:

```text
https://atlas-calendar.pages.dev
```

## 6. Deploy the API

Manual deploy:

```bash
cd apps/api
npx wrangler deploy
```

GitHub Actions deploy:

- Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets.
- Push to `main` or `master` to run [deploy-api.yml](/Users/lochana-mbp/Documents/DEV/master-cal/.github/workflows/deploy-api.yml).

## 7. Deploy the frontend on Cloudflare Pages

Create a Pages project connected to this repo with:

- Root directory: `.`
- Build command: `npm ci && npm run build -w apps/web`
- Build output directory: `apps/web/dist`

Set `VITE_API_BASE_URL` in the Pages project to your Worker URL, for example:

```text
https://atlas-calendar-api.workers.dev/api
```

An example env file lives at [apps/web/.env.example](/Users/lochana-mbp/Documents/DEV/master-cal/apps/web/.env.example).

## 8. Local development

Run the Worker locally on port `3001`:

```bash
npm run dev -w apps/api
```

Run the frontend separately:

```bash
npm run dev -w apps/web
```

Vite already proxies `/api` to `http://localhost:3001`, so local frontend development does not need `VITE_API_BASE_URL`.

## 9. What changed in code

- The frontend now reads `VITE_API_BASE_URL` in [apps/web/src/lib/api.ts](/Users/lochana-mbp/Documents/DEV/master-cal/apps/web/src/lib/api.ts).
- The API now runs as a Worker entrypoint in [apps/api/src/index.ts](/Users/lochana-mbp/Documents/DEV/master-cal/apps/api/src/index.ts).
- D1 replaces direct SQLite access through [apps/api/src/db/client.ts](/Users/lochana-mbp/Documents/DEV/master-cal/apps/api/src/db/client.ts).
- Scheduled sync now runs through Worker cron triggers using `scheduled()` in [apps/api/src/index.ts](/Users/lochana-mbp/Documents/DEV/master-cal/apps/api/src/index.ts).
