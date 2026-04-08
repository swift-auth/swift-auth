import type { OAuthProvider } from '../providers/types.js';
import type { DatabaseAdapter } from './adapter.js';

interface EmailAndPasswordConfig {
   enabled: boolean;
   autoSignIn?: boolean;
   verifyEmail?: boolean;
   minPasswordLength?: number;
}

export interface SocialProvidersConfig {
   google?: OAuthProvider;
   github?: OAuthProvider;
}

export interface SwiftAuthConfig {
   baseUrl: string;
   emailAndPassword?: EmailAndPasswordConfig;
   database: DatabaseAdapter;
   socialProviders?: SocialProvidersConfig;
}
