import bcrypt from 'bcryptjs';
import { SwiftAuthConfig } from '../types/config.js';
import { ParsedSwiftAuthConfig } from '../validator/config.validator.js';
import { SwiftAuthError } from './SwiftError.js';
import { Session, User } from '../types/auth.js';

export class SwiftAuth {
   readonly config: ParsedSwiftAuthConfig;

   constructor(config: SwiftAuthConfig) {
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
            expiry: config.session?.expiry ?? 1000 * 60 * 60 * 24, //defaults to 1 hour
         },
         cookies: {
            name: config.cookies?.name ?? 'swift_auth_session_token',
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
      };
   }

   async emailSignUp(
      name: string,
      email: string,
      password: string,
      meta?: { userAgent?: string; ipAddress?: string },
   ) {
      if (!name || !email || !password) {
         throw new SwiftAuthError('MISSING_FIELDS', 'plesse fill all the missing fields');
      }

      if (!this.config.emailAndPassword?.enabled) {
         throw new SwiftAuthError(
            'EMAIL_PASSWORD_DISABLED',
            'Enable emailAndPassword in your config to use email signup',
         );
      }

      if (password.length < this.config.emailAndPassword.minPasswordLength) {
         throw new SwiftAuthError(
            'PASSWORD_TOO_SHORT',
            `Password must be at least ${this.config.emailAndPassword.minPasswordLength} characters`,
         );
      }

      const existingUser = await this.config.database.findUserByEmail(email);
      if (existingUser) {
         throw new SwiftAuthError('USER_ALREADY_EXISTS', 'A user with this email already exists');
      }

      const hashedPassword = await hashPassword(password);

      // with email verification
      if (
         this.config.emailAndPassword.verifyEmail &&
         this.config.emailAndPassword.verificationCallback
      ) {
         const user = await this.config.database.createUser({
            email,
            name,
            emailVerified: false,
            image: null,
         });

         await this.config.database.createAccount({
            userId: user.id,
            accountId: user.id,
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            idToken: null,
            password: hashedPassword,
            providerId: 'email',
         });

         const verification = await this.config.database.createVerification({
            identifier: user.email,
            expiresAt: new Date(Date.now() + this.config.emailAndPassword.verificationTokenExpiry),
         });
         //call the verification callback provided by the user. I am letting the user decide how to share the token with the user
         await this.config.emailAndPassword.verificationCallback({
            name: user.name,
            email: user.email,
            verificationToken: verification.value,
         });

         return {
            code: 'VERIFICATION_SENT',
            message: 'User created, verification email sent',
            session: null,
            user,
         };
      }

      // without email verification
      const user = await this.config.database.createUser({
         email,
         name,
         emailVerified: true,
         image: null,
      });

      await this.config.database.createAccount({
         userId: user.id,
         accountId: user.id,
         accessToken: null,
         refreshToken: null,
         accessTokenExpiresAt: null,
         refreshTokenExpiresAt: null,
         scope: null,
         idToken: null,
         password: hashedPassword,
         providerId: 'email',
      });

      if (this.config.emailAndPassword.autoSignIn) {
         const session = await this.config.database.createSession({
            userId: user.id,
            token: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + this.config.session.expiry),
            userAgent: meta?.userAgent ?? null,
            ipAddress: meta?.ipAddress ?? null,
         });

         return {
            code: 'SIGNUP_SUCCESS_AND_AUTO_SIGNIN',
            message: 'User created and signed in',
            session,
            user,
         };
      }

      return {
         code: 'SIGNUP_SUCCESS',
         message: 'User created successfully',
         session: null,
         user,
      };
   }

   async emailSignIn(
      email: string,
      password: string,
      meta?: { userAgent?: string; ipAddress?: string },
   ) {
      if (!email || !password) {
         throw new SwiftAuthError('MISSING_FIELDS', 'plesse fill all the missing fields');
      }
      if (!this.config.emailAndPassword?.enabled) {
         throw new SwiftAuthError(
            'EMAIL_PASSWORD_DISABLED',
            'Enable emailAndPassword in your config to use email signin',
         );
      }

      // find user
      const user = await this.config.database.findUserByEmail(email);
      if (!user) {
         throw new SwiftAuthError('INVALID_CREDENTIALS', 'Invalid email or password');
      }

      // find account to get the password hash
      const account = await this.config.database.findAccountByUserId(user.id, 'email');
      if (!account || !account.password) {
         throw new SwiftAuthError('INVALID_CREDENTIALS', 'Invalid email or password');
      }

      // verify password
      const isValid = await comparePassword(password, account.password);
      if (!isValid) {
         throw new SwiftAuthError('INVALID_CREDENTIALS', 'Invalid email or password');
      }

      // check email verified
      if (this.config.emailAndPassword.verifyEmail && !user.emailVerified) {
         throw new SwiftAuthError(
            'EMAIL_NOT_VERIFIED',
            'Please verify your email before signing in',
         );
      }

      // create session
      const session = await this.config.database.createSession({
         userId: user.id,
         token: crypto.randomUUID(),
         expiresAt: new Date(Date.now() + this.config.session.expiry),
         userAgent: meta?.userAgent ?? null,
         ipAddress: meta?.ipAddress ?? null,
      });

      return {
         code: 'SIGNIN_SUCCESS',
         message: 'Signed in successfully',
         session,
         user,
      };
   }

   async verifyEmail(token: string) {
      if (!this.config.emailAndPassword?.enabled) {
         throw new SwiftAuthError(
            'EMAIL_PASSWORD_DISABLED',
            'Enable emailAndPassword in your config to use email verification',
         );
      }

      if (!this.config.emailAndPassword.verifyEmail) {
         throw new SwiftAuthError(
            'VERIFICATION_NOT_ENABLED',
            'Email verification is not enabled in your config',
         );
      }

      // find the verification token
      const verification = await this.config.database.findVerificationByToken(token);
      if (!verification) {
         throw new SwiftAuthError('INVALID_TOKEN', 'Verification token is invalid or already used');
      }

      // check if token is expired
      if (verification.expiresAt < new Date()) {
         await this.config.database.deleteVerification(verification.id);
         throw new SwiftAuthError('TOKEN_EXPIRED', 'Verification token has expired');
      }

      // find user
      const user = await this.config.database.findUserByEmail(verification.identifier);
      if (!user) {
         throw new SwiftAuthError(
            'USER_NOT_FOUND',
            'User associated with this token was not found',
         );
      }

      // mark email as verified
      await this.config.database.updateUser(user.id, {
         emailVerified: true,
      });

      // delete token so it cannot be reused
      await this.config.database.deleteVerification(verification.id);

      // auto sign in if enabled
      if (this.config.emailAndPassword.autoSignIn) {
         const session = await this.config.database.createSession({
            userId: user.id,
            token: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + this.config.session.expiry),
            userAgent: null,
            ipAddress: null,
         });

         return {
            code: 'EMAIL_VERIFIED',
            message: 'Email verified and signed in successfully',
            session,
            user,
         };
      }

      return {
         code: 'EMAIL_VERIFIED',
         message: 'Email verified successfully',
         user,
         session: null,
      };
   }

   async forgotPassword(email: string) {
      if (!this.config.emailAndPassword?.enabled) {
         throw new SwiftAuthError(
            'EMAIL_PASSWORD_DISABLED',
            'Enable emailAndPassword in your config to use forgot password',
         );
      }

      if (!this.config.emailAndPassword.forgotPasswordCallback) {
         throw new SwiftAuthError(
            'MISSING_FORGOT_PASSWORD_CALLBACK',
            'forgotPasswordCallback is required to use forgot password',
         );
      }

      const user = await this.config.database.findUserByEmail(email);

      //I will not reveal the existence of the user instead just returning a fake success message
      if (!user) {
         return {
            code: 'RESET_EMAIL_SENT',
            message: 'If an account exists with this email, a reset link has been sent',
         };
      }

      const verification = await this.config.database.createVerification({
         identifier: user.email,
         expiresAt: new Date(Date.now() + this.config.emailAndPassword.verificationTokenExpiry),
      });

      // calling the forget password callback provided by the user. letting the user decide how they want the token sharing system
      await this.config.emailAndPassword.forgotPasswordCallback({
         name: user.name,
         email: user.email,
         resetToken: verification.value,
      });

      return {
         code: 'RESET_EMAIL_SENT',
         message: 'If an account exists with this email, a reset link has been sent',
      };
   }

   async resetPassword(token: string, newPassword: string) {
      // find verification token
      const verification = await this.config.database.findVerificationByToken(token);
      if (!verification) {
         throw new SwiftAuthError('INVALID_TOKEN', 'Reset token is invalid or already used');
      }

      // check expiry
      if (verification.expiresAt < new Date()) {
         await this.config.database.deleteVerification(verification.id);
         throw new SwiftAuthError('TOKEN_EXPIRED', 'Reset token has expired');
      }

      // find user
      const user = await this.config.database.findUserByEmail(verification.identifier);
      if (!user) {
         throw new SwiftAuthError('USER_NOT_FOUND', 'User not found');
      }

      // check new password length
      if (newPassword.length < this.config.emailAndPassword!.minPasswordLength) {
         throw new SwiftAuthError(
            'PASSWORD_TOO_SHORT',
            `Password must be at least ${this.config.emailAndPassword!.minPasswordLength} characters`,
         );
      }

      // find account and update password
      const account = await this.config.database.findAccountByUserId(user.id, 'email');
      if (!account) {
         throw new SwiftAuthError('ACCOUNT_NOT_FOUND', 'No email account found for this user');
      }

      await this.config.database.updateAccount(account.id, {
         password: await hashPassword(newPassword),
      });

      // delete token so it cannot be reused
      await this.config.database.deleteVerification(verification.id);

      // invalidate all existing sessions for security
      await this.config.database.deleteUserSessions(user.id);

      return {
         code: 'PASSWORD_RESET_SUCCESS',
         message: 'Password reset successfully, please sign in again',
      };
   }

   async getSession(token: string) {
      const session = await this.config.database.findSessionByToken(token);
      if (!session) {
         throw new SwiftAuthError('SESSION_NOT_FOUND', 'Session not found');
      }
      if (session.expiresAt < new Date()) {
         await this.config.database.deleteSession(token);
         throw new SwiftAuthError('SESSION_EXPIRED', 'Session has expired');
      }
      const user = await this.config.database.findUserById(session.userId);
      return { code: 'SESSION_FOUND', message: 'User session found', session, user };
   }

   async signOut(token: string) {
      const session = await this.config.database.findSessionByToken(token);
      if (!session) {
         throw new SwiftAuthError('SESSION_NOT_FOUND', 'Session not found');
      }
      await this.config.database.deleteSession(token);
      return {
         code: 'SIGNOUT_SUCCESS',
         message: 'Signed out successfully',
      };
   }

   //using state for CRSF Protection the sate should be set as a cookie when we will receive back when hitting the callback url
   async getSocialAuthRedirectUrl(provider: 'google' | 'github') {
      const oauthProvider = this.config?.socialProviders?.[provider];
      if (!oauthProvider) {
         throw new SwiftAuthError(
            'PROVIDER_NOT_CONFIGURED',
            `${provider} provider is not configured`,
         );
      }
      const state = crypto.randomUUID();
      const redirectUrl = `${this.config.baseUrl}/api/auth/${provider}/callback`;
      const authUrl = oauthProvider.getAuthUrl(state, redirectUrl);
      return { authUrl, state };
   }

   async oauthCallback(
      provider: 'google' | 'github',
      code: string,
      meta?: { userAgent?: string; ipAddress?: string },
   ): Promise<{
      code: string;
      message: string;
      user: User;
      session: Session;
      redirectUrl: string;
   }> {
      const oauthProvider = this.config?.socialProviders?.[provider];
      if (!oauthProvider) {
         throw new SwiftAuthError(
            'PROVIDER_NOT_CONFIGURED',
            `${provider} provider is not configured`,
         );
      }

      const redirectUrl = `${this.config.baseUrl}/api/auth/${provider}/callback`;

      // exchange code for tokens
      const tokens = await oauthProvider.exchangeCode(code, redirectUrl);

      // get user info from provider
      const oauthUser = await oauthProvider.getUserInfo(tokens);

      // find or create user
      let user = await this.config.database.findUserByEmail(oauthUser.email);
      if (!user) {
         // new user — create user and account
         user = await this.config.database.createUser({
            email: oauthUser.email,
            name: oauthUser.name,
            image: oauthUser.image,
            emailVerified: oauthUser.emailVerified,
         });

         await this.config.database.createAccount({
            userId: user.id,
            accountId: oauthUser.id,
            providerId: provider,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            idToken: tokens.idToken,
            accessTokenExpiresAt: tokens.expiresIn
               ? new Date(Date.now() + tokens.expiresIn * 1000)
               : null,
            refreshTokenExpiresAt: null,
            scope: tokens.scope,
            password: null,
         });
      } else {
         // existing user — update their tokens
         const account = await this.config.database.findAccountByUserId(user.id, provider);
         if (!account) {
            // user exists but no account for this provider yet — create it
            await this.config.database.createAccount({
               userId: user.id,
               accountId: oauthUser.id,
               providerId: provider,
               accessToken: tokens.accessToken,
               refreshToken: tokens.refreshToken,
               idToken: tokens.idToken,
               accessTokenExpiresAt: tokens.expiresIn
                  ? new Date(Date.now() + tokens.expiresIn * 1000) //google return expire time in seconds so  * 1000 converts to ms
                  : null,
               refreshTokenExpiresAt: null,
               scope: tokens.scope,
               password: null,
            });
         } else {
            // account exists — update tokens
            await this.config.database.updateAccount(account.id, {
               accessToken: tokens.accessToken,
               refreshToken: tokens.refreshToken,
               accessTokenExpiresAt: tokens.expiresIn
                  ? new Date(Date.now() + tokens.expiresIn * 1000)
                  : null,
               scope: tokens.scope,
            });
         }
      }

      // create session
      const session = await this.config.database.createSession({
         userId: user.id,
         token: crypto.randomUUID(),
         expiresAt: new Date(Date.now() + this.config.session.expiry),
         userAgent: meta?.userAgent ?? null,
         ipAddress: meta?.ipAddress ?? null,
      });

      return {
         code: 'OAUTH_SUCCESS',
         message: `Signed in with ${provider} successfully`,
         session,
         user,
         redirectUrl: oauthUser.redirectUrl,
      };
   }
}

/* 
On email signup we will hash user passwords and compare when signing in 
*/
async function hashPassword(password: string): Promise<string> {
   return await bcrypt.hash(password, 10);
}

async function comparePassword(password: string, storedHash: string): Promise<boolean> {
   return await bcrypt.compare(password, storedHash);
}
