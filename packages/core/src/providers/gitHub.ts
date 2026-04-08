import { z } from 'zod';
import type { OAuthProvider, OAuthTokens, OAuthUser } from './types.js';
import { email } from 'zod/mini';

const GITHUB_AUTHORIZE_ENDPOINT = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_EXCHANGE_ENDPOINT = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_ENDPOINT = 'https://api.github.com/user';
const GITHUB_EMAIL_ENDPOINT = 'https://api.github.com/user/emails';

/*

For GitHub the OAuth flow is slightly different from google. in GitHub there is no support of OIDC so we need to get user info from a sepereare
resource server endpoint and the user endpoint may or may not have the user email . so then we need to go to another resource server to get all the emails
user have attached to their GitHub account that's why we have 2 enpoints and 2 seperate request

*/

interface GitHubConfig {
   clientId: string;
   clientSecret: string;
   scopes?: string[];
   allowSignup?: boolean;
   login?: string;
}

interface UserPayload {
   id: number;
   name: string | null;
   login: string;
   avatar_url: string;
   email: string | null;
}

const GitHubUserPayloadSchema = z.object({
   id: z.number(),
   name: z.string(),
   login: z.string().optional(),
   avatar_url: z.string(),
   email: z.string().nullable(),
});

const GitHubEmailPayloadSchema = z.array(
   z.object({
      email: z.email(),
      primary: z.boolean(),
      verified: z.boolean(),
      visibility: z.string(),
   }),
);

const GitHubConfigSchema = z.object({
   clientId: z.string(),
   clientSecret: z.string(),
   scopes: z.array(z.string()).default(['read:user', 'user:email']),
   allowSignup: z.boolean().default(true),
   login: z.string().optional(),
});

const GitHubTokenResponseSchema = z.object({
   access_token: z.string(),
   token_type: z.string().default('Bearer'),
   scope: z.string().optional(),
});

export function GitHubProvider(config: GitHubConfig): OAuthProvider {
   const parsedConfig = GitHubConfigSchema.parse(config);

   return {
      id: 'github',
      getAuthUrl(state, redirectUri) {
         const params = new URLSearchParams({
            client_id: parsedConfig.clientId,
            redirect_uri: redirectUri,
            scope: parsedConfig.scopes.join(' '),
            allow_signup: String(parsedConfig.allowSignup),
            state,
         });

         if (parsedConfig.login) {
            params.set('login', parsedConfig.login);
         }

         return `${GITHUB_AUTHORIZE_ENDPOINT}?${params.toString()}`;
      },
      async exchangeCode(code, redirectUri) {
         const res = await fetch(GITHUB_TOKEN_EXCHANGE_ENDPOINT, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               Accept: 'application/json',
            },
            body: new URLSearchParams({
               code,
               client_id: parsedConfig.clientId,
               client_secret: parsedConfig.clientSecret,
               redirect_uri: redirectUri,
               grant_type: 'authorization_code',
            }),
         });

         if (!res.ok) {
            throw new Error(`GitHub token exchange failed: ${res.statusText}`);
         }

         const raw = await res.json();
         const result = GitHubTokenResponseSchema.safeParse(raw);

         if (!result.success) {
            if (typeof raw == 'object' && raw !== null && 'error' in raw) {
               throw new Error(raw.error_description || raw.error);
            }

            let errorMsg = '';

            result.error.issues.map((issue) => {
               errorMsg += `${issue.path}: ${issue.message}\n`;
            });
            throw Error(errorMsg);
         }

         const data = result.data;

         return {
            accessToken: data.access_token,
            tokenType: data.token_type,
            scope: data.scope ?? null,
            refreshToken: null,
            idToken: null,
            expiresIn: null,
         };
      },
      async getUserInfo(tokens): Promise<OAuthUser> {
         if (!tokens.accessToken) {
            throw Error('Invalid access token');
         }
         const userRes = await fetch(GITHUB_USER_ENDPOINT, {
            headers: {
               Authorization: `Bearer ${tokens.accessToken}`,
               Accept: 'application/json',
            },
         });

         if (!userRes.ok) {
            throw new Error(`GitHub user fetch failed: ${userRes.statusText}`);
         }

         let raw = await userRes.json();
         let userDataResult = GitHubUserPayloadSchema.safeParse(raw);

         if (!userDataResult.success) {
            if (typeof raw == 'object' && raw !== null && 'error' in raw) {
               throw new Error(raw.error_description || raw.error);
            } else {
               let errMsg = '';
               userDataResult.error.issues.map((issue) => {
                  errMsg += `${issue.path}: ${issue.message}\n`;
               });
               throw Error(errMsg);
            }
         }
         const user = userDataResult.data;

         const emailRes = await fetch(GITHUB_EMAIL_ENDPOINT, {
            headers: {
               Authorization: `Bearer ${tokens.accessToken}`,
               Accept: 'application/json',
            },
         });

         if (!emailRes.ok) {
            throw new Error(`GitHub email fetch failed: ${emailRes.statusText}`);
         }

         raw = await emailRes.json();
         let result = GitHubEmailPayloadSchema.safeParse(raw);

         if (!result.success) {
            if (typeof raw == 'object' && raw !== null && 'error' in raw) {
               throw new Error(raw.error_description || raw.error);
            } else {
               let errMsg = '';
               result.error.issues.map((issue) => {
                  errMsg += `${issue.path}: ${issue.message}\n`;
               });
               throw Error(errMsg);
            }
         }

         const emails = result.data;

         if (emails.length == 0) {
            throw Error('No emails connected to users GitHub');
         }

         let email = emails.find((email) => email.primary && email.verified);

         if (!email) {
            throw Error('No verified primary email added in GitHub');
         }

         return {
            id: String(user.id),
            email: email.email,
            image: user.avatar_url,
            name: user.name ?? user.login,
            emailVerified: email.primary && email.verified,
         };
      },
   };
}
