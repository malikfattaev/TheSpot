# Infrastructure

Deployment for The Spot on [Railway](https://railway.app).

## Services

The monorepo ships two Next.js apps from a **single** Dockerfile
(`infra/docker/Dockerfile`), selected with the `APP` build argument:

| Service    | `APP` | Description            |
| ---------- | ----- | ---------------------- |
| `thespot-web` | `web` | Public site (thespot.uz) |
| `thespot-erp` | `erp` | Internal ERP panel       |

A managed **PostgreSQL** plugin provides `DATABASE_URL`.

## Railway setup (per service)

1. Create the service from this GitHub repo.
2. Set the config-as-code path to the matching file:
   - web → `infra/railway/web.json`
   - erp → `infra/railway/erp.json`
3. Add service variables (Railway forwards them as Docker build args):
   - `APP` = `web` or `erp`
   - `NEXT_PUBLIC_SITE_URL` = public origin of the service
   - `DATABASE_URL` = referenced from the Postgres plugin
4. Deploy. The image runs `node <app>/server.js` and listens on `$PORT`.

## Database migrations

Migrations are committed under `packages/db/prisma/migrations` and applied
with `npm run db:deploy --workspace @thespot/db` against the production
`DATABASE_URL` (run as a Railway one-off command or a release step).
