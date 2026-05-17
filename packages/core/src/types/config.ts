import type { OAuthProvider } from '../types/provider.types.ts';
import type { DatabaseAdapter } from './adapter.js';

interface EmailAndPasswordConfig {
   enabled: boolean;
   autoSignIn?: boolean;
   verifyEmail?: boolean;
   minPasswordLength?: number;
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
   verificationTokenExpiry?: number;
}

export interface SocialProvidersConfig {
   google?: OAuthProvider;
   github?: OAuthProvider;
}

export interface SessionConfig {
   expiry?: number;
}

export interface CookieConfig {
   name?: string;
   secure?: boolean;
   sameSite?: 'lax' | 'strict' | 'none';
   path?: string;
   domain?: string;
}

interface Internal {
   logError?: boolean;
}

export interface AuthioConfig {
   baseUrl: string;
   session?: SessionConfig;
   emailAndPassword?: EmailAndPasswordConfig;
   database: DatabaseAdapter;
   socialProviders?: SocialProvidersConfig;
   cookies?: CookieConfig;
   internal?: Internal;
}

export type ParsedAuthioConfig = {
   baseUrl: string;
   database: DatabaseAdapter;
   socialProviders?: SocialProvidersConfig;
   session: {
      expiry: number;
   };
   cookies: {
      name: string;
      secure: boolean;
      domain: string;
      sameSite: 'lax' | 'strict' | 'none';
   };
   emailAndPassword?: {
      enabled: boolean;
      autoSignIn: boolean;
      verifyEmail: boolean;
      minPasswordLength: number;
      verificationTokenExpiry: number;
      verificationCallback?: (payload: {
         name: string;
         email: string;
         verificationToken: string;
      }) => Promise<void>;
      forgotPasswordCallback?: (payload: {
         name: string;
         email: string;
         resetToken: string;
      }) => Promise<void>;
   };

   internal: {
      logError: boolean;
      oauth: {
         supportedOauthProviders: string[];
         oauthStateCookie: {
            name: string;
         };
      };
   };
};
