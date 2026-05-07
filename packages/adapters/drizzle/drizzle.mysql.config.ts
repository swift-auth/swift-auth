import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'mysql',
   schema: './src/schemas/sql.ts',
   out: './drizzle/mysql',
   dbCredentials: {
      host: 'localhost',
      port: 3306,
      user: 'test_user',
      password: 'test_password',
      database: 'test_db',
   },
});
