import { describe, it, expect } from 'vitest';
import { nanoid } from 'nanoid';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaAdapter } from '../src/prisma-adapter.js';
import type { DatabaseAdapter } from '@authio/core';

const connectionString = 'postgresql://test_user:test_password@localhost:5433/test_db';
const ar = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter: ar });

const adapter: DatabaseAdapter = prismaAdapter({ db, provider: 'postgres' });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser() {
   const id = nanoid(8);
   return {
      email: `user_${id}@example.com`,
      name: `Test User ${id}`,
      emailVerified: false,
      image: null,
   };
}

function makeSession(userId: string) {
   return {
      userId,
      token: nanoid(32),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
   };
}

function makeAccount(userId: string) {
   return {
      userId,
      providerId: 'github',
      accountId: `gh_${nanoid(8)}`,
      accessToken: nanoid(40),
      refreshToken: nanoid(40),

      accessTokenExpiresAt: new Date(Date.now() + 1000 * 3600),

      refreshTokenExpiresAt: new Date(Date.now() + 1000 * 3600 * 24),

      scope: 'read:user',
   };
}

function makeVerification() {
   return {
      identifier: `verify_${nanoid(6)}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
   };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('prismaAdapter', () => {
   // ── User ────────────────────────────────────────────────────────────────

   describe('User operations', () => {
      it('createUser — returns a user with an id and timestamps', async () => {
         const input = makeUser();
         const user = await adapter.createUser(input);

         expect(user).toBeDefined();
         expect(user.id).toBeTypeOf('string');
         expect(user.email).toBe(input.email);
         expect(user.name).toBe(input.name);
         expect(user.createdAt).toBeInstanceOf(Date);
         expect(user.updatedAt).toBeInstanceOf(Date);
      });

      it('findUserById — returns the correct user', async () => {
         const created = await adapter.createUser(makeUser());
         const found = await adapter.findUserById(created.id);

         expect(found).not.toBeNull();
         expect(found!.id).toBe(created.id);
         expect(found!.email).toBe(created.email);
      });

      it('findUserById — returns null for unknown id', async () => {
         const found = await adapter.findUserById('non_existent_id_xyz');
         expect(found).toBeNull();
      });

      it('findUserByEmail — returns the correct user', async () => {
         const created = await adapter.createUser(makeUser());
         const found = await adapter.findUserByEmail(created.email);

         expect(found).not.toBeNull();
         expect(found!.id).toBe(created.id);
      });

      it('findUserByEmail — returns null for unknown email', async () => {
         const found = await adapter.findUserByEmail('nobody@nowhere.invalid');
         expect(found).toBeNull();
      });

      it('updateUser — persists changes and bumps updatedAt', async () => {
         const created = await adapter.createUser(makeUser());
         const originalUpdatedAt = created.updatedAt;

         await new Promise((r) => setTimeout(r, 10));

         const updated = await adapter.updateUser(created.id, {
            name: 'Updated Name',
            emailVerified: true,
         });

         expect(updated.name).toBe('Updated Name');
         expect(updated.emailVerified).toBe(true);
         expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      });

      it('updateUser — does not alter other fields', async () => {
         const created = await adapter.createUser(makeUser());
         const updated = await adapter.updateUser(created.id, { name: 'Only Name Changed' });

         expect(updated.email).toBe(created.email);
      });
   });

   // ── Session ──────────────────────────────────────────────────────────────

   describe('Session operations', () => {
      it('createSession — returns a session with id and timestamps', async () => {
         const user = await adapter.createUser(makeUser());
         const input = makeSession(user.id);
         const session = await adapter.createSession(input);

         expect(session.id).toBeTypeOf('string');
         expect(session.userId).toBe(user.id);
         expect(session.token).toBe(input.token);
         expect(session.createdAt).toBeInstanceOf(Date);
      });

      it('findSessionByToken — returns the correct session', async () => {
         const user = await adapter.createUser(makeUser());
         const created = await adapter.createSession(makeSession(user.id));
         const found = await adapter.findSessionByToken(created.token);

         expect(found).not.toBeNull();
         expect(found!.id).toBe(created.id);
      });

      it('findSessionByToken — returns null for unknown token', async () => {
         const found = await adapter.findSessionByToken('totally_unknown_token');
         expect(found).toBeNull();
      });

      it('deleteSession — removes only the targeted session', async () => {
         const user = await adapter.createUser(makeUser());
         const s1 = await adapter.createSession(makeSession(user.id));
         const s2 = await adapter.createSession(makeSession(user.id));

         await adapter.deleteSession(s1.token);

         expect(await adapter.findSessionByToken(s1.token)).toBeNull();
         expect(await adapter.findSessionByToken(s2.token)).not.toBeNull();
      });

      it('deleteUserSessions — removes all sessions for a user', async () => {
         const user = await adapter.createUser(makeUser());
         const s1 = await adapter.createSession(makeSession(user.id));
         const s2 = await adapter.createSession(makeSession(user.id));

         await adapter.deleteUserSessions(user.id);

         expect(await adapter.findSessionByToken(s1.token)).toBeNull();
         expect(await adapter.findSessionByToken(s2.token)).toBeNull();
      });

      it('deleteUserSessions — does not affect sessions of other users', async () => {
         const u1 = await adapter.createUser(makeUser());
         const u2 = await adapter.createUser(makeUser());
         const s1 = await adapter.createSession(makeSession(u1.id));
         const s2 = await adapter.createSession(makeSession(u2.id));

         await adapter.deleteUserSessions(u1.id);

         expect(await adapter.findSessionByToken(s1.token)).toBeNull();
         expect(await adapter.findSessionByToken(s2.token)).not.toBeNull();
      });
   });

   // ── Account ──────────────────────────────────────────────────────────────

   describe('Account operations', () => {
      it('createAccount — returns an account with id and timestamps', async () => {
         const user = await adapter.createUser(makeUser());
         const input = makeAccount(user.id);
         const account = await adapter.createAccount(input);

         expect(account.id).toBeTypeOf('string');
         expect(account.userId).toBe(user.id);
         expect(account.providerId).toBe('github');
         expect(account.createdAt).toBeInstanceOf(Date);
      });

      it('findAccountByUserId — returns the correct account', async () => {
         const user = await adapter.createUser(makeUser());
         const created = await adapter.createAccount(makeAccount(user.id));
         const found = await adapter.findAccountByUserId(user.id, 'github');

         expect(found).not.toBeNull();
         expect(found!.id).toBe(created.id);
      });

      it('findAccountByUserId — returns null when provider does not match', async () => {
         const user = await adapter.createUser(makeUser());
         await adapter.createAccount(makeAccount(user.id));

         const found = await adapter.findAccountByUserId(user.id, 'google');
         expect(found).toBeNull();
      });

      it('findAccountByUserId — returns null for unknown user', async () => {
         const found = await adapter.findAccountByUserId('ghost_user', 'github');
         expect(found).toBeNull();
      });

      it('updateAccount — persists changes and bumps updatedAt', async () => {
         const user = await adapter.createUser(makeUser());
         const created = await adapter.createAccount(makeAccount(user.id));

         await new Promise((r) => setTimeout(r, 10));
         const newToken = nanoid(40);
         const updated = await adapter.updateAccount(created.id, { accessToken: newToken });

         expect(updated.accessToken).toBe(newToken);
         expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
      });
   });

   // ── Verification ──────────────────────────────────────────────────────────

   describe('Verification operations', () => {
      it('createVerification — returns a verification with auto-generated value', async () => {
         const user = await adapter.createUser(makeUser());
         const input = makeVerification(user.id);
         const verification = await adapter.createVerification(input);

         expect(verification.id).toBeTypeOf('string');
         expect(verification.value).toBeTypeOf('string');
         expect(verification.value.length).toBeGreaterThan(0);
         expect(verification.createdAt).toBeInstanceOf(Date);
      });

      it('findVerificationByToken — returns the correct record', async () => {
         const user = await adapter.createUser(makeUser());
         const created = await adapter.createVerification(makeVerification(user.id));
         const found = await adapter.findVerificationByToken(created.value);

         expect(found).not.toBeNull();
         expect(found!.id).toBe(created.id);
      });

      it('findVerificationByToken — returns null for unknown token', async () => {
         const found = await adapter.findVerificationByToken('not_a_real_token');
         expect(found).toBeNull();
      });

      it('deleteVerification — removes the record', async () => {
         const user = await adapter.createUser(makeUser());
         const created = await adapter.createVerification(makeVerification(user.id));

         await adapter.deleteVerification(created.id);

         const found = await adapter.findVerificationByToken(created.value);
         expect(found).toBeNull();
      });

      it('deleteVerification — does not remove other verifications', async () => {
         const user = await adapter.createUser(makeUser());
         const v1 = await adapter.createVerification(makeVerification(user.id));
         const v2 = await adapter.createVerification(makeVerification(user.id));

         await adapter.deleteVerification(v1.id);

         expect(await adapter.findVerificationByToken(v2.value)).not.toBeNull();
      });
   });

   // ── Cross-entity integrity ────────────────────────────────────────────────

   describe('Cross-entity integrity', () => {
      it('full user lifecycle: create → session → account → verify → delete', async () => {
         const user = await adapter.createUser(makeUser());
         expect(user.id).toBeTruthy();

         const session = await adapter.createSession(makeSession(user.id));
         expect(await adapter.findSessionByToken(session.token)).not.toBeNull();

         const account = await adapter.createAccount(makeAccount(user.id));
         expect(await adapter.findAccountByUserId(user.id, 'github')).not.toBeNull();

         const verification = await adapter.createVerification(makeVerification(user.id));
         expect(await adapter.findVerificationByToken(verification.value)).not.toBeNull();

         const updatedUser = await adapter.updateUser(user.id, { emailVerified: true });
         expect(updatedUser.emailVerified).toBe(true);

         await adapter.deleteVerification(verification.id);
         expect(await adapter.findVerificationByToken(verification.value)).toBeNull();

         await adapter.deleteSession(session.token);
         expect(await adapter.findSessionByToken(session.token)).toBeNull();

         void account;
      });

      it('two users do not share sessions or accounts', async () => {
         const u1 = await adapter.createUser(makeUser());
         const u2 = await adapter.createUser(makeUser());

         const s1 = await adapter.createSession(makeSession(u1.id));
         const s2 = await adapter.createSession(makeSession(u2.id));
         await adapter.createAccount({ ...makeAccount(u1.id), providerId: 'github' });
         await adapter.createAccount({ ...makeAccount(u2.id), providerId: 'github' });

         await adapter.deleteSession(s1.token);
         expect(await adapter.findSessionByToken(s2.token)).not.toBeNull();

         expect((await adapter.findAccountByUserId(u1.id, 'github'))!.userId).toBe(u1.id);
         expect((await adapter.findAccountByUserId(u2.id, 'github'))!.userId).toBe(u2.id);
      });
   });
});
