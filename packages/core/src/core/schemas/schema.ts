import { ParsedAuthioConfig } from '../../types/config.js';
import { z } from 'zod';

export function createSchemas(ctx: ParsedAuthioConfig) {
   return {
      emailSignUp: z.object({
         name: z.string().min(1, 'Name is required'),
         email: z.email('invalid email'),
         password: z
            .string()
            .min(
               ctx?.emailAndPassword?.minPasswordLength || 8,
               `password is below minimul length: ${ctx.emailAndPassword?.minPasswordLength}`,
            ),
         returnVerificationToken: z.boolean().optional(),
      }),

      emailSignIn: z.object({
         email: z.email('Invalid email'),
         password: z
            .string()
            .min(
               ctx?.emailAndPassword?.minPasswordLength || 8,
               `password is below minimul length: ${ctx.emailAndPassword?.minPasswordLength}`,
            ),
      }),

      verifyEmail: z.object({
         token: z.string().min(1, 'Invalid token Provided'),
      }),
      forgotPassword: z.object({
         email: z.email('Invalid email'),
         returnForgotPasswordToken: z.boolean().optional(),
      }),
      resetPassword: z.object({
         token: z.string().min(1, 'Invalid token'),
         newPassword: z
            .string()
            .min(
               ctx.emailAndPassword?.minPasswordLength || 8,
               `password is below minimul length: ${ctx.emailAndPassword?.minPasswordLength}`,
            ),
      }),
      getSession: z.object({
         token: z.string().min(1, 'Invalid Token'),
      }),
      signout: z.object({
         token: z.string().min(1, 'Invalid Token'),
      }),

      OauthRedirectUrl: z.object({
         id: z.enum(['google', 'github']),
      }),

      OauthCallback: z.object({
         id: z.enum(['google', 'github']),
         code: z.string().min(1, 'Invalid Oauth code'),
         meta: z.object({ userAgent: z.string().optional(), ipAddress: z.string().optional() }),
      }),
   };
}
