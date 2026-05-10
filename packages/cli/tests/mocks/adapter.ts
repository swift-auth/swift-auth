import type { DatabaseAdapter } from '@authio/core';

export const mockAdapter: DatabaseAdapter = {
   id: 'drizzle-adapter',
   provider: 'postgres',

   deleteUser: async (id) => {},

   createUser: async (user) => ({
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...user,
   }),

   findUserById: async () => null,
   findUserByEmail: async () => null,

   updateUser: async (id, data) => ({
      id,
      name: 'test',
      email: 'test@test.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
   }),

   createSession: async (session) => ({
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...session,
   }),

   findSessionByToken: async () => null,

   deleteSession: async () => {},

   deleteUserSessions: async () => {},

   createAccount: async (account) => ({
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...account,
   }),

   findAccountByUserId: async () => null,

   updateAccount: async (id, data) => ({
      id,
      userId: '1',
      accountId: '1',
      providerId: 'email',
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      idToken: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
   }),

   createVerification: async (verification) => ({
      id: '1',
      value: 'token',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...verification,
   }),

   findVerificationByToken: async () => null,

   deleteVerification: async () => {},
};
