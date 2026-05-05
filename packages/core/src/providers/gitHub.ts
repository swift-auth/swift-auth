/*

For GitHub the OAuth flow is slightly different from google. in GitHub there is no support of OIDC so we need to get user info from a sepereare
resource server endpoint and the user endpoint may or may not have the user email . so then we need to go to another resource server to get all the emails
user have attached to their GitHub account that's why we have 2 enpoints and 2 seperate request

*/
import type { OAuthProvider, OAuthTokens, OAuthUser } from './types.js';
import * as z from 'zod';
import { SwiftAuthError } from '../core/SwiftError.js';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';

export interface GitHubConfig {
   clientId: string;
   clientSecret: string;
   scopes?: string[];
   redirectUrl: string;
}

export const gitHubConfigSchema = z.object({
   clientId: z.string(),
   redirectUrl: z.string(),
   clientSecret: z.string(),
   scopes: z.array(z.string()).default(['read:user', 'user:email']),
});

interface GitHubTokenResponse {
   access_token: string;
   token_type: string;
   scope: string;
}

interface GitHubUser {
   id: number;
   name: string;
   email: string | null;
   avatar_url: string;
}

interface GitHubEmail {
   email: string;
   primary: boolean;
   verified: boolean;
}

export function gitHubProvider(config: GitHubConfig): OAuthProvider {
   const parsed = gitHubConfigSchema.parse(config);
   return {
      id: 'github',
      getAuthUrl(state: string, redirectUri: string): string {
         const params = new URLSearchParams({
            client_id: parsed.clientId,
            redirect_uri: redirectUri,
            scope: parsed.scopes.join(' '),
            state,
         });
         return `${GITHUB_AUTH_URL}?${params.toString()}`;
      },
      async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens> {
         const response = await fetch(GITHUB_TOKEN_URL, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               Accept: 'application/json',
            },
            body: new URLSearchParams({
               code,
               client_id: parsed.clientId,
               client_secret: parsed.clientSecret,
               redirect_uri: redirectUri,
            }),
         });
         if (!response.ok) {
            throw new SwiftAuthError(
               'TOKEN_EXCHANGE_FAILED',
               `GitHub token exchange failed: ${response.statusText}`,
            );
         }
         const data = (await response.json()) as GitHubTokenResponse;
         return {
            accessToken: data.access_token,
            refreshToken: null,
            idToken: null,
            expiresIn: null,
            tokenType: data.token_type,
            scope: data.scope,
         };
      },
      async getUserInfo(tokens: OAuthTokens): Promise<OAuthUser> {
         // fetch github user profile
         const userResponse = await fetch(GITHUB_USER_URL, {
            headers: {
               Authorization: `Bearer ${tokens.accessToken}`,
               Accept: 'application/vnd.github+json',
            },
         });
         if (!userResponse.ok) {
            throw new SwiftAuthError(
               'FAILED_TO_FETCH_USER',
               `Failed to fetch GitHub user: ${userResponse.statusText}`,
            );
         }
         const user = (await userResponse.json()) as GitHubUser;

         // email can be null if user has set it private on github
         // so we need to make a second call to /user/emails
         let email = user.email;
         if (!email) {
            const emailsResponse = await fetch(GITHUB_USER_EMAILS_URL, {
               headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                  Accept: 'application/vnd.github+json',
               },
            });
            if (!emailsResponse.ok) {
               throw new SwiftAuthError(
                  'FAILED_TO_FETCH_USER',
                  `Failed to fetch GitHub user emails: ${emailsResponse.statusText}`,
               );
            }
            const emails = (await emailsResponse.json()) as GitHubEmail[];
            const primaryEmail = emails.find((e) => e.primary && e.verified);
            if (!primaryEmail) {
               throw new SwiftAuthError(
                  'EMAIL_NOT_FOUND',
                  'No verified primary email found on this GitHub account',
               );
            }
            email = primaryEmail.email;
         }

         return {
            id: String(user.id),
            email,
            name: user.name,
            image: user.avatar_url ?? null,
            redirectUrl: config.redirectUrl,
            emailVerified: true, // github emails are always verified
         };
      },
   };
}
