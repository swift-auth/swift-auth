import { nanoid } from 'nanoid';
import type { PrismaAdapterOptions } from './types.js';
import type { DatabaseAdapter } from '@authio/core';

/*
In Prisma unlike Drizzle we don't need separate schemas per provider.
One schema.prisma works for all three databases (postgres, mysql, sqlite).
Prisma handles the provider differences internally.
*/

/*
IMPORTANT POINT: Unlike Drizzle, Prisma's create() and update() always return
the full row automatically for all providers including MySQL.

*/

export function prismaAdapter(adapterOptions: PrismaAdapterOptions): DatabaseAdapter {
   const { db } = adapterOptions;

   return {
      id: 'prisma-adapter',
      provider: adapterOptions.provider,
      createUser: async (user) => {
         return db.user.create({
            data: {
               id: nanoid(),
               ...user,
               createdAt: new Date(),
               updatedAt: new Date(),
            },
         });
      },

      findUserById: async (id) => {
         return db.user.findUnique({ where: { id } });
      },

      findUserByEmail: async (email) => {
         return db.user.findUnique({ where: { email } });
      },

      updateUser: async (id, data) => {
         return db.user.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
         });
      },

      deleteUser: async (id: string) => {
         await db.user.delete({
            where: { id },
         });
      },

      createSession: async (session) => {
         return db.session.create({
            data: {
               id: nanoid(),
               ...session,
               createdAt: new Date(),
               updatedAt: new Date(),
            },
         });
      },

      findSessionByToken: async (token) => {
         return db.session.findUnique({ where: { token } });
      },

      deleteSession: async (token) => {
         await db.session.delete({ where: { token } });
      },

      deleteUserSessions: async (userId) => {
         await db.session.deleteMany({ where: { userId } });
      },

      createAccount: async (account) => {
         return db.account.create({
            data: {
               id: nanoid(),
               ...account,
               createdAt: new Date(),
               updatedAt: new Date(),
            },
         });
      },

      findAccountByUserId: async (userId, providerId) => {
         return db.account.findFirst({ where: { userId, providerId } });
      },

      updateAccount: async (id, data) => {
         return db.account.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
         });
      },

      createVerification: async (verification) => {
         return db.verification.create({
            data: {
               id: nanoid(),
               value: nanoid(),
               ...verification,
               createdAt: new Date(),
               updatedAt: new Date(),
            },
         });
      },

      findVerificationByToken: async (token) => {
         return db.verification.findFirst({ where: { value: token } });
      },

      deleteVerification: async (id) => {
         await db.verification.delete({ where: { id } });
      },
   };
}
