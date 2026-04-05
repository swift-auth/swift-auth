import { nanoid } from 'nanoid';
import { accountTable, sessionTable, userTable, verificationTable } from './schema.js';
import { DrizzleAdapterOptions, DrizzleDB } from './types.js';
import type { DatabaseAdapter } from 'swift-auth';
import { and, eq } from 'drizzle-orm';

const defaultSchema = {
   user: userTable,
   account: accountTable,
   verification: verificationTable,
   session: sessionTable,
};

const defaultOptions: DrizzleAdapterOptions = {
   schema: defaultSchema,
};

export function drizzleAdapter(
   db: DrizzleDB,
   options: DrizzleAdapterOptions = defaultOptions,
): DatabaseAdapter {
   const tables = {
      user: options?.schema?.user ?? userTable,
      session: options?.schema?.session ?? sessionTable,
      account: options?.schema?.account ?? accountTable,
      verification: options?.schema?.verification ?? verificationTable,
   };

   return {
      createUser: async (user) => {
         const id = nanoid();

         const result = await db
            .insert(tables.user)
            .values({
               id,
               ...user,
               createdAt: new Date(),
               updatedAt: new Date(),
            })
            .returning();

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
         const result = await db
            .update(tables.user)
            .set(data)
            .where(eq(tables.user.id, id))
            .returning();
         return result[0];
      },
      createSession: async (session) => {
         const id = nanoid();

         const result = await db
            .insert(tables.session)
            .values({
               id,
               ...session,
               createdAt: new Date(),
               updatedAt: new Date(),
            })
            .returning();

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
         return await db.delete(tables.session).where(eq(tables.session.token, token));
      },
      deleteUserSessions: async (userId) => {
         return await db.delete(tables.session).where(eq(tables.session.userId, userId));
      },

      createAccount: async (account) => {
         const id = nanoid();
         const result = await db
            .insert(tables.account)
            .values({
               id,
               ...account,
               createdAt: new Date(),
               updatedAt: new Date(),
            })
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

      createVerification: async (data) => {
         const result = await db
            .insert(tables.verification)
            .values({
               id: nanoid(),
               ...data,
               createdAt: new Date(),
               updatedAt: new Date(),
            })
            .returning();

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
         return await db.delete(tables.verification).where(eq(tables.verification.id, id));
      },
   };
}
