# Prisma Schema Organization

This directory contains the Prisma schema and models for the CITZ SBC Queue Management System. The schema is organized to support a dual-schema migration strategy from a legacy database.

## Architecture Overview

### Multi-Schema Setup

The application uses **two PostgreSQL schemas** to manage data migration incrementally:

- **`public` schema** – Staging schema for legacy data ingested from the old database
- **`app` schema** – New application schema for incrementally built models and transformed data

This approach allows:
- Parallel operation of old and new database schemas
- Incremental data transformation and migration
- Low-risk migration pathway without downtime

### Schema Separation

```
prisma/
├── schema.prisma       # Main Prisma configuration (datasource, generator)
└── models/
    ├── app/            # Models for the "app" schema
    │   └── *.prisma    # Application-specific data models
    └── staging/        # Models for the "public" schema (legacy data)
        └── *.prisma    # Legacy data staging models
```

## Usage

### Defining Models

#### Application Models (app schema)

Create new models in `prisma/models/app/` for application-specific entities:

```prisma
// prisma/models/app/appointments.prisma
model Appointment {
  id    Int     @id @default(autoincrement())
  title String
  date  DateTime
  @@schema("app")
}
```

#### Staging Models (public schema)

Legacy data models go in `prisma/models/staging/` and use the `public` schema:

```prisma
// prisma/models/staging/legacyAppointments.prisma
model LegacyAppointment {
  id    Int     @id @default(autoincrement())
  title String
  date  DateTime
  @@schema("public")
}
```

### Running Migrations

All migrations are stored in `prisma/migrations/` and apply to both schemas:

```bash
# Create and apply a new migration
npm run db:migrate -- --name <migration_name>

# Sync database schema (no migration history)
npm run db:push
```

### Client Usage

The Prisma Client is generated to `src/generated/prisma/` and configured with the PostgreSQL adapter:

```typescript
// Import in server components and actions
import { prisma } from '@/utils/db/prisma'

// Query app schema models
const appointment = await prisma.appointment.findUnique({
  where: { id: 1 }
})
```

### Viewing Data

Use Prisma Studio to browse and edit data in both schemas:

```bash
npm run db:studio
```

## Best Practices

### Schema Management

- **Always include `@@schema()` directive** in model definitions to specify the target schema
- **Never mix schemas** in a single `.prisma` file – separate app and staging models

### Data Migration

- **Transform incrementally** – Move data from `public` schema to `app` schema as needed
- **Validate transformations** – Test migration logic before applying to production
- **Audit legacy data** – Keep the `public` schema intact for verification during migration

## Configuration Files

- **`prisma.config.ts`** – Prisma CLI configuration (migrations path, datasource)
- **`prisma/schema.prisma`** – Main schema with datasource and client generator
- **`prisma/models/app/*.prisma`** – Application schema models
- **`prisma/models/staging/*.prisma`** – Public schema (staging) models

## Common Commands

```bash
# Create and apply a new migration
npm run db:migrate -- --name <migration_name>

# Generate/regenerate Prisma Client
npm run db:generate

# View database with Studio
npm run db:studio

# Sync database schema directly (no migration history)
npm run db:push

# Seed database with initial data
npm run db:seed
```

## Troubleshooting

### Schema Out of Sync with Migrations

If the database schema drifts from migration history, use `db:push` to sync directly:

```bash
npm run db:push
```

### Changes to Generated Client Not Appearing

Regenerate the Prisma Client:

```bash
npm run db:generate
```

### Connection Issues

Verify `DATABASE_URL` environment variable includes the correct PostgreSQL connection string with schema support.

## References

- [Prisma Multi-Schema Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/names-in-underlying-database#using-names-that-differ-from-the-prisma-schema)
- [Prisma Migrations Guide](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma Client Setup](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
