import * as z from 'zod';
import { DatabaseAdapter } from '../types/adapter.js';
import { SocialProvidersConfig } from '../types/config.js';

const emailAndPasswordSchema = z.object({
   enabled: z.boolean(),
   autoSignIn: z.boolean().default(true),
   verifyEmail: z.boolean().default(false),
   minPasswordLength: z.number().default(8),
   verificationTokenExpiry: z.number().default(1000 * 60 * 60),
});

const cookieSchema = z.object({
   name: z.string().default('swift_auth_session_token'),
   secure: z.boolean().default(true),
   domain: z.string().optional(),
   sameSite: z.enum(['lax', 'strict', 'none']).default('lax'),
});

export const SwiftAuthConfigSchema = z.object({
   session: z
      .object({
         expiry: z.number().positive(),
      })
      .default({
         expiry: 1000 * 60 * 60 * 24,
      }),
   baseUrl: z.url(),
   emailAndPassword: emailAndPasswordSchema.optional(),
   cookies: cookieSchema.optional(),
});

export type ParsedSwiftAuthConfig = Omit<z.infer<typeof SwiftAuthConfigSchema>, 'cookies'> & {
   database: DatabaseAdapter;
   socialProviders?: SocialProvidersConfig;
   // override cookies as required — constructor always sets all fields
   cookies: {
      name: string;
      secure: boolean;
      domain: string;
      sameSite: 'lax' | 'strict' | 'none';
   };
   session: {
      expiry: number;
   };
   emailAndPassword?: z.infer<typeof emailAndPasswordSchema> & {
      verificationCallback?: (user: {
         name: string;
         email: string;
         verificationToken: string;
      }) => Promise<void>;
      forgotPasswordCallback?: (user: {
         name: string;
         email: string;
         resetToken: string;
      }) => Promise<void>;
   };
};
