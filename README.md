# The Spot

The Spot is a monorepo for a real estate rental platform in Uzbekistan.

## Structure

```text
apps/
  web/      Public Next.js app
  erp/      Internal Next.js admin app
packages/
  db/       Prisma schema, Prisma client singleton and shared database helpers
  config/   Shared ESLint and Tailwind configuration
infra/
  docker/   Railway-ready Docker image for web or erp
```

Root-level files are kept for workspace orchestration only: npm workspaces,
Turbo, TypeScript base config, environment template and deployment config.

## Common Commands

```bash
npm run dev       # run all apps through Turbo
npm run dev:web   # run the public site on port 3000
npm run dev:erp   # run the ERP app on port 3001

npm run typecheck
npm run lint
npm run build
```

## Database

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

Copy `.env.example` to `.env` and set `DATABASE_URL` before using Prisma
migrations or reading real listings.
