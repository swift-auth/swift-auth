# @authio/core

The core authentication engine for Authio. Handles email/password auth, social OAuth, session management, and email verification. Framework and database agnostic — works with any adapter.

## Installation

```bash
pnpm add @authio/core
```

You'll also need a database adapter and a framework handler:

```bash
pnpm add @authio/drizzle @authio/node
```

## Basic Setup

```ts
import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import { db } from './db/index.js';

export const auth = new Authio({
   baseUrl: 'http://localhost:8000',
   emailAndPassword: {
      enabled: true,
   },
   database: drizzleAdapter({ db, provider: 'postgres' }),
});
```

## Configuration

```ts
new Authio({
   // required
   baseUrl: 'http://localhost:8000',
   database: drizzleAdapter({ db, provider: 'postgres' }),

   // email and password
   emailAndPassword: {
      enabled: true,
      autoSignIn: true, // default: true — creates session after signup
      verifyEmail: false, // default: false
      minPasswordLength: 8, // default: 8
      verificationTokenExpiry: 3600000, // default: 1 hour in ms
      verificationCallback: async ({ name, email, verificationToken }) => {
         // send your verification email here
      },
      forgotPasswordCallback: async ({ name, email, resetToken }) => {
         // send your reset email here
      },
   },

   // social providers
   socialProviders: {
      google: googleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         redirectUrl: 'http://localhost:8000/api/auth/google/callback',
      }),
      github: gitHubProvider({
         clientId: process.env.GITHUB_CLIENT_ID,
         clientSecret: process.env.GITHUB_CLIENT_SECRET,
         redirectUrl: 'http://localhost:8000/api/auth/github/callback',
      }),
   },

   // session
   session: {
      expiry: 1000 * 60 * 60 * 24, // default: 1 day in ms
   },

   // cookies
   cookies: {
      name: 'authio_session_token', // default
      secure: true, // default: true
      sameSite: 'lax', // default: 'lax'
      domain: 'localhost', // default: baseUrl hostname
   },
});
```

## Methods

### Email and Password

```ts
// sign up
await auth.emailSignUp(name, email, password, { userAgent, ipAddress });

// sign in
await auth.emailSignIn(email, password, { userAgent, ipAddress });

// verify email
await auth.verifyEmail(token);

// forgot password — sends reset token via forgotPasswordCallback
await auth.forgotPassword(email);

// reset password — invalidates all existing sessions
await auth.resetPassword(token, newPassword);
```

### Session

```ts
// get session and user from token
await auth.getSession(token);

// sign out — deletes session
await auth.signOut(token);
```

### Social OAuth

```ts
// get the redirect URL and CSRF state
await auth.getSocialAuthRedirectUrl('google');
await auth.getSocialAuthRedirectUrl('github');

// handle the OAuth callback
await auth.oauthCallback('google', code, { userAgent, ipAddress });
await auth.oauthCallback('github', code, { userAgent, ipAddress });
```

### User

```ts
// delete user and all their sessions
await auth.deleteUser(userId);
```

## Response Codes

| Method           | Code                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `emailSignUp`    | `VERIFICATION_SENT`, `SIGNUP_SUCCESS_AND_AUTO_SIGNIN`, `SIGNUP_SUCCESS` |
| `emailSignIn`    | `SIGNIN_SUCCESS`                                                        |
| `verifyEmail`    | `EMAIL_VERIFIED`                                                        |
| `forgotPassword` | `RESET_EMAIL_SENT`                                                      |
| `resetPassword`  | `PASSWORD_RESET_SUCCESS`                                                |
| `getSession`     | `SESSION_FOUND`                                                         |
| `signOut`        | `SIGNOUT_SUCCESS`                                                       |
| `oauthCallback`  | `OAUTH_SUCCESS`                                                         |
| `deleteUser`     | `USER_DELETED`                                                          |

## Error Handling

All methods throw `AuthioError` on failure. Each error has a `code` and a `message`:

```ts
import { AuthioError } from '@authio/core';

try {
   await auth.emailSignIn(email, password);
} catch (err) {
   if (err instanceof AuthioError) {
      console.log(err.code); // e.g. 'INVALID_CREDENTIALS'
      console.log(err.message); // e.g. 'Invalid email or password'
   }
}
```

Common error codes: `MISSING_FIELDS`, `USER_ALREADY_EXISTS`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `SESSION_NOT_FOUND`, `SESSION_EXPIRED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `USER_NOT_FOUND`, `PROVIDER_NOT_CONFIGURED`.

## Implementing a Database Adapter

If you want to use a database not covered by the official adapters, implement the `DatabaseAdapter` interface:

```ts
import type { DatabaseAdapter } from '@authio/core';

const myAdapter: DatabaseAdapter = {
  id: 'my-adapter',
  provider: 'postgres',
  createUser: async (user) => { ... },
  findUserById: async (id) => { ... },
  findUserByEmail: async (email) => { ... },
  updateUser: async (id, data) => { ... },
  deleteUser: async (id) => { ... },
  createSession: async (session) => { ... },
  findSessionByToken: async (token) => { ... },
  deleteSession: async (token) => { ... },
  deleteUserSessions: async (userId) => { ... },
  createAccount: async (account) => { ... },
  updateAccount: async (id, data) => { ... },
  findAccountByUserId: async (userId, providerId) => { ... },
  createVerification: async (verification) => { ... },
  findVerificationByToken: async (token) => { ... },
  deleteVerification: async (id) => { ... },
};
```

## License

MIT
