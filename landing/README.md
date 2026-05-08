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

| Package               | Description                |
| --------------------- | -------------------------- |
| `swift-auth`          | Core authentication engine |
| `@swift-auth/drizzle` | Drizzle ORM adapter        |
| `@swift-auth/prisma`  | Prisma adapter             |
| `@swift-auth/react`   | React client library       |
| `@swift-auth/node`    | Node.js / Express handler  |
| `@swift-auth/cli`     | CLI for schema generation  |

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

## Documentation

- [Installation](/docs/installation)
- [Quick Start](/docs/quick-start)
- [Database — Drizzle](/docs/database/drizzle)
- [Database — Prisma](/docs/database/prisma)
- [Email & Password](/docs/authentication/email-password)
- [Google](/docs/authentication/google)
- [GitHub](/docs/authentication/github)
- [CLI](/docs/cli)
- [Configuration Reference](/docs/configuration)

## License

MIT
