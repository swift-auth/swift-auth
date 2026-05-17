import auth from '../../src/lib/auth';
import { describe, it, expect } from 'vitest';
const BASE_URL = auth.config.baseUrl;

let verificationToken = '';

describe('email signUp', () => {
   describe('validations', () => {
      it('should send 400 if email is missing', async () => {
         const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
               name: 'dipan',
               password: 'testPassword',
            }),
         });
         expect(res.status).toBe(400);
      });

      it('should send 400 if password length is below minimum', async () => {
         const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
               email: 'test@gmail.com',
               name: 'dipan',
               password: 'pass', //minimum is 8
            }),
         });
         expect(res.status).toBe(400);
      });
   });

   describe('account creation', () => {
      it('user account should be created and verification mail sent', async () => {
         const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
               email: 'test@gmail.com',
               name: 'test',
               password: 'testUserPassword',
               returnVerificationToken: true,
            }),
         });

         const data = await res.json();
         verificationToken = data?.verificationToken as string;
         expect(data?.code).toBe('VERIFICATION_SENT');
         expect(data.user.name).toBe('test');
         expect(data.user.email).toBe('test@gmail.com');
         expect(res.status).toBe(201);
      });

      it('verification should be error when wrong token is passed', async () => {
         const res = await fetch(`${BASE_URL}/api/auth/verify-email?token=0000`);
         const data = await res.json();

         expect(data.code).toBe('INVALID_TOKEN');
         expect(res.status).toBe(400);
      });

      it('for correct token verification should be success and sesion created', async () => {
         const res = await fetch(`${BASE_URL}/api/auth/verify-email?token=${verificationToken}`);
         const data = await res.json();

         expect(data.code).toBe('EMAIL_VERIFIED');
         expect(res.status).toBe(200);
         expect(data.session).toBeDefined();
      });
   });
});

describe('email signin', () => {
   it('should return 400 when email is not provided', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/signin`, {
         headers: { 'Content-Type': 'application/json' },
         method: 'POST',
         body: JSON.stringify({
            password: 'testUserPassword',
         }),
      });
      expect(res.status).toBe(400);
   });

   it('should return 400 if password is below minimum length', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/signin`, {
         headers: { 'Content-Type': 'application/json' },
         method: 'POST',
         body: JSON.stringify({
            email: 'test@gmail.com',
            password: 'aa',
         }),
      });
      expect(res.status).toBe(400);
   });
});
