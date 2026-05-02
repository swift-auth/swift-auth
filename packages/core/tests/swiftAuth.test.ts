import { describe, it, expect } from 'vitest';
import { SwiftAuth } from '../src/core/swiftAuth.js';
import { ParsedSwiftAuthConfig } from '../src/validator/config.validator.js';
import { mockAdapter } from './utils/mockAdapter.js';

describe('SwiftAuth Instance creation test', () => {
   it('should create an instance with default values', () => {
      const expected: ParsedSwiftAuthConfig = {
         baseUrl: 'http://localhost:3000',
         database: mockAdapter,
         session: {
            expiry: 1000 * 60 * 60 * 24,
         },
         emailAndPassword: {
            enabled: true,
            autoSignIn: true,
            verifyEmail: false,
            minPasswordLength: 8,
         },
         cookies: {
            name: 'swift_auth_session_token',
            secure: true,
            domain: 'localhost', // extracted from baseUrl
            sameSite: 'lax',
         },
      };

      const auth = new SwiftAuth({
         baseUrl: 'http://localhost:3000',
         database: mockAdapter,
         emailAndPassword: {
            enabled: true,
         },
      });

      expect(auth.config).toEqual(expected);
   });

   it('should create an instance with user defined emailAndPassword values', () => {
      const expected: ParsedSwiftAuthConfig = {
         baseUrl: 'http://localhost:3000',
         database: mockAdapter,
         session: {
            expiry: 1000 * 60 * 60 * 24,
         },
         emailAndPassword: {
            enabled: true,
            autoSignIn: false,
            verifyEmail: true,
            minPasswordLength: 20,
         },
         cookies: {
            name: 'swift_auth_session_token',
            secure: true,
            domain: 'localhost',
            sameSite: 'lax',
         },
      };

      const auth = new SwiftAuth({
         baseUrl: 'http://localhost:3000',
         database: mockAdapter,
         emailAndPassword: {
            enabled: true,
            autoSignIn: false,
            verifyEmail: true,
            minPasswordLength: 20,
         },
      });

      expect(auth.config).toEqual(expected);
   });

   it('should create an instance with user defined cookie values', () => {
      const expected: ParsedSwiftAuthConfig = {
         baseUrl: 'https://api.example.com',
         database: mockAdapter,
         session: {
            expiry: 1000 * 60 * 60 * 24,
         },
         cookies: {
            name: 'my_app_session',
            secure: false,
            domain: '.example.com', // user provided, used as-is
            sameSite: 'strict',
         },
      };

      const auth = new SwiftAuth({
         baseUrl: 'https://api.example.com',
         database: mockAdapter,
         cookies: {
            name: 'my_app_session',
            secure: false,
            domain: '.example.com',
            sameSite: 'strict',
         },
      });

      expect(auth.config).toEqual(expected);
   });

   it('should extract domain from baseUrl when no cookie domain is provided', () => {
      const auth = new SwiftAuth({
         baseUrl: 'https://api.example.com',
         database: mockAdapter,
      });

      expect(auth.config.cookies.domain).toBe('api.example.com');
   });

   it('should use custom session expiry when provided', () => {
      const auth = new SwiftAuth({
         baseUrl: 'http://localhost:3000',
         database: mockAdapter,
         session: {
            expiry: 1000 * 60 * 60,
         },
      });

      expect(auth.config.session.expiry).toBe(1000 * 60 * 60);
   });

   it('should throw error when emailAndPassword.enabled is not a boolean', () => {
      expect(() => {
         new SwiftAuth({
            baseUrl: 'http://localhost:3000',
            database: mockAdapter,
            emailAndPassword: {
               // @ts-expect-error
               enabled: 'yes',
            },
         });
      }).toThrow('emailAndPassword.enabled');
   });

   it('should throw error when database is not defined', () => {
      expect(() => {
         new SwiftAuth({
            baseUrl: 'http://localhost:3000',
            // @ts-expect-error
            database: undefined,
         });
      }).toThrow('Database adapter is not defined');
   });

   it('should throw error when baseUrl is missing', () => {
      expect(() => {
         new SwiftAuth({
            // @ts-expect-error
            baseUrl: undefined,
            database: mockAdapter,
         });
      }).toThrow('baseUrl');
   });

   it('should throw error when baseUrl is not a valid url', () => {
      expect(() => {
         new SwiftAuth({
            baseUrl: 'not-a-valid-url',
            database: mockAdapter,
         });
      }).toThrow('baseUrl');
   });
});
