# Swift Auth

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

| Package               | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `swift-auth`          | Core authentication engine (`packages/core`)         |
| `@swift-auth/drizzle` | Drizzle ORM adapter (`packages/adapters/drizzle`)    |
| `@swift-auth/prisma`  | Prisma adapter (`packages/adapters/prisma`)          |
| `@swift-auth/node`    | Node.js / Express handler (`packages/handlers/node`) |
| `@swift-auth/react`   | React client library (`packages/react`)              |
| `@swift-auth/cli`     | CLI for schema generation (`packages/cli`)           |

## Quick Start

```bash
pnpm add swift-auth @swift-auth/drizzle @swift-auth/node
```

```ts
import { SwiftAuth } from 'swift-auth';
import { drizzleAdapter } from '@swift-auth/drizzle';
import { db } from './db/index.js';

export const auth = new SwiftAuth({
   baseUrl: 'http://localhost:8000',
   emailAndPassword: { enabled: true },
   database: drizzleAdapter({ db, provider: 'postgres' }),
});
```

```ts
import express from 'express';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from '@swift-auth/node';
import { auth } from './lib/auth.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(toNodeHandler(auth));
app.listen(8000);
```

Full documentation at [swift-auth.dev/docs](https://swift-auth.dev/docs).

## Repository Structure

.
├── apps
│ └── node # Express test app
├── landing # Next.js documentation site
├── packages
│ ├── core # swift-auth core
│ ├── adapters
│ │ ├── drizzle # @swift-auth/drizzle
│ │ └── prisma # @swift-auth/prisma
│ ├── handlers
│ │ └── node # @swift-auth/node
│ ├── react # @swift-auth/react
│ └── cli # @swift-auth/cli
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
