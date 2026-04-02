import { describe, it, expect } from 'vitest';
import { SwiftAuth } from '../src/core/swiftAuth.js';
import { ParsedSwiftAuthConfig } from '../src/validator/config.validator.js';
describe('SwiftAuth Instance creation test', () => {
   it('should create a instance with default values', () => {
      const expected: ParsedSwiftAuthConfig = {
         emailAndPassword: {
            enabled: true,
            autoSignIn: true,
            verifyEmail: false,
            minPasswordLength: 8,
         },
      };

      const auth = new SwiftAuth({
         emailAndPassword: {
            enabled: true,
         },
      });

      expect(auth.config).toEqual(expected);
   });

   it('should create a instance with user defined values', () => {
      const expected: ParsedSwiftAuthConfig = {
         emailAndPassword: {
            enabled: true,
            autoSignIn: false,
            verifyEmail: true,
            minPasswordLength: 20,
         },
      };

      const auth = new SwiftAuth({
         emailAndPassword: {
            enabled: true,
            autoSignIn: false,
            verifyEmail: true,
            minPasswordLength: 20,
         },
      });

      expect(auth.config).toEqual(expected);
   });

   it('should throw error because enabled field is not defined by the user', () => {
      expect(() => {
         new SwiftAuth({
            emailAndPassword: {
               // @ts-expect-error
               enabled: 'yes',
            },
         });
      }).toThrow('emailAndPassword.enabled');
   });
});
