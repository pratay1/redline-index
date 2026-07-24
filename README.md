# Redline Index

Redline Index is a production-oriented automotive database for preserving, searching, and publishing verified vehicle specifications. This Week 1 foundation establishes the data model, authentication, administration, validated APIs, deployment automation, and documentation necessary to grow safely.

## Architecture

| Concern        | Decision                                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| Application    | Next.js App Router with TypeScript and Tailwind CSS                                    |
| Authentication | Clerk owns identity, sessions, and signed webhooks                                     |
| Data           | Supabase PostgreSQL stores Redline Index domain data through Prisma ORM                |
| Data access    | One Prisma client using Prisma 7's PostgreSQL driver adapter                           |
| Validation     | Zod validates environment and API boundaries                                           |
| Authorization  | Application roles (`MEMBER`, `EDITOR`, `ADMIN`) are checked at each protected resource |
| Delivery       | Vercel hosting and GitHub Actions continuous verification                              |

### Folder layout

```text
src/
  app/                    App Router pages and route handlers
    api/                  Public, admin, health, and Clerk webhook endpoints
  features/               Domain modules: auth, vehicles, future search/admin
  lib/                    Shared infrastructure: environment, Prisma, errors
prisma/                   Schema and migrations
.github/workflows/        Continuous integration
```

Routes stay thin. Business rules belong in `src/features`; shared infrastructure stays in `src/lib`. This lets vehicle ingestion, search, comparisons, and editorial tooling evolve independently.

## Data and API foundation

The catalogue is normalized for long-lived automotive data: `Manufacturer → VehicleModel → VehicleGeneration → ModelYear → Vehicle` (a market-specific trim offering). Engines and transmissions are reusable records. Dimensions, performance, fuel economy, price history, and images are trim-level records rather than columns on one large table. `Source` and field-level `SourceCitation` records preserve provenance for individual facts. Users and audit logs remain independent from the catalogue hierarchy.

Core catalogue records use restrictive foreign keys so a manufacturer, model, generation, model year, engine, or transmission cannot be deleted while it is still referenced. Trim-owned details (dimensions, performance, economy, prices, and images) cascade when a trim is deliberately removed. Sources are protected while citations reference them; image sources are retained as optional metadata.

- `GET /api/vehicles` is the public, cached search endpoint. It accepts `q`, `make`, `year`, `bodyStyle`, `fuelType`, `limit`, and `cursor`.
- `POST /api/admin/vehicles` is a protected editorial endpoint. It Zod-validates vehicle data, creates a manufacturer when needed, and records an audit event.
- `POST /api/webhooks/clerk` verifies Clerk events and synchronizes users to PostgreSQL.
- `GET /api/health` is a lightweight deployment health endpoint.

## Local setup

1. Install Node.js 22 or later, then run `npm install`.
2. Create a Supabase project and copy `.env.example` to `.env`.
3. Add the Supabase pooler URL as `DATABASE_URL`. Keep `DIRECT_URL` for direct administrative CLI work.
4. Create a Clerk application and add its publishable key, secret key, and webhook signing secret.
5. In Clerk, create a webhook for `https://your-domain.com/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, and `user.deleted`.
6. Apply the schema with `npm run prisma:migrate`, then generate the client with `npm run prisma:generate`.
7. Optionally load the documented BMW sample with `npm run prisma:seed`.
8. Start the app with `npm run dev`.

After the first admin has signed in and the webhook has synced their row, promote that person deliberately:

```sql
update "User" set role = 'ADMIN' where "clerkId" = 'user_your_clerk_id';
```

## Deployment

Import the repository into Vercel. Set every variable from `.env.example` for Preview and Production, then set `NEXT_PUBLIC_APP_URL` to the canonical domain. Before a production release, run `npm run prisma:deploy` against production Supabase as a controlled deployment step; do not use development migrations in production.

## Development commands

| Command                   | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `npm run lint`            | Run ESLint                                              |
| `npm run typecheck`       | Run strict TypeScript checks                            |
| `npm run format`          | Format source with Prettier and Tailwind class ordering |
| `npm run format:check`    | Verify formatting without writing                       |
| `npm run prisma:validate` | Validate the Prisma schema                              |
| `npm run prisma:migrate`  | Create and apply a development migration                |
| `npm run prisma:deploy`   | Apply committed migrations in deployment                |
| `npm run prisma:seed`     | Load the idempotent, source-linked BMW sample catalogue |

## Coding standards

- TypeScript is strict: do not use `any`; validate unknown input with Zod.
- Route handlers validate input, return intentional status codes, and enforce authorization at the resource boundary.
- Use Prisma only through `src/lib/prisma.ts`; do not instantiate ad-hoc clients.
- Keep domain code in feature folders rather than pages or components.
- Every admin data change must write an audit log entry.
- Never commit secrets, local environment files, generated Prisma client code, or build output.
- Run formatting, linting, type checks, Prisma validation, and a production build before merging.
