# The Spot

Real estate rental platform for Uzbekistan — [thespot.uz](https://thespot.uz).

Browse and publish apartment rental listings. What a user can do is gated by
the role they pick at registration (seeker / landlord). The interface ships in
**Russian** (primary) and **Uzbek**.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **next-intl** for `ru` / `uz` localisation
- **PostgreSQL** via **Prisma** (hosted on Railway)
- Monorepo with **npm workspaces** + **Turborepo**

## Layout

```
.
├── web/              Public site (Next.js, ru/uz)
├── erp/              Internal ERP panel (Next.js, ru)
├── packages/
│   ├── db/           Prisma schema + shared client (@thespot/db)
│   └── config/       Shared Tailwind preset & ESLint (@thespot/config)
└── infra/            Dockerfile & Railway deployment config
```

## Getting started

```bash
nvm use                 # Node 20
npm install             # installs all workspaces, generates the Prisma client
cp .env.example .env     # then fill in DATABASE_URL

npm run dev             # web on :3000, erp on :3001
```

## Useful scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Run every app in dev mode            |
| `npm run build`      | Build every app                      |
| `npm run lint`       | Lint the workspace                   |
| `npm run typecheck`  | Type-check the workspace             |
| `npm run db:migrate` | Create / apply a Prisma migration    |
| `npm run db:studio`  | Open Prisma Studio                   |

## Deployment

See [`infra/README.md`](./infra/README.md).
