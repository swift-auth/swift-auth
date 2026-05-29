import auth from '../../src/lib/auth';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupNodeServer } from '../../src/setupServer.js';

let BASE_URL: string;
let COOKIE_NAME: string;

// shared state
let verificationToken = '';
let sessionToken = '';
let forgotPasswordToken = '';
const server = setupNodeServer({
   provider: 'postgres',
   database: 'prisma',
});
beforeAll(async () => {
   await server.spinUp();
   BASE_URL = auth.config.baseUrl;
   COOKIE_NAME = auth.config.cookies.name;
});

afterAll(async () => {
   await server.tearDown();
});

// ─── helpers ───────────────────────────────────────────────────────────────
async function post(path: string, body: Record<string, unknown>) {
   return fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
   });
}

async function get(path: string, cookie?: string) {
   return fetch(`${BASE_URL}${path}`, {
      headers: cookie ? { Cookie: `${COOKIE_NAME}=${cookie}` } : {},
   });
}

async function del(path: string, cookie?: string) {
   return fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: cookie ? { Cookie: `${COOKIE_NAME}=${cookie}` } : {},
   });
}

// ─── signup ────────────────────────────────────────────────────────────────
// verifyEmail: true, autoSignIn: false
// expected flow: signup → VERIFICATION_SENT, session: null
describe('email signUp', () => {
   describe('validations', () => {
      it('should return 400 if email is missing', async () => {
         const res = await post('/api/auth/signup', {
            name: 'dipan',
            password: 'testPassword',
         });
         expect(res.status).toBe(400);
      });

      it('should return 400 if name is missing', async () => {
         const res = await post('/api/auth/signup', {
            email: 'test@gmail.com',
            password: 'testPassword',
         });
         expect(res.status).toBe(400);
      });

      it('should return 400 if password is below minimum length', async () => {
         const res = await post('/api/auth/signup', {
            email: 'test@gmail.com',
            name: 'dipan',
            password: 'pass',
         });
         expect(res.status).toBe(400);
      });

      it('should return 400 if email format is invalid', async () => {
         const res = await post('/api/auth/signup', {
            email: 'not-an-email',
            name: 'dipan',
            password: 'testPassword',
         });
         expect(res.status).toBe(400);
      });
   });

   describe('account creation', () => {
      it('should create user and send verification email', async () => {
         const res = await post('/api/auth/signup', {
            email: 'test@gmail.com',
            name: 'test',
            password: 'testUserPassword',
            returnVerificationToken: true,
         });
         const data = await res.json();
         verificationToken = data?.verificationToken;

         expect(res.status).toBe(201);
         expect(data.code).toBe('VERIFICATION_SENT');
         expect(data.user.email).toBe('test@gmail.com');
         expect(data.user.name).toBe('test');
         expect(data.user.emailVerified).toBe(false);
         expect(data.session).toBeNull(); // autoSignIn: false
         expect(data.user.password).toBeUndefined(); // never expose password
         expect(verificationToken).toBeDefined();
      });

      // verifyEmail: true means unverified user row gets deleted and recreated
      // so second signup with same email before verification should succeed with VERIFICATION_SENT
      it('should allow re-signup if email is not yet verified', async () => {
         const res = await post('/api/auth/signup', {
            email: 'test@gmail.com',
            name: 'test',
            password: 'testUserPassword',
            returnVerificationToken: true,
         });
         const data = await res.json();
         verificationToken = data?.verificationToken; // update token — old one is now deleted

         expect(res.status).toBe(201);
         expect(data.code).toBe('VERIFICATION_SENT');
      });
   });
});

// ─── verify email ──────────────────────────────────────────────────────────
// autoSignIn: false so EMAIL_VERIFIED returns session: null
describe('verify email', () => {
   it('should return 400 if token is missing', async () => {
      const res = await get('/api/auth/verify-email');
      expect(res.status).toBe(400);
   });

   it('should return 400 if token is invalid', async () => {
      const res = await get('/api/auth/verify-email?token=invalidtoken000');
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('INVALID_TOKEN');
   });

   it('should verify email successfully', async () => {
      const res = await get(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.code).toBe('EMAIL_VERIFIED');
      expect(data.user.emailVerified).toBe(true);
      expect(data.session).toBeNull(); // autoSignIn: false
   });

   it('should return 400 if same token is used again', async () => {
      const res = await get(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('INVALID_TOKEN');
   });

   it('should return 400 if user tries to signup again after verification', async () => {
      const res = await post('/api/auth/signup', {
         email: 'test@gmail.com',
         name: 'test',
         password: 'testUserPassword',
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('USER_ALREADY_EXISTS');
   });
});

// ─── signin ────────────────────────────────────────────────────────────────
describe('email signIn', () => {
   describe('validations', () => {
      it('should return 400 if email is missing', async () => {
         const res = await post('/api/auth/signin', {
            password: 'testUserPassword',
         });
         expect(res.status).toBe(400);
      });

      it('should return 400 if password is missing', async () => {
         const res = await post('/api/auth/signin', {
            email: 'test@gmail.com',
         });
         expect(res.status).toBe(400);
      });

      it('should return 400 if password is below minimum length', async () => {
         const res = await post('/api/auth/signin', {
            email: 'test@gmail.com',
            password: 'aa',
         });
         expect(res.status).toBe(400);
      });
   });

   describe('authentication', () => {
      it('should return 400 for wrong password', async () => {
         const res = await post('/api/auth/signin', {
            email: 'test@gmail.com',
            password: 'wrongPassword',
         });
         const data = await res.json();

         expect(res.status).toBe(400);
         expect(data.code).toBe('INVALID_CREDENTIALS');
      });

      it('should return 400 for non-existent email', async () => {
         const res = await post('/api/auth/signin', {
            email: 'nobody@gmail.com',
            password: 'testUserPassword',
         });
         const data = await res.json();

         expect(res.status).toBe(400);
         expect(data.code).toBe('INVALID_CREDENTIALS');
      });

      it('should signin and return session', async () => {
         const res = await post('/api/auth/signin', {
            email: 'test@gmail.com',
            password: 'testUserPassword',
         });
         const data = await res.json();
         sessionToken = data?.session?.token;

         expect(res.status).toBe(200);
         expect(data.code).toBe('SIGNIN_SUCCESS');
         expect(data.session).toBeDefined();
         expect(data.session.token).toBeDefined();
         expect(data.user.email).toBe('test@gmail.com');
         expect(data.user.password).toBeUndefined();
      });
   });
});

// ─── session ───────────────────────────────────────────────────────────────
describe('session', () => {
   it('should return 401 if no cookie is passed', async () => {
      const res = await get('/api/auth/session');
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.code).toBe('NO_SESSION');
   });

   it('should return 400 for invalid token', async () => {
      const res = await get('/api/auth/session', 'wrongToken');
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('SESSION_NOT_FOUND');
   });

   it('should return session and user for valid token', async () => {
      const res = await get('/api/auth/session', sessionToken);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.code).toBe('SESSION_FOUND');
      expect(data.session).toBeDefined();
      expect(data.user.email).toBe('test@gmail.com');
      expect(data.user.password).toBeUndefined();
   });
});

// ─── forgot password ───────────────────────────────────────────────────────
describe('forgot password', () => {
   it('should return 400 if email is missing', async () => {
      const res = await post('/api/auth/forgot-password', {});
      expect(res.status).toBe(400);
   });

   it('should return 200 even for non-existent email (prevent enumeration)', async () => {
      const res = await post('/api/auth/forgot-password', {
         email: 'nobody@gmail.com',
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.code).toBe('RESET_EMAIL_SENT');
      expect(data.forgotPasswordToken).toBeUndefined(); // no token for non-existent user
   });

   it('should send reset token for existing user', async () => {
      const res = await post('/api/auth/forgot-password', {
         email: 'test@gmail.com',
         returnForgotPasswordToken: true,
      });
      const data = await res.json();
      forgotPasswordToken = data?.forgotPasswordToken;

      expect(res.status).toBe(200);
      expect(data.code).toBe('RESET_EMAIL_SENT');
      expect(forgotPasswordToken).toBeDefined();
   });
});

// ─── reset password ────────────────────────────────────────────────────────
describe('reset password', () => {
   it('should return 400 if token is missing', async () => {
      const res = await post('/api/auth/reset-password', {
         newPassword: 'newPassword123',
      });
      expect(res.status).toBe(400);
   });

   it('should return 400 if newPassword is missing', async () => {
      const res = await post('/api/auth/reset-password', {
         token: forgotPasswordToken,
      });
      expect(res.status).toBe(400);
   });

   it('should return 400 for invalid token', async () => {
      const res = await post('/api/auth/reset-password', {
         token: 'invalidtoken000',
         newPassword: 'newPassword123',
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('INVALID_TOKEN');
   });

   it('should reset password successfully', async () => {
      const res = await post('/api/auth/reset-password', {
         token: forgotPasswordToken,
         newPassword: 'newPassword123',
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.code).toBe('PASSWORD_RESET_SUCCESS');
   });

   it('old session should be invalid after password reset', async () => {
      const res = await get('/api/auth/session', sessionToken);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('SESSION_NOT_FOUND');
   });

   it('should not signin with old password', async () => {
      const res = await post('/api/auth/signin', {
         email: 'test@gmail.com',
         password: 'testUserPassword',
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('INVALID_CREDENTIALS');
   });

   it('should signin with new password', async () => {
      const res = await post('/api/auth/signin', {
         email: 'test@gmail.com',
         password: 'newPassword123',
      });
      const data = await res.json();
      sessionToken = data?.session?.token;

      expect(res.status).toBe(200);
      expect(data.code).toBe('SIGNIN_SUCCESS');
      expect(sessionToken).toBeDefined();
   });
});

// ─── signout ───────────────────────────────────────────────────────────────
describe('signout', () => {
   it('should return 401 if no cookie is passed', async () => {
      const res = await post('/api/auth/signout', {});
      expect(res.status).toBe(401);
   });

   it('should signout successfully', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/signout`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Cookie: `${COOKIE_NAME}=${sessionToken}`,
         },
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.code).toBe('SIGNOUT_SUCCESS');
   });

   it('session should be invalid after signout', async () => {
      const res = await get('/api/auth/session', sessionToken);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('SESSION_NOT_FOUND');
   });
});

// ─── delete user ───────────────────────────────────────────────────────────
describe('delete user', () => {
   it('should return 401 if no cookie is passed', async () => {
      const res = await del('/api/auth/user');
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.code).toBe('NO_SESSION');
   });

   it('should delete user successfully', async () => {
      // get a fresh session first
      const signinRes = await post('/api/auth/signin', {
         email: 'test@gmail.com',
         password: 'newPassword123',
      });
      const signinData = await signinRes.json();
      const freshToken = signinData?.session?.token;

      const res = await del('/api/auth/user', freshToken);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.code).toBe('USER_DELETED');
   });

   it('should not be able to signin after deletion', async () => {
      const res = await post('/api/auth/signin', {
         email: 'test@gmail.com',
         password: 'newPassword123',
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.code).toBe('INVALID_CREDENTIALS');
   });
});
