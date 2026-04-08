import { describe, it, expect, vi, beforeEach } from 'vitest';
import { googleProvider } from '../../src/providers/google.js';

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

function createMockIdToken(payload: object) {
   const base64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');

   return `${base64({ alg: 'none' })}.${base64(payload)}.signature`;
}

describe('googleProvider', () => {
   const provider = googleProvider({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
   });

   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('generates correct auth URL', () => {
      const url = provider.getAuthUrl('state123', 'http://localhost/callback');
      const parsed = new URL(url);

      expect(parsed.origin + parsed.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');

      expect(parsed.searchParams.get('client_id')).toBe('test-client-id');
      expect(parsed.searchParams.get('state')).toBe('state123');
      expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost/callback');
      expect(parsed.searchParams.get('response_type')).toBe('code');
   });

   it('exchanges code successfully', async () => {
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({
            access_token: 'access123',
            refresh_token: 'refresh123',
            id_token: 'idtoken123',
            expires_in: 3600,
            token_type: 'Bearer',
            scope: 'openid email profile',
         }),
      });

      const tokens = await provider.exchangeCode('code123', 'http://localhost/callback');

      expect(tokens.accessToken).toBe('access123');
      expect(tokens.refreshToken).toBe('refresh123');
      expect(tokens.idToken).toBe('idtoken123');
      expect(tokens.expiresIn).toBe(3600);
      expect(tokens.tokenType).toBe('Bearer');
   });

   it('throws on token exchange failure', async () => {
      mockFetch.mockResolvedValueOnce({
         ok: false,
         statusText: 'Bad Request',
      });

      await expect(provider.exchangeCode('bad', 'http://localhost/callback')).rejects.toThrow(
         'Google token exchange failed',
      );
   });

   it('parses user info from id_token', async () => {
      const idToken = createMockIdToken({
         sub: '123',
         email: 'test@example.com',
         email_verified: true,
         name: 'Test User',
         picture: 'avatar.png',
      });

      const user = await provider.getUserInfo({
         accessToken: 'access',
         refreshToken: null,
         idToken,
         expiresIn: 3600,
         tokenType: 'Bearer',
         scope: 'openid',
      });

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.image).toBe('avatar.png');
      expect(user.emailVerified).toBe(true);
   });

   it('throws if id_token is missing', async () => {
      await expect(
         provider.getUserInfo({
            accessToken: 'access',
            refreshToken: null,
            idToken: null,
            expiresIn: 3600,
            tokenType: 'Bearer',
            scope: 'openid',
         }),
      ).rejects.toThrow('Google id_token is missing');
   });
});
