import { describe, it, expect, afterEach, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzleAdapter } from '../src/drizzle-adapter.js';
import { userTable, sessionTable, accountTable, verificationTable } from '../src/schema.js';
import { nanoid } from 'nanoid';

const db = drizzle('postgresql://test_user:test_password@localhost:5432/test_db');
const adapter = drizzleAdapter(db);

const sampleUser = {
   name: 'John Doe',
   email: 'john@example.com',
   emailVerified: false,
   image: null,
};

afterEach(async () => {
   await db.delete(sessionTable);
   await db.delete(accountTable);
   await db.delete(verificationTable);
   await db.delete(userTable);
});

afterAll(async () => {
   await db.$client.end();
});

describe('user operations', () => {
   it('createUser — creates a user and returns it with generated fields', async () => {
      const user = await adapter.createUser(sampleUser);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.name).toBe(sampleUser.name);
      expect(user.email).toBe(sampleUser.email);
      expect(user.emailVerified).toBe(false);
      expect(user.image).toBeNull();
   });

   it('findUserById — returns user by id', async () => {
      const user = await adapter.createUser(sampleUser);
      const found = await adapter.findUserById(user.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
      expect(found?.email).toBe(sampleUser.email);
   });

   it('findUserById — returns null when user does not exist', async () => {
      const found = await adapter.findUserById('nonexistent-id');
      expect(found).toBeNull();
   });

   it('findUserByEmail — returns user by email', async () => {
      const user = await adapter.createUser(sampleUser);
      const found = await adapter.findUserByEmail(sampleUser.email);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
   });

   it('findUserByEmail — returns null when email does not exist', async () => {
      const found = await adapter.findUserByEmail('nobody@example.com');
      expect(found).toBeNull();
   });

   it('updateUser — updates user fields and returns updated user', async () => {
      const user = await adapter.createUser(sampleUser);
      const updated = await adapter.updateUser(user.id, { name: 'Jane Doe' });
      expect(updated.name).toBe('Jane Doe');
      expect(updated.email).toBe(sampleUser.email);
      expect(updated.id).toBe(user.id);
   });
});

describe('session operations', () => {
   it('createSession — creates a session and returns it', async () => {
      const user = await adapter.createUser(sampleUser);
      const session = await adapter.createSession({
         userId: user.id,
         token: nanoid(),
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
         ipAddress: null,
         userAgent: null,
      });
      expect(session.id).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.token).toBeDefined();
   });

   it('findSessionByToken — returns session by token', async () => {
      const user = await adapter.createUser(sampleUser);
      const token = nanoid();
      await adapter.createSession({
         userId: user.id,
         token,
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
         ipAddress: null,
         userAgent: null,
      });
      const found = await adapter.findSessionByToken(token);
      expect(found).not.toBeNull();
      expect(found?.token).toBe(token);
   });

   it('findSessionByToken — returns null when token does not exist', async () => {
      const found = await adapter.findSessionByToken('nonexistent-token');
      expect(found).toBeNull();
   });

   it('deleteSession — deletes session by token', async () => {
      const user = await adapter.createUser(sampleUser);
      const token = nanoid();
      await adapter.createSession({
         userId: user.id,
         token,
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
         ipAddress: null,
         userAgent: null,
      });
      await adapter.deleteSession(token);
      const found = await adapter.findSessionByToken(token);
      expect(found).toBeNull();
   });

   it('deleteUserSessions — deletes all sessions for a user', async () => {
      const user = await adapter.createUser(sampleUser);
      await adapter.createSession({
         userId: user.id,
         token: nanoid(),
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
         ipAddress: null,
         userAgent: null,
      });
      await adapter.createSession({
         userId: user.id,
         token: nanoid(),
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
         ipAddress: null,
         userAgent: null,
      });
      await adapter.deleteUserSessions(user.id);
      const found = await adapter.findSessionByToken('any-token');
      expect(found).toBeNull();
   });
});

describe('account operations', () => {
   it('createAccount — creates an account and returns it', async () => {
      const user = await adapter.createUser(sampleUser);
      const account = await adapter.createAccount({
         userId: user.id,
         accountId: user.id,
         providerId: 'credential',
         accessToken: null,
         refreshToken: null,
         accessTokenExpiresAt: null,
         refreshTokenExpiresAt: null,
         scope: null,
         idToken: null,
         password: 'hashed_password',
      });
      expect(account.id).toBeDefined();
      expect(account.userId).toBe(user.id);
      expect(account.providerId).toBe('credential');
   });

   it('findAccountByUserId — returns account by userId and providerId', async () => {
      const user = await adapter.createUser(sampleUser);
      await adapter.createAccount({
         userId: user.id,
         accountId: user.id,
         providerId: 'credential',
         accessToken: null,
         refreshToken: null,
         accessTokenExpiresAt: null,
         refreshTokenExpiresAt: null,
         scope: null,
         idToken: null,
         password: 'hashed_password',
      });
      const found = await adapter.findAccountByUserId(user.id, 'credential');
      expect(found).not.toBeNull();
      expect(found?.userId).toBe(user.id);
      expect(found?.providerId).toBe('credential');
   });
});

describe('verification operations', () => {
   it('createVerification — creates a verification and returns it', async () => {
      const verification = await adapter.createVerification({
         identifier: 'john@example.com',
         value: nanoid(),
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      expect(verification.id).toBeDefined();
      expect(verification.identifier).toBe('john@example.com');
   });

   it('findVerificationByToken — returns verification by token', async () => {
      const token = nanoid();
      await adapter.createVerification({
         identifier: 'john@example.com',
         value: token,
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      const found = await adapter.findVerificationByToken(token);
      expect(found).not.toBeNull();
      expect(found?.value).toBe(token);
   });

   it('findVerificationByToken — returns null when token does not exist', async () => {
      const found = await adapter.findVerificationByToken('nonexistent');
      expect(found).toBeNull();
   });

   it('deleteVerification — deletes verification by id', async () => {
      const verification = await adapter.createVerification({
         identifier: 'john@example.com',
         value: nanoid(),
         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      await adapter.deleteVerification(verification.id);
      const found = await adapter.findVerificationByToken(verification.value);
      expect(found).toBeNull();
   });
});
