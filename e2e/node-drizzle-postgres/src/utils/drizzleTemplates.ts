export function drizzleTemplatesGenerator(provider: string, database: string) {
   if (database == 'drizzle' && provider == 'postgres')
      return {
         authTemplate: DRIZZLE_POSTGRES_AUTH_CONFIG,
         dbTemplate: DRIZZLE_DB_POSTGRES_TEMPLATE,
         configTemplate: DRIZZLE_CONFIG_TEMPLATE,
      };
}

const DRIZZLE_POSTGRES_AUTH_CONFIG = `import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import { db } from '../db/index.js';
const auth = new Authio({
   database: drizzleAdapter({
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

const DRIZZLE_DB_POSTGRES_TEMPLATE = `import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL!);`;

const DRIZZLE_CONFIG_TEMPLATE = `
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   out: './drizzle',
   schema: './src/db/schema.ts',
   dialect: 'postgresql',
   dbCredentials: {
      url: process.env.DATABASE_URL!,
   },
});`;
