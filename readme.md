# swift-auth

A lightweight, type-safe authentication library for TypeScript.
Framework agnostic and built with developer experience in mind.

## What it does

- Gives you a simple `new SwiftAuth({...})` API to define your auth configuration
- Automatically generates your Drizzle ORM schema based on your config
- No magic, no black boxes — you own your schema and your database

## Packages

| Package          | Description               |
| ---------------- | ------------------------- |
| `swift-auth`     | Core library              |
| `swift-auth-cli` | CLI for schema generation |

## Quick Start

```ts
import { SwiftAuth } from 'swift-auth';

export default new SwiftAuth({
   emailAndPassword: {
      enabled: true,
      verifyEmail: true,
   },
});
```

Then run:

```bash
npx swift-auth generate
```

This will generate a ready-to-use Drizzle schema at `src/db/auth-schema.ts`.

## Status

Work in progress. Currently supports:

- Email and password authentication
- Drizzle ORM schema generation (PostgreSQL)

More adapters, providers, and features coming soon.
