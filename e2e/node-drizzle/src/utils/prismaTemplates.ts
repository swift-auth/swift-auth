export function prismaTemplatesGenerator(provider: string, database: string) {
   if (database === 'prisma' && provider === 'postgres')
      return {
         authio: PRISMA_POSTGRES_AUTH_CONFIG,
         dbInstance: PRISMA_DB_INSTANCE_FILE_FOR_POSTGRES,
         prismaConfig: PRISMA_DB_CONFIG_FILE_FOR_POSTGRES,
      };

   if (database === 'prisma' && provider === 'mysql')
      return {
         authio: PRISMA_MYSQL_AUTH_CONFIG,
         dbInstance: PRISMA_DB_INSTANCE_FILE_FOR_MYSQL,
         prismaConfig: PRISMA_DB_CONFIG_FILE_FOR_MYSQL,
      };

   if (database === 'prisma' && provider === 'sqlite') return {};
}

// ─── postgres ──────────────────────────────────────────────────────────────
const PRISMA_POSTGRES_AUTH_CONFIG = `import { Authio } from '@authio/core';
import { prismaAdapter } from '@authio/prisma';

import { prisma } from '../lib/prisma.js';

const auth = new Authio({
   database: prismaAdapter({
      db: prisma,
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

const PRISMA_DB_INSTANCE_FILE_FOR_POSTGRES = `import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
const connectionString = process.env.POSTGRES_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
export { prisma };`;

const PRISMA_DB_CONFIG_FILE_FOR_POSTGRES = `
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["POSTGRES_URL"],
  },
});`;

// ─── mysql ──────────────────────────────────────────────────────────────
const PRISMA_MYSQL_AUTH_CONFIG = `import { Authio } from '@authio/core';
import { prismaAdapter } from '@authio/prisma';

import { prisma } from '../lib/prisma.js';

const auth = new Authio({
   database: prismaAdapter({
      db: prisma,
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

const PRISMA_DB_INSTANCE_FILE_FOR_MYSQL = `
import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
const url = new URL(process.env.MYSQL_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });
export { prisma };`;

const PRISMA_DB_CONFIG_FILE_FOR_MYSQL = `
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.MYSQL_URL,
  },
});`;
