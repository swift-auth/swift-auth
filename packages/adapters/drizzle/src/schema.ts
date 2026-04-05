import * as t from 'drizzle-orm/pg-core';

export const userTable = t.pgTable('user', {
   id: t.text('id').primaryKey(),
   name: t.text('name').notNull(),
   email: t.text().notNull().unique(),
   emailVerified: t.boolean('email_verified').notNull().default(false),
   image: t.text('image'),
   createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
   updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull(),
});

export const accountTable = t.pgTable('account', {
   id: t.text('id').primaryKey(),
   userId: t
      .text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
   accountId: t.text('account_id').notNull(),
   providerId: t.text('provider_id').notNull(),
   accessToken: t.text('access_token'),
   refreshToken: t.text('refresh_token'),
   accessTokenExpiresAt: t.timestamp('access_token_expires_at', {
      precision: 6,
      withTimezone: true,
   }),
   refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at', {
      precision: 6,
      withTimezone: true,
   }),
   scope: t.text('scope'),
   idToken: t.text('id_token'),
   password: t.text('password'),
   createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
   updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull(),
});

export const verificationTable = t.pgTable('verification', {
   id: t.text('id').primaryKey(),
   identifier: t.text('identifier').notNull(),
   value: t.text('value').notNull(),
   expiresAt: t.timestamp('expires_at', { precision: 6, withTimezone: true }).notNull(),
   createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
   updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull(),
});

export const sessionTable = t.pgTable('session', {
   id: t.text('id').primaryKey(),
   userId: t
      .text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
   token: t.text().notNull().unique(),
   expiresAt: t.timestamp('expires_at', { precision: 6, withTimezone: true }).notNull(),
   ipAddress: t.text('ip_address'),
   userAgent: t.text('user_agent'),
   createdAt: t.timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
   updatedAt: t.timestamp('updated_at', { precision: 6, withTimezone: true }).notNull(),
});
