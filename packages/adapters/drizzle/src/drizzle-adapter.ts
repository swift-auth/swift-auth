import { nanoid } from 'nanoid';
import type { DrizzleAdapterOptions, Providers } from './types.js';
import type { DatabaseAdapter } from 'swift-auth';
import { and, eq } from 'drizzle-orm';
import * as sqlSchema from './schemas/sql.js';
import * as postgresSchema from './schemas/postgres.js';
import * as sqliteSchema from './schemas/sqlite.js';

/*
In Drizzle the schema definition changes based on the provider used so we need to check the provider used by the user
and based on that select the tables all schemas are in /src/schemas
*/
function getTables(provider: Providers) {
   if (provider === 'mysql') {
      return {
         user: sqlSchema.userTable,
         session: sqlSchema.sessionTable,
         account: sqlSchema.accountTable,
         verification: sqlSchema.verificationTable,
      };
   }

   if (provider === 'postgres') {
      return {
         user: postgresSchema.userTable,
         session: postgresSchema.sessionTable,
         account: postgresSchema.accountTable,
         verification: postgresSchema.verificationTable,
      };
   }

   return {
      user: sqliteSchema.userTable,
      session: sqliteSchema.sessionTable,
      account: sqliteSchema.accountTable,
      verification: sqliteSchema.verificationTable,
   };
}

/*
IMPORTANT POINT: In some methods you can see that based on the provider is mysql or not we are fetching the results 
because mysql doesn't support .returning() so we need to do 2nd call to fecth the new data. sqllite and postgres do support .returning()
*/

export function drizzleAdapter(adapterOptions: DrizzleAdapterOptions): DatabaseAdapter {
   const { db, provider } = adapterOptions;
   const tables = getTables(provider);
   const isMysql = provider === 'mysql';

   return {
      createUser: async (user) => {
         const values = { id: nanoid(), ...user, createdAt: new Date(), updatedAt: new Date() };
         if (isMysql) {
            await db.insert(tables.user).values(values);
            const result = await db.select().from(tables.user).where(eq(tables.user.id, values.id));
            return result[0];
         }
         const result = await db.insert(tables.user).values(values).returning();
         return result[0];
      },

      findUserById: async (id) => {
         const result = await db.select().from(tables.user).where(eq(tables.user.id, id));
         return result[0] ?? null;
      },

      findUserByEmail: async (email) => {
         const result = await db.select().from(tables.user).where(eq(tables.user.email, email));
         return result[0] ?? null;
      },

      updateUser: async (id, data) => {
         const payload = { ...data, updatedAt: new Date() };
         if (isMysql) {
            await db.update(tables.user).set(payload).where(eq(tables.user.id, id));
            const result = await db.select().from(tables.user).where(eq(tables.user.id, id));
            return result[0];
         }
         const result = await db
            .update(tables.user)
            .set(payload)
            .where(eq(tables.user.id, id))
            .returning();
         return result[0];
      },

      createSession: async (session) => {
         const values = { id: nanoid(), ...session, createdAt: new Date(), updatedAt: new Date() };
         if (isMysql) {
            await db.insert(tables.session).values(values);
            const result = await db
               .select()
               .from(tables.session)
               .where(eq(tables.session.id, values.id));
            return result[0];
         }
         const result = await db.insert(tables.session).values(values).returning();
         return result[0];
      },

      findSessionByToken: async (token) => {
         const result = await db
            .select()
            .from(tables.session)
            .where(eq(tables.session.token, token));
         return result[0] ?? null;
      },

      deleteSession: async (token) => {
         await db.delete(tables.session).where(eq(tables.session.token, token));
      },

      deleteUserSessions: async (userId) => {
         await db.delete(tables.session).where(eq(tables.session.userId, userId));
      },

      createAccount: async (account) => {
         const values = { id: nanoid(), ...account, createdAt: new Date(), updatedAt: new Date() };
         if (isMysql) {
            await db.insert(tables.account).values(values);
            const result = await db
               .select()
               .from(tables.account)
               .where(eq(tables.account.id, values.id));
            return result[0];
         }
         const result = await db.insert(tables.account).values(values).returning();
         return result[0];
      },

      updateAccount: async (id, data) => {
         const payload = { ...data, updatedAt: new Date() };
         if (isMysql) {
            await db.update(tables.account).set(payload).where(eq(tables.account.id, id));
            const result = await db.select().from(tables.account).where(eq(tables.account.id, id));
            return result[0];
         }
         const result = await db
            .update(tables.account)
            .set(payload)
            .where(eq(tables.account.id, id))
            .returning();
         return result[0];
      },

      findAccountByUserId: async (userId, providerId) => {
         const result = await db
            .select()
            .from(tables.account)
            .where(
               and(eq(tables.account.userId, userId), eq(tables.account.providerId, providerId)),
            );
         return result[0] ?? null;
      },

      createVerification: async (verification) => {
         const values = {
            id: nanoid(),
            value: nanoid(),
            ...verification,
            createdAt: new Date(),
            updatedAt: new Date(),
         };
         if (isMysql) {
            await db.insert(tables.verification).values(values);
            const result = await db
               .select()
               .from(tables.verification)
               .where(eq(tables.verification.id, values.id));
            return result[0];
         }
         const result = await db.insert(tables.verification).values(values).returning();
         return result[0];
      },

      findVerificationByToken: async (token) => {
         const result = await db
            .select()
            .from(tables.verification)
            .where(eq(tables.verification.value, token));
         return result[0] ?? null;
      },

      deleteVerification: async (id) => {
         await db.delete(tables.verification).where(eq(tables.verification.id, id));
      },
   };
}
