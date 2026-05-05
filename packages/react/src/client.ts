import type {
   Config,
   EmailSignInResponse,
   EmailSignUpResponse,
   ForgotPasswordResponse,
   ResetPasswordResponse,
   SessionResponse,
   SignOutResponse,
   SwiftAuthClientApi,
   VerifyEmailResponse,
} from './types/client.js';

export function SwiftAuthClient(config: Config): SwiftAuthClientApi {
   //base url should not have not have the default auth api path so, we will be adding it
   config.baseUrl = config.baseUrl.endsWith('/')
      ? `${config.baseUrl}api/auth`
      : `${config.baseUrl}/api/auth`;

   return {
      async emailSignUp(data) {
         const res = await fetch(`${config.baseUrl}/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         });

         const result = (await res.json()) as EmailSignUpResponse;

         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },

      async emailSignIn(data) {
         const res = await fetch(`${config.baseUrl}/signin`, {
            method: 'POST',
            credentials: 'include',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         });

         const result = (await res.json()) as EmailSignInResponse;

         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },

      async verifyEmail(token: string) {
         const res = await fetch(`${config.baseUrl}/verify-email?token=${token}`, {
            method: 'GET',
            credentials: 'include',
         });

         const result = (await res.json()) as VerifyEmailResponse;
         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },

      async forgotPassword(email: string) {
         const res = await fetch(`${config.baseUrl}/forgot-password`, {
            method: 'POST',
            credentials: 'include',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
         });

         const result = (await res.json()) as ForgotPasswordResponse;

         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },

      async resetPassword(token: string, newPassword: string) {
         const res = await fetch(`${config.baseUrl}/reset-password`, {
            method: 'POST',
            credentials: 'include',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword }),
         });

         const result = (await res.json()) as ResetPasswordResponse;

         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },

      async getSession() {
         const res = await fetch(`${config.baseUrl}/session`, {
            method: 'GET',
            credentials: 'include',
         });

         const result = (await res.json()) as SessionResponse;

         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },

      async signOut() {
         const res = await fetch(`${config.baseUrl}/signout`, {
            method: 'POST',
            credentials: 'include',
         });

         const result = (await res.json()) as SignOutResponse;
         if (!res.ok) {
            throw new SwiftAuthClientError(result.code, result.message);
         }

         return result;
      },
      googleSignIn() {
         window.location.href = `${config.baseUrl}/google/signin`;
      },

      githubSignIn() {
         window.location.href = `${config.baseUrl}/github/signin`;
      },
   };
}

class SwiftAuthClientError extends Error {
   code: string;
   constructor(code: string, message: string) {
      super(message);
      this.code = code;
   }
}
