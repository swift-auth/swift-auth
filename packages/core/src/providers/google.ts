import type { OAuthProvider, OAuthTokens, OAuthUser } from './types.js';
import * as z from 'zod';
import { SwiftAuthError } from '../core/SwiftError.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleConfig {
   clientId: string;
   clientSecret: string;
   redirectUrl: string;
   scopes?: string[];
   prompt?: 'consent' | 'select_account' | 'none' | 'login';
   accessType?: 'online' | 'offline';
}

export const googleConfigSchema = z.object({
   clientId: z.string(),
   clientSecret: z.string(),
   redirectUrl: z.string(),
   scopes: z.array(z.string()).default(['openid', 'email', 'profile']),
   prompt: z.enum(['consent', 'select_account', 'none', 'login']).default('consent'),
   accessType: z.enum(['online', 'offline']).default('offline'),
});

interface GoogleTokenResponse {
   access_token: string;
   refresh_token?: string;
   id_token: string;
   expires_in: number;
   token_type: string;
   scope: string;
}

interface GoogleIdTokenPayload {
   sub: string;
   email: string;
   email_verified: boolean;
   name: string;
   picture: string;
}

export function googleProvider(config: GoogleConfig): OAuthProvider {
   const parsed = googleConfigSchema.parse(config);
   return {
      id: 'google',
      getAuthUrl(state: string, redirectUri: string): string {
         const params = new URLSearchParams({
            client_id: parsed.clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: parsed.scopes.join(' '),
            state,
            access_type: parsed.accessType,
            prompt: parsed.prompt,
         });
         return `${GOOGLE_AUTH_URL}?${params.toString()}`;
      },
      async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens> {
         const response = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
               code,
               client_id: parsed.clientId,
               client_secret: parsed.clientSecret,
               redirect_uri: redirectUri,
               grant_type: 'authorization_code',
            }),
         });
         if (!response.ok) {
            throw new SwiftAuthError(
               'TOKEN_EXCHANGE_FAILED',
               `Google token exchange failed: ${response.statusText}`,
            );
         }
         const data = (await response.json()) as GoogleTokenResponse;
         return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? null,
            idToken: data.id_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
         };
      },
      async getUserInfo(tokens: OAuthTokens): Promise<OAuthUser> {
         if (!tokens.idToken) {
            throw new SwiftAuthError('INVALID_ID_TOKEN', 'Google id_token is missing');
         }
         const payload = JSON.parse(
            Buffer.from(tokens.idToken.split('.')[1], 'base64url').toString(),
         ) as GoogleIdTokenPayload;
         return {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            image: payload.picture ?? null,
            emailVerified: payload.email_verified,
            redirectUrl: config.redirectUrl,
         };
      },
   };
}
