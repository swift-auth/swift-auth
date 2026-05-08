# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project overview

Swift Auth is a monorepo containing a Node.js authentication library and a Next.js documentation site. Read CLAUDE.md for full project context before making changes.

## Rules

### General

- Never modify generated files (Prisma client output, built dist folders)
- Never change public API signatures without updating the corresponding documentation page
- Always run `pnpm typecheck` after editing TypeScript files
- Do not add dependencies without checking if the capability already exists in the repo

### Adapters

- `drizzleAdapter` must accept `{ db, provider }` — never a bare `db` argument
- `prismaAdapter` must accept `{ db, provider }` — `db` must be a `PrismaClient` instance
- Supported providers are exactly `'postgres' | 'mysql' | 'sqlite'` — do not add others
- MySQL codepaths in the Drizzle adapter must never use `.returning()` — always do a follow-up select

### Documentation

- All doc pages are MDX files in `landing/src/app/docs/`
- Follow the conventions in CLAUDE.md exactly — tab order, import style, adapter usage
- Do not add new MDX components that are not already available in the project
- When adding a new doc page, add it to the sidebar in `landing/src/components/docs/Sidebar.tsx`

### CLI

- The CLI reads the user's auth config via a default export — any change to how `SwiftAuth` is exported from `swift-auth` must be reflected in the CLI's config loader
- Schema generation output must be deterministic given the same adapter and provider

## Common tasks

### Add a new doc page

1. Create the MDX file at the correct route under `landing/src/app/docs/`
2. Add the route to the correct group array in `landing/src/components/docs/Sidebar.tsx`
3. Follow the tab and code conventions in CLAUDE.md

### Add a new database adapter

1. Create the package under `packages/`
2. Implement the `DatabaseAdapter` interface from `swift-auth`
3. Export `adapter`, `AdapterOptions`, and `Providers` types
4. Add schema generation support to the CLI's `generateSchema` function
5. Add the adapter to the Database section in the sidebar
6. Write the database doc page following the Drizzle and Prisma pages as templates

### Add a new framework handler

1. Create the package under `packages/`
2. Export a `to<Framework>Handler(auth)` function
3. Enable the disabled tab trigger for that framework in `installation.mdx`, `quick-start.mdx`, and any other relevant pages
4. Update the Framework Integration section in `installation.mdx`
