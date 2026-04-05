import { describe, it, expect } from 'vitest';
import { SwiftAuth } from 'swift-auth';
import { generateDrizzleSchema } from '../../src/generators/drizzle.js';
import { mockAdapter } from '../utils/mockAdapter.js';
describe('generate drizzle schema', () => {
   it('generate schema without verify table when verify email is false', () => {
      const auth = new SwiftAuth({
         database: mockAdapter,
         emailAndPassword: {
            enabled: true,
         },
      });
      const drizzleSchema = generateDrizzleSchema(auth);
      expect(drizzleSchema).toMatchSnapshot();
   });

   it('generate schema with verify table when verify email is true', () => {
      const auth = new SwiftAuth({
         database: mockAdapter,
         emailAndPassword: {
            enabled: true,
            verifyEmail: true,
         },
      });
      const drizzleSchema = generateDrizzleSchema(auth);
      expect(drizzleSchema).toMatchSnapshot();
   });
});
