import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'sqlite',
   schema: './src/schemas/sqlite.ts',
   out: './drizzle/sqlite',
   dbCredentials: {
      url: './test.db',
   },
});
