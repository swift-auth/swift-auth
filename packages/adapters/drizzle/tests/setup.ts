import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function pollService(name: string, check: () => void, maxAttempts = 30, intervalMs = 1500) {
   let attempts = 0;
   while (attempts < maxAttempts) {
      try {
         check();
         console.log(`✓ ${name} is ready`);
         return;
      } catch {
         attempts++;
         console.log(`  Waiting for ${name}… (${attempts}/${maxAttempts})`);
         await new Promise((r) => setTimeout(r, intervalMs));
      }
   }
   throw new Error(`${name} did not become ready in time`);
}

export async function setup() {
   execSync('docker compose up -d', { cwd: rootDir, stdio: 'inherit' });

   // Poll both services concurrently
   await Promise.all([
      pollService('PostgreSQL', () =>
         execSync('docker exec postgres_test pg_isready -U test_user -d test_db', {
            stdio: 'pipe',
         }),
      ),
      pollService('MySQL', () =>
         execSync(
            'docker exec mysql_test mysqladmin ping -h 127.0.0.1 -u test_user -ptest_password --silent',
            { stdio: 'pipe' },
         ),
      ),
   ]);

   // Push each schema with its own config — must be sequential (drizzle-kit writes files)
   console.log('Pushing postgres schema…');
   execSync('pnpm drizzle-kit push --force --config=drizzle.postgres.config.ts', {
      cwd: rootDir,
      stdio: 'inherit',
   });

   console.log('Pushing mysql schema…');
   execSync('pnpm drizzle-kit push --force --config=drizzle.mysql.config.ts', {
      cwd: rootDir,
      stdio: 'inherit',
   });

   console.log('✓ All schemas pushed — running tests');
}

export function teardown() {
   execSync('docker compose down -v', { cwd: rootDir, stdio: 'inherit' });
}
