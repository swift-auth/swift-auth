# @authio/cli

CLI for generating database schemas for Authio. Reads your auth config and outputs the correct schema for your adapter and provider.

## Usage

```bash
npx @authio/cli generate
```

No installation required.

## Commands

### `generate`

Reads your auth config and generates the database schema. Outputs four tables: `user`, `account`, `session`, and `verification`.

```bash
npx @authio/cli generate
```

**Options:**

`--config` — path to your auth config file, relative to project root:

```bash
npx @authio/cli generate --config ./src/lib/auth.ts
```

`--output` — path where the schema file should be written:

```bash
npx @authio/cli generate --output ./src/db/auth-schema.ts
```

Both can be combined:

```bash
npx @authio/cli generate --config ./src/lib/auth.ts --output ./src/db/auth-schema.ts
```

**Default config locations** (checked in order when `--config` is not provided):

```
./src/lib/auth.ts
./src/lib/auth.js
./lib/auth.ts
./lib/auth.js
```

**Default output paths** (used when `--output` is not provided):

```
drizzle-adapter  →  src/db/schema.ts
prisma-adapter   →  prisma/schema.prisma
```

## How it works

1. `validateDefaultConfigPaths` / `validateInputConfigPath` — resolves and checks the config file exists on disk
2. `loadConfig` — uses `jiti` to import the config file at runtime (supports TypeScript without a build step), reads `mod.default.config` from the default export
3. `generateSchema` — checks `config.database.id` and delegates to the correct generator (`drizzle.ts` or `prisma.ts`)
4. `writeSchemaToFile` — resolves the output path, creates directories if needed, writes the schema

## Package structure

```
src/
├── index.ts                  # CLI entry point, registers subcommands via citty
├── commands/
│   └── generate.ts           # generate command — arg parsing, orchestration, error output
├── generators/
│   ├── drizzle.ts            # generates Drizzle schema for postgres / mysql / sqlite
│   └── prisma.ts             # generates Prisma schema
└── utils/
    ├── configHelpers.ts      # config file resolution and loading via jiti
    └── schemaHelper.ts       # generateSchema + writeSchemaToFile
```

## Adding a new adapter

1. Add a generator at `src/generators/<adapter>.ts` — export a function that takes a provider string and returns the schema as a string
2. Wire it into `src/utils/schemaHelper.ts` — add a check for the new `config.database.id` in `generateSchema` and handle the default output path in `writeSchemaToFile`
3. Add a test in `tests/generators/` following the existing snapshot tests

## Adding a new command

1. Create `src/commands/<name>.ts` using `defineCommand` from `citty`
2. Register it in `src/index.ts` under `subCommands`

## Config file contract

The CLI expects the user's config file to have a default export where `.config` is the parsed `Authio` config object:

```ts
// user's auth.ts
import { Authio } from '@authio/core';

const auth = new Authio({ ... });

export default auth;
```

`loadConfig` reads `mod.default.config` — this works because `Authio` stores its parsed config at `this.config`. If the export shape changes in core, update `loadConfig` in `configHelpers.ts`.

## Development

```bash
pnpm build          # build to dist/
pnpm dev            # watch mode
pnpm test           # run tests
pnpm typecheck      # type check without emitting
```

To test the CLI against a real config locally:

```bash
node dist/index.js generate --config ./path/to/auth.ts
```

## Error reference

| Error                                  | Cause                                                         |
| -------------------------------------- | ------------------------------------------------------------- |
| Could not find the auth config file    | `--config` path doesn't exist                                 |
| Could not locate your auth config file | no `--config` and none of the default paths exist             |
| Failed to load auth config             | file found but `mod.default` is null — missing default export |
| Failed to generate schema              | `database.id` or `database.provider` not supported            |

## License

MIT
