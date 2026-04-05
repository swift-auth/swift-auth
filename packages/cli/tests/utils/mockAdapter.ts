import type { DatabaseAdapter } from 'swift-auth';

export const mockAdapter: DatabaseAdapter = {
   createUser: async () => {
      throw new Error('not implemented');
   },
   findUserById: async () => null,
   findUserByEmail: async () => null,
   updateUser: async () => {
      throw new Error('not implemented');
   },
   createSession: async () => {
      throw new Error('not implemented');
   },
   findSessionByToken: async () => null,
   deleteSession: async () => {},
   deleteUserSessions: async () => {},
   createAccount: async () => {
      throw new Error('not implemented');
   },
   findAccountByUserId: async () => null,
   createVerification: async () => {
      throw new Error('not implemented');
   },
   findVerificationByToken: async () => null,
   deleteVerification: async () => {},
};
