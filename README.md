# Talja&mom — E-shop

Albanian women's fashion e-shop built with Next.js, Tailwind CSS v4, and PostgreSQL.

See [taljamom-eshop-implementation-plan.md](./taljamom-eshop-implementation-plan.md) for the full build plan.

## Prerequisites

- Node.js 20+
- PostgreSQL (local install **or** Docker Desktop)

## Quick start

```bash
npm install
copy .env.example .env
# Edit .env — set AUTH_SECRET (openssl rand -base64 32) and DATABASE_URL
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env`. All server env vars are validated at startup via `src/lib/env.ts` — missing or invalid values fail fast with a clear message.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL (canonical links, sitemap) |
| `UPLOADS_DIR` | No | Image upload directory (default `./uploads`) |
| `ADMIN_EMAIL` | Seed only | Admin login email for `db:seed` |
| `ADMIN_PASSWORD` | Seed only | Admin password for `db:seed` |
| `SMTP_HOST` | Optional | Email notifications — all three SMTP vars required together |
| `SMTP_PORT` | Optional | SMTP port (587 or 465) |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password |
| `SHOP_NOTIFICATION_EMAIL` | Optional | Inbox for new-order alerts |
| `ENABLE_TEST_PAYMENT_PROVIDER` | No | Set `true` in dev to test card redirect/webhook stub |

Future card payments: see [docs/adding-a-card-provider.md](./docs/adding-a-card-provider.md).

## Database setup (Windows)

You already have **PostgreSQL 18** running on `localhost:5432`. Docker is optional.

### Option A — Local PostgreSQL (recommended)

```powershell
npm run db:setup
```

Or pass the postgres superuser password directly:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-local-db.ps1 -PostgresPassword "YOUR_POSTGRES_PASSWORD"
```

This creates the `taljamom` user/database, runs migrations, and seeds sample data.

### Option B — Docker Desktop

```bash
docker compose up -d
npm run db:migrate
npm run db:seed
```

Verify with:

```bash
npm run db:studio
```

## Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests (env validation, payment stub) |
| `npm run db:setup` | Create local DB + migrate + seed (Windows) |
| `npm run db:migrate` | Run migrations (interactive) |
| `npm run db:seed` | Seed admin, settings, sample products |
| `npm run db:studio` | Open Prisma Studio |

## Default admin (after seed)

- Email: value of `ADMIN_EMAIL` in `.env` (default `admin@taljamom.al`)
- Password: value of `ADMIN_PASSWORD` in `.env` (default `admin123`)

Change these before any production deploy.

## Deployment

Full step-by-step guide: **[docs/deployment-coolify.md](./docs/deployment-coolify.md)**

Summary:

1. Hetzner VPS (2 vCPU / 4 GB) + [Coolify](https://coolify.io)
2. PostgreSQL resource in Coolify + daily backups
3. Deploy from GitHub using the repo **Dockerfile** (or Nixpacks)
4. Mount persistent volume at `/app/uploads` (`UPLOADS_DIR=/app/uploads`)
5. Set production env vars (`AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, …)
6. Enable Let's Encrypt SSL; optional Cloudflare in front
7. Run `npx prisma db seed` once; change admin password

Local Docker smoke test:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Health check: `GET /api/health` → `{ "ok": true, "db": "connected" }`

Card payments: implement a provider per [docs/adding-a-card-provider.md](./docs/adding-a-card-provider.md).

## Project structure (high level)

```
src/
  app/              # Routes (catalog, checkout, admin, static pages)
  components/       # UI, layout, catalog, cart, admin
  lib/
    env.ts          # Validated environment
    payments/       # Payment provider abstraction
    orders/         # Checkout server actions
    admin/          # Admin server actions
    i18n/sq.ts      # All Albanian UI strings
prisma/             # Schema, migrations, seed
uploads/            # Product images (local dev)
```
