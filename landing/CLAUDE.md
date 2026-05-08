# CLAUDE.md

This file gives Claude context about the Swift Auth repository and documentation site.

## What this project is

Swift Auth is a modular, type-safe authentication library for Node.js. It is not a hosted service — it is a set of packages developers install and configure themselves.

## Repository structure

- `packages/swift-auth` — core authentication engine (SwiftAuth class, session handling, cookies, providers)
- `packages/drizzle` — Drizzle ORM adapter (`@swift-auth/drizzle`)
- `packages/prisma` — Prisma adapter (`@swift-auth/prisma`)
- `packages/react` — React client library (`@swift-auth/react`)
- `packages/node` — Node.js / Express handler (`@swift-auth/node`)
- `packages/cli` — CLI for schema generation (`@swift-auth/cli`)
- `landing` — Next.js documentation and marketing site

## Documentation site

Located in `landing/`. Built with Next.js and MDX. Docs live in `landing/src/app/docs/`.

### Pages

| Route                                 | File                                |
| ------------------------------------- | ----------------------------------- |
| `/docs/installation`                  | `installation.mdx`                  |
| `/docs/quick-start`                   | `quick-start.mdx`                   |
| `/docs/providers`                     | `providers.mdx`                     |
| `/docs/database/drizzle`              | `database/drizzle.mdx`              |
| `/docs/database/prisma`               | `database/prisma.mdx`               |
| `/docs/authentication/email-password` | `authentication/email-password.mdx` |
| `/docs/authentication/google`         | `authentication/google.mdx`         |
| `/docs/authentication/github`         | `authentication/github.mdx`         |
| `/docs/cli`                           | `cli.mdx`                           |
| `/docs/configuration`                 | `configuration.mdx`                 |

### MDX components available

- `CodeBlock` — from `@/components/ui/CodeBlock`, props: `code`, `lang`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — from `@/components/ui/tabs`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — from `@/components/ui/table`
- `Button` — from `@/components/ui/button`
- `Link` — from `next/link`

### Doc page conventions

- Tab groups for package manager selection always include pnpm, npm, yarn, bun in that order
- Install and usage code are always in separate tab groups
- Database adapter examples always show Drizzle and Prisma tabs
- Auth config examples always show the full import block, not just the config object
- `drizzleAdapter` takes `{ db, provider }` — never `drizzleAdapter(db)`
- `prismaAdapter` takes `{ db, provider }` where `db` is a `PrismaClient` instance with a driver adapter
- Supported providers: `'postgres' | 'mysql' | 'sqlite'`

## Key implementation notes

### Drizzle adapter

- Uses separate schema files per provider: `postgres.ts`, `sql.ts` (MySQL), `sqlite.ts`
- MySQL does not support `.returning()` so create/update methods do a second select to return data
- Export: `drizzleAdapter`, `Providers`, `DrizzleAdapterOptions`

### Prisma adapter

- Single `schema.prisma` works for all providers — CLI adjusts timestamp types per provider
- PostgreSQL timestamps use `@db.Timestamptz(3)`, MySQL uses `@db.DateTime(3)`, SQLite uses default `DateTime`
- Unlike Drizzle, Prisma's `create()` and `update()` always return the full row for all providers
- Export: `prismaAdapter`, `PrismaAdapterOptions`, `Providers`

### CLI

- Binary: `swift-auth`
- One subcommand: `generate`
- Options: `--config` (path to auth config), `--output` (path to write schema)
- Auto-detects config at: `./src/lib/auth.ts`, `./src/lib/auth.js`, `./lib/auth.ts`, `./lib/auth.js`
- Reads the auth config's default export to detect adapter and provider, then generates the correct schema
- Generates four tables: `user`, `account`, `session`, `verification`
