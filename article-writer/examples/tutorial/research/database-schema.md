# Research: Designing the Schema with Drizzle

## Drizzle Schema Best Practices (2025-2026)

- PostgreSQL recommends identity columns over serial types; Drizzle supports this.
- Schema defined in TypeScript files, co-located with application code.
- Type inference from schema: `typeof events.$inferSelect`, `typeof events.$inferInsert`.
- Relations defined separately from tables for query builder.

## Connection Setup Pattern

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
```

- For migrations, use `max: 1` in postgres options.
- Singleton pattern recommended in dev to avoid hot-reload connection leaks.

## drizzle-kit Commands

- `drizzle-kit generate` — generates SQL migration files from schema changes
- `drizzle-kit migrate` — runs pending migrations against the database
- `drizzle-kit push` — pushes schema directly (dev only, no migration files)
- `drizzle-kit studio` — visual database browser

## Migration vs Push

- `push` is great for prototyping: instant schema sync, no migration files.
- `generate` + `migrate` for production: versioned, reviewable, rollback-able.
- Drizzle tracks applied migrations in `__drizzle_migrations` table.

## Performance Patterns for Time-Series Data

- Use timestamp indexes for time-range queries.
- Consider partitioning for large datasets.
- Drizzle supports custom SQL in schema for indexes and constraints.

## Sources

- https://orm.drizzle.team/docs/get-started/postgresql-new
- https://orm.drizzle.team/docs/drizzle-kit-generate
- https://orm.drizzle.team/docs/drizzle-kit-migrate
- https://orm.drizzle.team/docs/drizzle-kit-push
- https://orm.drizzle.team/docs/migrations
- https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717
- https://neon.com/docs/guides/drizzle-migrations
- https://dev.to/sameer_saleem/the-ultimate-guide-to-drizzle-orm-postgresql-2025-edition-22b
