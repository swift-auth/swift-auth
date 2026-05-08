# AGENTS.md

Instructions for AI coding agents working in this repository.

## Before starting

Read `CLAUDE.md` for full project context, package locations, and conventions.

## Rules

### General

- Use pnpm — never npm or yarn
- Never modify files under any `dist/` or `generated/` directory
- Never change a public API signature without updating the corresponding doc page in `landing/`
- Run `pnpm typecheck` after editing any TypeScript files
- Do not add dependencies without checking if the capability already exists

### Adapters

- `drizzleAdapter` must accept `{ db, provider }` — never a bare `db` argument
- `prismaAdapter` must accept `{ db, provider }` — `db` must be a `PrismaClient` instance
- Supported providers are exactly `'postgres' | 'mysql' | 'sqlite'`
- MySQL codepaths in the Drizzle adapter must never use `.returning()` — always do a follow-up select
- Prisma codepaths never need a follow-up select — `create()` and `update()` always return the full row

### CLI

- The CLI reads the user's auth config via its default export — any change to how `SwiftAuth` is exported from `packages/core` must be reflected in `packages/cli/src/utils/configHelpers.ts`
- Schema output must be deterministic for the same adapter and provider combination
- Generator logic lives in `packages/cli/src/generators/` — one file per adapter

### Documentation

- All doc pages are MDX files in `landing/src/app/docs/`
- Follow all conventions in `CLAUDE.md` exactly — tab order, import style, adapter usage
- Do not introduce MDX components that are not already in `landing/src/components/ui/`
- When adding a new doc page, add it to the correct group array in `landing/src/components/docs/Sidebar.tsx`

## Common tasks

### Add a new doc page

1. Create `landing/src/app/docs/<route>/page.mdx`
2. Add the route to the correct group in `landing/src/components/docs/Sidebar.tsx`
3. Follow the conventions in `CLAUDE.md`

### Add a new database adapter

1. Create the package under `packages/adapters/<name>/`
2. Implement the `DatabaseAdapter` interface from `packages/core`
3. Export `adapter`, `AdapterOptions`, and `Providers` types
4. Add a generator to `packages/cli/src/generators/<name>.ts`
5. Wire the generator into `packages/cli/src/utils/schemaHelper.ts`
6. Add the adapter to the Database section in `landing/src/components/docs/Sidebar.tsx`
7. Write the doc page at `landing/src/app/docs/database/<name>/page.mdx` following the Drizzle and Prisma pages as templates

### Add a new framework handler

1. Create the package under `packages/handlers/<name>/`
2. Export a `to<Framework>Handler(auth)` function
3. Enable the disabled tab for that framework in `installation.mdx`, `quick-start.mdx`, and any other relevant pages
4. Add the handler to the Framework Integration section in `landing/src/app/docs/installation/page.mdx`

### Add a new social provider

1. Add the provider to `packages/core/src/providers/`
2. Export it from `packages/core/src/providers/index.ts`
3. Add a doc page at `landing/src/app/docs/authentication/<provider>/page.mdx`
4. Add it to the Authentication section in `landing/src/components/docs/Sidebar.tsx`
