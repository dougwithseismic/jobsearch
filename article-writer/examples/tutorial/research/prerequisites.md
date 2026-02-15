# Research: What You Need Before We Start

## Next.js Version

- Latest stable: Next.js 15.x (15.5+ recommended). Next.js 16 also available but 15 is the stable target.
- App Router is the default and recommended approach.
- create-next-app: `npx create-next-app@latest`
- Turbopack stable in Next.js 15 for dev.

## Drizzle ORM Setup

- Install: `pnpm add drizzle-orm postgres` and `pnpm add -D drizzle-kit`
- Uses `postgres` (postgres-js) as the driver — lightweight, zero-dependency.
- Connection: `import { drizzle } from 'drizzle-orm/postgres-js'` + `import postgres from 'postgres'`
- Config: `drizzle.config.ts` with dialect, schema path, out dir, dbCredentials.
- Migration: `pnpm drizzle-kit generate` then `pnpm drizzle-kit migrate`
- Push (dev): `pnpm drizzle-kit push` for quick schema sync without migration files.

## PostgreSQL Options

- **Docker**: `docker run --name pg -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16`
- **Neon**: Serverless Postgres, free tier, works well with Drizzle. https://neon.tech
- **Supabase**: Managed Postgres with extras. https://supabase.com
- Local install via Homebrew: `brew install postgresql@16`

## Node.js Requirements

- Node.js 20+ required (LTS).
- pnpm recommended as package manager.

## Other Dependencies

- `recharts` for charting
- `tailwindcss` for styling (comes with create-next-app)

## Sources

- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/blog/next-15
- https://orm.drizzle.team/docs/get-started/postgresql-new
- https://orm.drizzle.team/docs/kit-overview
- https://neon.com/docs/guides/drizzle-migrations
- https://strapi.io/blog/how-to-use-drizzle-orm-with-postgresql-in-a-nextjs-15-project
- https://refine.dev/blog/drizzle-react/
