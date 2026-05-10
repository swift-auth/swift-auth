# Authio

Type-safe authentication for Node.js applications. Modular by design — works with the ORMs, databases, and frameworks you already use.

## Features

- Email and password authentication with optional email verification
- Social providers — Google and GitHub
- Database adapters for Drizzle and Prisma
- Supports PostgreSQL, MySQL, and SQLite
- Framework handler for Express (Hono and Next.js coming soon)
- React client library for session management
- CLI for generating database schemas
- Fully type-safe

## Packages

| Package           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `authio`          | Core authentication engine (`packages/core`)         |
| `@authio/drizzle` | Drizzle ORM adapter (`packages/adapters/drizzle`)    |
| `@authio/prisma`  | Prisma adapter (`packages/adapters/prisma`)          |
| `@authio/node`    | Node.js / Express handler (`packages/handlers/node`) |
| `@authio/react`   | React client library (`packages/react`)              |
| `@authio/cli`     | CLI for schema generation (`packages/cli`)           |

## Quick Start

```bash
pnpm add authio @authio/drizzle @authio/node
```

```ts
import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import { db } from './db/index.js';

export const auth = new Authio({
   baseUrl: 'http://localhost:8000',
   emailAndPassword: { enabled: true },
   database: drizzleAdapter({ db, provider: 'postgres' }),
});
```

```ts
import express from 'express';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from '@authio/node';
import { auth } from './lib/auth.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(toNodeHandler(auth));
app.listen(8000);
```

Full documentation at [authio.dev/docs](https://authio.dev/docs).

## Repository Structure

.
├── apps
│ └── node # Express test app
├── landing # Next.js documentation site
├── packages
│ ├── core # authio core
│ ├── adapters
│ │ ├── drizzle # @authio/drizzle
│ │ └── prisma # @authio/prisma
│ ├── handlers
│ │ └── node # @authio/node
│ ├── react # @authio/react
│ └── cli # @authio/cli
└── pnpm-workspace.yaml

## Documentation

- [Installation](landing/src/app/docs/installation/page.mdx)
- [Quick Start](landing/src/app/docs/quick-start/page.mdx)
- [Database — Drizzle](landing/src/app/docs/database/drizzle/page.mdx)
- [Database — Prisma](landing/src/app/docs/database/prisma/page.mdx)
- [Email & Password](landing/src/app/docs/authentication/email-password/page.mdx)
- [Google](landing/src/app/docs/authentication/google/page.mdx)
- [GitHub](landing/src/app/docs/authentication/github/page.mdx)
- [CLI](landing/src/app/docs/cli/page.mdx)
- [Configuration](landing/src/app/docs/configuration/page.tsx)

## License

MIT
