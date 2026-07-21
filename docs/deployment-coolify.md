# Production deployment — Hetzner VPS + Coolify

Primary target for Talja&mom v1. Follow these steps in order.

## 1. Server (Hetzner Cloud)

1. Create a **CX22** (or similar: 2 vCPU / 4 GB RAM) VPS in **Falkenstein** or **Nuremberg**.
2. OS: **Ubuntu 24.04 LTS**.
3. Add your SSH key; disable password login after first access.
4. Point DNS:
   - `shop.example.al` → server IP (shop domain)
   - `panel.example.al` → server IP (Coolify UI, optional subdomain)

## 2. Install Coolify

On the VPS (as root):

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Open `https://panel.example.al` (or `http://YOUR_IP:8000` initially), create admin account, finish setup.

## 3. PostgreSQL in Coolify

1. **Resources → New → Database → PostgreSQL** (v16).
2. Note the internal connection string, e.g.:
   ```
   postgresql://user:pass@postgres-container:5432/taljamom
   ```
3. Enable **scheduled backups** (daily dump). Store copies off-server (Hetzner Storage Box, S3, etc.).

## 4. Deploy the Next.js app

### Option A — Dockerfile (recommended)

1. Push this repo to GitHub/GitLab.
2. **New Resource → Application** → connect repo.
3. Build pack: **Dockerfile** (uses `/Dockerfile` in repo root).
4. Port: **3000**.
5. Health check path: `/api/health`.

### Option B — Nixpacks

1. Same repo connection.
2. Build pack: **Nixpacks** (uses `nixpacks.toml`).
3. Start command: `npm run start:prod` (runs migrations + `next start`).

## 5. Environment variables

Set in Coolify → Application → Environment:

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://…` | From Coolify Postgres resource |
| `AUTH_SECRET` | `openssl rand -base64 32` | **Required**, unique per environment |
| `NEXT_PUBLIC_SITE_URL` | `https://shop.example.al` | Must match public HTTPS URL |
| `UPLOADS_DIR` | `/app/uploads` | Must match mounted volume |
| `ADMIN_EMAIL` | `admin@taljamom.al` | Used only for initial seed |
| `ADMIN_PASSWORD` | strong password | Used only for initial seed; change after login |

Optional email notifications (all three required together):

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SHOP_NOTIFICATION_EMAIL=
```

Do **not** set `ENABLE_TEST_PAYMENT_PROVIDER` in production.

## 6. Persistent uploads volume

Product images must survive redeploys.

1. Coolify → Application → **Storages / Volumes**.
2. Mount host/volume path → container path: **`/app/uploads`**
3. Ensure `UPLOADS_DIR=/app/uploads` in env.

## 7. SSL (Let's Encrypt)

1. Coolify → Application → **Domains** → add `shop.example.al`.
2. Enable **Automatic HTTPS** (Let's Encrypt).
3. Redeploy; verify `https://shop.example.al` loads.

## 8. First deploy checklist

Run once after the first successful deploy:

```bash
# In Coolify → Application → Terminal (or one-off command)
npx prisma db seed
```

Then:

1. Log in at `https://shop.example.al/admin/login`.
2. Change admin password (Cilësimet / or update DB).
3. Replace PLACEHOLDER settings (contacts, bank details, shipping).
4. Upload real product photos via admin.

Migrations run automatically on container start (`docker-entrypoint.sh` or `start:prod`).

## 9. Cloudflare (optional, recommended)

1. Add site to Cloudflare (free plan).
2. Proxy DNS (orange cloud) for `shop.example.al`.
3. SSL mode: **Full (strict)**.
4. Cache rules:
   - Cache `/_next/static/*` — Edge TTL 1 month
   - Cache `/api/uploads/*` — Edge TTL 1 week (images)
   - Bypass cache for `/admin/*`, `/api/*` (except uploads), `/porosia*`

This improves load times for users in Albania/EU.

## 10. Verify production

| Check | How |
|---|---|
| Health | `curl https://shop.example.al/api/health` → `{"ok":true,"db":"connected"}` |
| Catalog | Browse `/koleksioni`, open a product |
| Order COD | Add to cart → `/porosia` → confirm → check admin Porositë |
| Order bank | Same with bank transfer; bank details on thank-you page |
| Admin auth | `/admin` redirects to login when logged out |
| Uploads persist | Upload image in admin → redeploy app → image still visible |
| Backups | Restore Postgres dump to staging once (document date) |

## 11. Local production smoke test (before Hetzner)

Test the Docker image locally:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Open [http://localhost:3000](http://localhost:3000). Seed runs on first deploy via:

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

## 12. Post-launch QA

Use the checklist in [taljamom-eshop-implementation-plan.md §11](../taljamom-eshop-implementation-plan.md):

- Mobile 360px flows
- Season/category rules (Xhaketa / Pallto)
- Currency formatting everywhere
- Replace all PLACEHOLDER content
- No English on public site

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails on env | Ensure `DATABASE_URL` and `AUTH_SECRET` set in Coolify **build** env if needed; runtime env required at minimum |
| 503 on `/api/health` | Check `DATABASE_URL`, Postgres reachable from app container |
| Images disappear after deploy | Volume not mounted at `/app/uploads` |
| Admin login fails | Re-run seed or reset password via `db:seed` one-off |
| Wrong canonical URLs | Fix `NEXT_PUBLIC_SITE_URL` and redeploy |

## Alternative: Vercel + Neon + Blob

Higher cost, zero server ops. Requires swapping upload storage to object storage (S3/Blob). Not configured in v1 — see plan §10.
