export interface Config {
   baseUrl: string;
}

export interface EmailSignUp {
   email: string;
   name: string;
   password: string;
}

export interface EmailSignUpResponse {
   code: string;
   message: string;
   session: Session | null;
   user: User | null;
}

export interface EmailSignIn {
   email: string;
   password: string;
}

export interface EmailSignInResponse {
   code: string;
   message: string;
   session: Session;
   user: User;
}

export interface VerifyEmailResponse {
   code: string;
   message: string;
   session: Session | null;
   user: User;
}

export interface ForgotPasswordResponse {
   code: string;
   message: string;
}

export interface ResetPasswordResponse {
   code: string;
   message: string;
}

export interface SessionResponse {
   session: Session;
   user: User;
   code: string;
   message: string;
}

export interface SignOutResponse {
   code: string;
   message: string;
}

export interface User {
   id: string;
   name: string;
   email: string;
   emailVerified: boolean;
   image: string | null;
   createdAt: Date;
   updatedAt: Date;
}

export interface Session {
   id: string;
   token: string;
   userId: string;
   userAgent: string | null;
   ipAddress: string | null;
   expiresAt: Date;
   createdAt: Date;
   updatedAt: Date;
}

export interface Verification {
   id: string;
   identifier: string;
   value: string;
   expiresAt: Date;
   createdAt: Date;
   updatedAt: Date;
}

export interface Account {
   id: string;
   userId: string;
   accountId: string;
   providerId: string;
   accessToken: string | null;
   refreshToken: string | null;
   accessTokenExpiresAt: Date | null;
   refreshTokenExpiresAt: Date | null;
   scope: string | null;
   idToken: string | null;
   password: string | null;
   createdAt: Date;
   updatedAt: Date;
}

export interface SwiftAuthClientApi {
   emailSignUp(data: EmailSignUp): Promise<EmailSignUpResponse>;
   emailSignIn(data: EmailSignIn): Promise<EmailSignInResponse>;
   verifyEmail(token: string): Promise<VerifyEmailResponse>;
   forgotPassword(email: string): Promise<ForgotPasswordResponse>;
   resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse>;
   getSession(): Promise<SessionResponse>;
   signOut(): Promise<SignOutResponse>;
   googleSignIn(): void;
   githubSignIn(): void;
}
