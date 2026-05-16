import { ApiInterface } from '../types/api.types.js';
import { AuthioConfig, ParsedAuthioConfig } from '../types/config.js';
import { deleteUser } from './api/delete.api.js';
import { emailSignIn } from './api/emailSignIn.api.js';
import { emailSignUp } from './api/emailSignUp.api.js';
import { forgotPassword } from './api/forgotPassword.api.js';
import { oauthCallback } from './api/oauthCallback.api.js';
import { oauthRedirectUrl } from './api/oauthRedirectUrl.api.js';
import { resetPassword } from './api/resetPassword.api.js';
import { getSession } from './api/session.api.js';
import { signout } from './api/signout.api.js';
import { verifyEmail } from './api/verifyEmail.api.js';
import { createSchemas } from './schemas/schema.js';

export class Authio {
   readonly config: ParsedAuthioConfig;
   api: ApiInterface;
   readonly schema: ReturnType<typeof createSchemas>;

   constructor(config: AuthioConfig) {
      if (!config.database) throw new Error('Database adapter is not defined');

      if (!config.baseUrl) throw new Error('baseUrl is required');

      if (config.emailAndPassword?.verifyEmail && !config.emailAndPassword?.verificationCallback) {
         throw new Error('verificationCallback is required when verifyEmail is true');
      }

      this.config = {
         baseUrl: config.baseUrl,
         database: config.database,
         socialProviders: config.socialProviders,
         session: {
            expiry: config.session?.expiry ?? 1000 * 60 * 60 * 24, //1 day
         },
         cookies: {
            name: config.cookies?.name ?? 'authio_session_token',
            secure: config.cookies?.secure ?? true,
            domain: config.cookies?.domain ?? new URL(config.baseUrl).hostname,
            sameSite: config.cookies?.sameSite ?? 'lax',
         },
         emailAndPassword: config.emailAndPassword
            ? {
                 enabled: config.emailAndPassword.enabled,
                 autoSignIn: config.emailAndPassword.autoSignIn ?? true,
                 verifyEmail: config.emailAndPassword.verifyEmail ?? false,
                 minPasswordLength: config.emailAndPassword.minPasswordLength ?? 8,
                 verificationTokenExpiry:
                    config.emailAndPassword.verificationTokenExpiry ?? 1000 * 60 * 60,
                 verificationCallback: config.emailAndPassword.verificationCallback,
                 forgotPasswordCallback: config.emailAndPassword.forgotPasswordCallback,
              }
            : undefined,
         internal: {
            oauth: {
               supportedOauthProviders: ['google', 'github'],
               oauthStateCookie: {
                  name: 'oauth_state_cookie',
               },
            },
         },
      };

      this.api = {
         emailSignUp: (payload) => emailSignUp(payload, this.config),
         emailSignIn: (payload) => emailSignIn(payload, this.config),
         verifyEmail: (payload) => verifyEmail(payload, this.config),
         getSession: (payload) => getSession(payload, this.config),
         forgotPassword: (payload) => forgotPassword(payload, this.config),
         resetPassword: (payload) => resetPassword(payload, this.config),
         oauthRedirectUrl: (payload) => oauthRedirectUrl(payload, this.config),
         oauthCallback: (payload) => oauthCallback(payload, this.config),
         deleteUser: (payload) => deleteUser(payload, this.config),
         signout: (payload) => signout(payload, this.config),
      };
      this.schema = createSchemas(this.config);
   }
}
