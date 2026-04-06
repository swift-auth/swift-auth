import * as z from 'zod';
import { DatabaseAdapter } from '../types/adapter.js';

import { SocialProvidersConfig } from '../types/config.js';

const emailAndPasswordSchema = z.object({
   enabled: z.boolean(),
   autoSignIn: z.boolean().default(true),
   verifyEmail: z.boolean().default(false),
   minPasswordLength: z.number().default(8),
});

export const SwiftAuthConfigSchema = z.object({
   baseUrl: z.url(),
   emailAndPassword: emailAndPasswordSchema.optional(),
});

export type ParsedSwiftAuthConfig = z.infer<typeof SwiftAuthConfigSchema> & {
   database: DatabaseAdapter;
   socialProviders?: SocialProvidersConfig;
};
