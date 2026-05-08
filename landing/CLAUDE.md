# CLAUDE.md

This file gives Claude context about the Swift Auth repository.

## What this project is

Swift Auth is a modular, type-safe authentication library for Node.js. It is not a hosted service — it is a set of packages developers install and configure themselves.

## Monorepo structure

.
├── apps
│ └── node # Express test/demo app using both Drizzle and Prisma
├── landing # Next.js documentation and marketing site
├── packages
│ ├── core # swift-auth — core engine, SwiftAuth class, providers, types
│ ├── adapters
│ │ ├── drizzle # @swift-auth/drizzle
│ │ └── prisma # @swift-auth/prisma
│ ├── handlers
│ │ └── node # @swift-auth/node — Express handler via toNodeHandler()
│ ├── react # @swift-auth/react — client library
│ └── cli # @swift-auth/cli — schema generation CLI
└── pnpm-workspace.yaml

## Documentation site

Located in `landing/`. Built with Next.js and MDX. Docs live in `landing/src/app/docs/`.

### Pages

| Route                                 | File                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| `/docs`                               | `landing/src/app/docs/page.mdx`                               |
| `/docs/installation`                  | `landing/src/app/docs/installation/page.mdx`                  |
| `/docs/quick-start`                   | `landing/src/app/docs/quick-start/page.mdx`                   |
| `/docs/providers`                     | `landing/src/app/docs/providers/page.mdx`                     |
| `/docs/database/drizzle`              | `landing/src/app/docs/database/drizzle/page.mdx`              |
| `/docs/database/prisma`               | `landing/src/app/docs/database/prisma/page.mdx`               |
| `/docs/authentication/email-password` | `landing/src/app/docs/authentication/email-password/page.mdx` |
| `/docs/authentication/google`         | `landing/src/app/docs/authentication/google/page.mdx`         |
| `/docs/authentication/github`         | `landing/src/app/docs/authentication/github/page.mdx`         |
| `/docs/cli`                           | `landing/src/app/docs/cli/page.mdx`                           |
| `/docs/configuration`                 | `landing/src/app/docs/configuration/page.tsx`                 |

### Sidebar

`landing/src/components/docs/Sidebar.tsx` — add new pages here when creating new doc routes.

### MDX components available

- `CodeBlock` — `@/components/ui/CodeBlock`, props: `code`, `lang`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — `@/components/ui/tabs`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — `@/components/ui/table`
- `Button` — `@/components/ui/button`
- `Link` — `next/link`

### Doc page conventions

- Package manager tab groups always include pnpm, npm, yarn, bun in that order
- Install and usage code are always in separate tab groups
- Database adapter examples always show Drizzle and Prisma tabs
- Auth config examples always show full import block, not just the config object
- `drizzleAdapter` takes `{ db, provider }` — never `drizzleAdapter(db)`
- `prismaAdapter` takes `{ db, provider }` where `db` is a `PrismaClient` instance with a driver adapter
- Supported providers: `'postgres' | 'mysql' | 'sqlite'`

## Key implementation notes

### Core (`packages/core`)

- Main class: `SwiftAuth` exported from `packages/core/src/core/swiftAuth.ts`
- Providers exported from `swift-auth/providers` — `googleProvider`, `gitHubProvider`
- Error class: `SwiftError` at `packages/core/src/core/SwiftError.ts`
- Uses `zod` for config validation and `bcryptjs` for password hashing

### Drizzle adapter (`packages/adapters/drizzle`)

- Separate schema files per provider: `schemas/postgres.ts`, `schemas/sql.ts` (MySQL), `schemas/sqlite.ts`
- MySQL does not support `.returning()` — create/update do a follow-up select to return data
- Export: `drizzleAdapter`, `Providers`, `DrizzleAdapterOptions`

### Prisma adapter (`packages/adapters/prisma`)

- Single `schema.prisma` works for all providers — CLI adjusts timestamp types per provider
- PostgreSQL timestamps: `@db.Timestamptz(3)`, MySQL: `@db.DateTime(3)`, SQLite: default `DateTime`
- Prisma's `create()` and `update()` always return the full row for all providers — no follow-up select needed
- Export: `prismaAdapter`, `PrismaAdapterOptions`, `Providers`

### Node handler (`packages/handlers/node`)

- Exports `toNodeHandler(auth)` — wraps the SwiftAuth instance as Express middleware
- Registers all auth routes automatically

### React client (`packages/react`)

- Client: `SwiftAuthClient` exported from `@swift-auth/react`
- Methods: `emailSignIn`, `emailSignUp`, `signOut`
- Source: `packages/react/src/client.ts`

### CLI (`packages/cli`)

- Binary name: `swift-auth`
- One subcommand: `generate`
- Options: `--config` (path to auth config), `--output` (path to write schema)
- Auto-detects config at: `./src/lib/auth.ts`, `./src/lib/auth.js`, `./lib/auth.ts`, `./lib/auth.js`
- Reads the auth config's default export to detect adapter and provider
- Generators: `packages/cli/src/generators/drizzle.ts`, `packages/cli/src/generators/prisma.ts`
- Generates four tables: `user`, `account`, `session`, `verification`
