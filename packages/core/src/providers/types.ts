export interface OAuthTokens {
   accessToken: string;
   refreshToken: string | null;
   idToken: string | null;
   expiresIn: number | null;
   tokenType: string;
   scope: string | null;
}

export interface OAuthUser {
   id: string;
   email: string;
   name: string;
   image: string | null;
   emailVerified: boolean;
   redirectUrl: string;
}

export interface OAuthProvider {
   id: string;
   getAuthUrl(state: string, redirectUri: string): string;
   exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens>;
   getUserInfo(tokens: OAuthTokens): Promise<OAuthUser>;
}
