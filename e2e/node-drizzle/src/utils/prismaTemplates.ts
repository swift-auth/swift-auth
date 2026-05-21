export function prismaTemplatesGenerator(provider: string, database: string) {
   if (database === 'prisma' && provider === 'postgres')
      return {
         authTemplate: PRISMA_POSTGRES_AUTH_CONFIG,
         dbTemplate: DRIZZLE_DB_POSTGRES_TEMPLATE,
         configTemplate: DRIZZLE_POSTGRES_CONFIG_TEMPLATE,
      };

   if (database === 'prisma' && provider === 'mysql')
      return {
         authTemplate: DRIZZLE_MYSQL_AUTH_CONFIG,
         dbTemplate: DRIZZLE_DB_MYSQL_TEMPLATE,
         configTemplate: DRIZZLE_MYSQL_CONFIG_TEMPLATE,
      };

   if (database === 'prisma' && provider === 'sqlite')
      return {
         authTemplate: DRIZZLE_SQLITE_AUTH_CONFIG,
         dbTemplate: DRIZZLE_DB_SQLITE_TEMPLATE,
         configTemplate: DRIZZLE_SQLITE_CONFIG_TEMPLATE,
      };
}

// ─── postgres ──────────────────────────────────────────────────────────────
const PRISMA_POSTGRES_AUTH_CONFIG = `import { Authio } from '@authio/core';
import { prismaAdapter } from '@authio/prisma';
import { db } from '../db/index.js';
const auth = new Authio({
   database: prismaAdapter({
      db,
      provider: 'postgres',
   }),
   baseUrl: \`http://localhost:\${process.env.PORT!}\`,
   emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      verifyEmail: true,
      verificationCallback: async (data) => {
    
      },
      forgotPasswordCallback: async (data) => {
    
      },
   },
});
export default auth;`;

const PRISMA_DB_POSTGRES_TEMPLATE = `import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
export const db = drizzle(process.env.POSTGRES_URL!);`;

const DRIZZLE_POSTGRES_CONFIG_TEMPLATE = `
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
   out: './drizzle',
   schema: './src/db/schema.ts',
   dialect: 'postgresql',
   dbCredentials: {
      url: process.env.POSTGRES_URL!,
   },
});`;

// ─── mysql ─────────────────────────────────────────────────────────────────
const DRIZZLE_MYSQL_AUTH_CONFIG = `import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import { db } from '../db/index.js';
const auth = new Authio({
   database: drizzleAdapter({
      db,
      provider: 'mysql',
   }),
   baseUrl: \`http://localhost:\${process.env.PORT!}\`,
   emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      verifyEmail: true,
      verificationCallback: async (data) => {
    
      },
      forgotPasswordCallback: async (data) => {
    
      },
   },
});
export default auth;`;

const DRIZZLE_DB_MYSQL_TEMPLATE = `import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
export const db = drizzle(process.env.MYSQL_URL!);`;

const DRIZZLE_MYSQL_CONFIG_TEMPLATE = `
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
   out: './drizzle',
   schema: './src/db/schema.ts',
   dialect: 'mysql',
   dbCredentials: {
      url: process.env.MYSQL_URL!,
   },
});`;

// ─── sqlite ────────────────────────────────────────────────────────────────
const DRIZZLE_SQLITE_AUTH_CONFIG = `import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import { db } from '../db/index.js';
const auth = new Authio({
   database: drizzleAdapter({
      db,
      provider: 'sqlite',
   }),
   baseUrl: \`http://localhost:\${process.env.PORT!}\`,
   emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      verifyEmail: true,
      verificationCallback: async (data) => {
    
      },
      forgotPasswordCallback: async (data) => {
    
      },
   },
   internal: {
    logError: false
}
});
export default auth;`;

const DRIZZLE_DB_SQLITE_TEMPLATE = `
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const db = drizzle({ connection: { source: process.env.SQLITE_URL ?? './sqlite-test.db' } });`;

const DRIZZLE_SQLITE_CONFIG_TEMPLATE = `
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
   out: './drizzle',
   schema: './src/db/schema.ts',
   dialect: 'sqlite',
   dbCredentials: {
      url: process.env.SQLITE_URL ?? './sqlite-test.db',
   },
});`;
