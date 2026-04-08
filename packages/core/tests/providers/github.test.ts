import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubProvider } from '../../src/providers/gitHub.js';
import { SwiftAuth } from '../../src/index.js';
import { mockAdapter } from '../utils/mockAdapter.js';

const mockFetch = vi.fn();

global.fetch = mockFetch as any;

describe('GitHubProvider', () => {
   const config = new SwiftAuth({
      baseUrl: 'http://localhost',
      database: mockAdapter,
      socialProviders: {
         github: GitHubProvider({
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
         }),
      },
   });

   const provider = config.config.socialProviders?.github!;

   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('generates correct auth URL', () => {
      const url = provider.getAuthUrl('state123', 'http://localhost/callback');

      const parsed = new URL(url);

      expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost/callback');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('state=state123');
   });

   it('exchanges code successfully', async () => {
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({
            access_token: 'token123',
            token_type: 'bearer',
            scope: 'user',
         }),
      });

      const tokens = await provider.exchangeCode('code123', 'http://localhost/callback');

      expect(tokens.accessToken).toBe('token123');
      expect(tokens.tokenType).toBe('bearer');
      expect(tokens.scope).toBe('user');
   });

   it('handles token exchange error from GitHub', async () => {
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({
            error: 'bad_verification_code',
         }),
      });

      await expect(provider.exchangeCode('bad', 'http://localhost/callback')).rejects.toThrow(
         'bad_verification_code',
      );
   });

   it('fetches user info successfully', async () => {
      mockFetch
         .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
               id: 1,
               name: 'John',
               login: 'john',
               avatar_url: 'img',
               email: null,
            }),
         })
         // emails
         .mockResolvedValueOnce({
            ok: true,
            json: async () => [
               {
                  email: 'john@example.com',
                  primary: true,
                  verified: true,
                  visibility: 'public',
               },
            ],
         });

      const user = await provider.getUserInfo({
         accessToken: 'token123',
         tokenType: 'Bearer',
         refreshToken: null,
         idToken: null,
         expiresIn: null,
         scope: null,
      });

      expect(user.email).toBe('john@example.com');
      expect(user.name).toBe('John');
      expect(user.id).toBe('1');
   });

   it('throws if no verified primary email', async () => {
      mockFetch
         .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
               id: 1,
               name: 'John',
               login: 'john',
               avatar_url: 'img',
               email: null,
            }),
         })
         .mockResolvedValueOnce({
            ok: true,
            json: async () => [
               {
                  email: 'john@example.com',
                  primary: false,
                  verified: false,
                  visibility: 'public',
               },
            ],
         });

      await expect(
         provider.getUserInfo({
            accessToken: 'token123',
            tokenType: 'Bearer',
            refreshToken: null,
            idToken: null,
            expiresIn: null,
            scope: null,
         }),
      ).rejects.toThrow('No verified primary email');
   });

   it('throws on invalid access token', async () => {
      await expect(
         provider.getUserInfo({
            accessToken: '',
            tokenType: 'Bearer',
            refreshToken: null,
            idToken: null,
            expiresIn: null,
            scope: null,
         }),
      ).rejects.toThrow('Invalid access token');
   });
});
