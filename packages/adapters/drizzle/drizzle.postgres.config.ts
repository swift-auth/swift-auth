import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   schema: './src/schemas/postgres.ts',
   out: './drizzle/postgres',
   dbCredentials: {
      url: 'postgresql://test_user:test_password@localhost:5432/test_db',
   },
});
