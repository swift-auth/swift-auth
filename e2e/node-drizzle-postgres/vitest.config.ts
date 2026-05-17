import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      globalSetup: './test/handlers/globalSetup.ts',
      include: ['./test/**/*.test.ts'],

      sequence: {
         concurrent: false,
      },
   },
});
