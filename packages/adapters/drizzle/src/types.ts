import { userTable, sessionTable, accountTable, verificationTable } from './schema.js';

import { drizzle } from 'drizzle-orm/node-postgres';

export type DrizzleDB = ReturnType<typeof drizzle>;

export interface DrizzleAdapterOptions {
   schema?: {
      user?: typeof userTable;
      session?: typeof sessionTable;
      account?: typeof accountTable;
      verification?: typeof verificationTable;
   };
}
