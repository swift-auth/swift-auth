import type { OAuthProvider, OAuthTokens, OAuthUser } from './types.js';

import { AuthioError } from '../core/authioError.js';

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

export function googleProvider(userConfig: GoogleConfig): OAuthProvider {
   const config: Required<GoogleConfig> = {
      clientId: userConfig.clientId,
      clientSecret: userConfig.clientSecret,
      redirectUrl: userConfig.redirectUrl,
      scopes: userConfig.scopes ?? ['openid', 'email', 'profile'],
      prompt: userConfig.prompt ?? 'consent',
      accessType: userConfig.accessType ?? 'offline',
   };

   return {
      id: 'google',
      getAuthUrl(state: string, redirectUri: string): string {
         const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: config.scopes.join(' '),
            state,
            access_type: config.accessType,
            prompt: config.prompt,
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
               client_id: config.clientId,
               client_secret: config.clientSecret,
               redirect_uri: redirectUri,
               grant_type: 'authorization_code',
            }),
         });
         if (!response.ok) {
            throw new AuthioError(
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
            throw new AuthioError('INVALID_ID_TOKEN', 'Google id_token is missing');
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
