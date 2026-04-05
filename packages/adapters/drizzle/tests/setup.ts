import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// setup.ts is in tests/ folder
// docker-compose.yml is one level up
const rootDir = path.resolve(__dirname, '..');

async function poolPostgres() {
   const maxAttempts = 20;
   let attempts = 0;
   while (attempts < maxAttempts) {
      try {
         execSync('docker exec postgres_test pg_isready -U test_user -d test_db', {
            stdio: 'pipe',
         });
         return;
      } catch {
         attempts++;
         await new Promise((resolve) => setTimeout(resolve, 1000));
      }
   }
   throw new Error('PostgreSQL did not become ready in time');
}

export async function setup() {
   execSync('docker compose up -d', { cwd: rootDir, stdio: 'inherit' });
   await poolPostgres();
   execSync('pnpm drizzle-kit push --force', { cwd: rootDir, stdio: 'inherit' });
}

export function teardown() {
   execSync('docker compose down', {
      cwd: rootDir,
      stdio: 'inherit',
   });
}
