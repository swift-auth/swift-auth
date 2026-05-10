# swift-auth

Type-safe authentication built for developers who want simplicity, flexibility, and control without hidden abstractions or framework lock-in.

> **Status:** Active development. Core functionality is stable. APIs may change before 1.0.

## What it is

Swift Auth gives you a clean, composable API to add authentication to any Node.js application. No magic, no generated code you can't read, no framework lock-in. You configure it, you own your schema, you control your database.

## Packages

| Package               | Description                |
| --------------------- | -------------------------- |
| `swift-auth`          | Core authentication engine |
| `@swift-auth/drizzle` | Drizzle ORM adapter        |
| `@swift-auth/prisma`  | Prisma adapter             |
| `@swift-auth/node`    | Express / Node.js handler  |
| `@swift-auth/react`   | React client library       |
| `@swift-auth/cli`     | CLI for schema generation  |

## Quick Start

```bash
pnpm add swift-auth @swift-auth/drizzle @swift-auth/node
```

**1. Create your auth instance**

```ts
// src/lib/auth.ts
import { SwiftAuth } from 'swift-auth';
import { drizzleAdapter } from '@swift-auth/drizzle';
import { db } from '../db/index.js';

export const auth = new SwiftAuth({
   baseUrl: 'http://localhost:8000',
   emailAndPassword: {
      enabled: true,
   },
   database: drizzleAdapter({
      db,
      provider: 'postgres',
   }),
});
```

**2. Generate your database schema**

```bash
npx @swift-auth/cli generate --output ./src/db/auth-schema.ts
npx drizzle-kit push
```

**3. Mount the handler**

```ts
// server.ts
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

**4. Call auth from your frontend**

```ts
// src/lib/auth-client.ts
import { SwiftAuthClient } from '@swift-auth/react';

export const authClient = SwiftAuthClient({
   baseUrl: 'http://localhost:8000',
});
```

```ts
await authClient.emailSignUp({ name, email, password });
await authClient.emailSignIn({ email, password });
await authClient.signOut();
```

## What's supported

| Feature                                     | Status  |
| ------------------------------------------- | ------- |
| Email and password auth                     | ✓       |
| Email verification                          | ✓       |
| Forgot / reset password                     | ✓       |
| Social auth — Google                        | ✓       |
| Social auth — GitHub                        | ✓       |
| Session management                          | ✓       |
| Drizzle adapter (PostgreSQL, MySQL, SQLite) | ✓       |
| Prisma adapter (PostgreSQL, MySQL, SQLite)  | ✓       |
| Express handler                             | ✓       |
| React client                                | ✓       |
| CLI schema generation                       | ✓       |
| Next.js handler                             | Planned |
| Hono handler                                | Planned |

## Documentation

Full documentation at **[swift-auth.dev/docs](https://swift-auth.dev/docs)**

- [Installation](https://swift-auth.dev/docs/installation)
- [Quick Start](https://swift-auth.dev/docs/quick-start)
- [Database — Drizzle](https://swift-auth.dev/docs/database/drizzle)
- [Database — Prisma](https://swift-auth.dev/docs/database/prisma)
- [Email & Password](https://swift-auth.dev/docs/authentication/email-password)
- [Social Providers](https://swift-auth.dev/docs/providers)
- [CLI](https://swift-auth.dev/docs/cli)
- [Configuration Reference](https://swift-auth.dev/docs/configuration)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

## License

MIT — see [LICENSE](./LICENSE.md)
