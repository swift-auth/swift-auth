import * as t from 'drizzle-orm/mysql-core';

export const userTable = t.mysqlTable('user', {
   id: t.varchar('id', { length: 255 }).primaryKey(),
   name: t.text('name').notNull(),
   email: t.varchar('email', { length: 255 }).notNull().unique(),
   emailVerified: t.boolean('email_verified').notNull().default(false),
   image: t.text('image'),
   createdAt: t.timestamp('created_at', { fsp: 6 }).notNull(),
   updatedAt: t.timestamp('updated_at', { fsp: 6 }).notNull(),
});

export const accountTable = t.mysqlTable('account', {
   id: t.varchar('id', { length: 255 }).primaryKey(),
   userId: t
      .varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
   accountId: t.varchar('account_id', { length: 255 }).notNull(),
   providerId: t.varchar('provider_id', { length: 255 }).notNull(),
   accessToken: t.text('access_token'),
   refreshToken: t.text('refresh_token'),
   accessTokenExpiresAt: t.timestamp('access_token_expires_at', { fsp: 6 }),
   refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at', { fsp: 6 }),
   scope: t.text('scope'),
   idToken: t.text('id_token'),
   password: t.text('password'),
   createdAt: t.timestamp('created_at', { fsp: 6 }).notNull(),
   updatedAt: t.timestamp('updated_at', { fsp: 6 }).notNull(),
});

export const verificationTable = t.mysqlTable('verification', {
   id: t.varchar('id', { length: 255 }).primaryKey(),
   identifier: t.varchar('identifier', { length: 255 }).notNull(),
   value: t.text('value').notNull(),
   expiresAt: t.timestamp('expires_at', { fsp: 6 }).notNull(),
   createdAt: t.timestamp('created_at', { fsp: 6 }).notNull(),
   updatedAt: t.timestamp('updated_at', { fsp: 6 }).notNull(),
});

export const sessionTable = t.mysqlTable('session', {
   id: t.varchar('id', { length: 255 }).primaryKey(),
   userId: t
      .varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
   token: t.varchar('token', { length: 255 }).notNull().unique(),
   expiresAt: t.timestamp('expires_at', { fsp: 6 }).notNull(),
   ipAddress: t.varchar('ip_address', { length: 255 }),
   userAgent: t.text('user_agent'),
   createdAt: t.timestamp('created_at', { fsp: 6 }).notNull(),
   updatedAt: t.timestamp('updated_at', { fsp: 6 }).notNull(),
});
