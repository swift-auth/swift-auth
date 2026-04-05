import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   out: './drizzle',
   schema: './src/schema.ts',
   dialect: 'postgresql',
   dbCredentials: {
      url: 'postgresql://test_user:test_password@localhost:5432/test_db',
   },
});
