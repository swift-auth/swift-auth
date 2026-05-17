import app from './index.js';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { drizzleTemplatesGenerator } from './utils/drizzleTemplates.js';
import { execSync } from 'node:child_process';
import { db } from './db/index.js';

interface SetupServerConfigType {
   database: 'prisma' | 'drizzle';
   provider: 'postgres' | 'mysql' | 'sqlite';
}

export function setupNodeServer(config: SetupServerConfigType) {
   const projectRoot = path.resolve(import.meta.dirname, '..');
   const authFilePath = path.resolve(import.meta.dirname, 'lib/auth.ts');
   const drizzlDbPath = path.resolve(import.meta.dirname, 'db/index.ts');
   const drizzleConfigFile = path.join(projectRoot, 'drizzle.config.ts');
   const repoRoot = path.resolve(import.meta.dirname, '../../../');

   return {
      startDockerContainer: () => {
         execSync('docker compose up -d', {
            cwd: repoRoot,
            stdio: 'pipe',
         });
      },

      stopDockerContainer: () => {
         execSync('docker compose down', {
            cwd: repoRoot,
            stdio: 'pipe',
         });
      },

      waitForDb: () => {
         const maxRetries = 30;

         for (let i = 0; i < maxRetries; i++) {
            try {
               if (config.provider === 'postgres') {
                  execSync('docker compose exec postgres pg_isready -U postgres', {
                     cwd: repoRoot,
                     stdio: 'pipe', // suppress output
                  });
               } else if (config.provider === 'mysql') {
                  execSync('docker compose exec mysql mysqladmin ping -h localhost --silent', {
                     cwd: repoRoot,
                     stdio: 'pipe',
                  });
               }

               return;
            } catch {
               execSync(`sleep 1`);
            }
         }
         throw new Error('Database did not become ready in time');
      },

      startServer: () => {
         app.listen(process.env.PORT!);
      },
      drizzleSetup: () => {
         const templates = drizzleTemplatesGenerator(config.provider, config.database)!;
         writeFileSync(authFilePath, templates?.authTemplate);
         writeFileSync(drizzlDbPath, templates?.dbTemplate);
         writeFileSync(drizzleConfigFile, templates?.configTemplate);
      },

      genarateSchema: () => {
         if (config.database == 'drizzle') {
            execSync('npx @authio/cli generate', {
               cwd: projectRoot,

               stdio: 'pipe',
            });
         }
      },

      migrateDb: () => {
         if (config.database == 'drizzle') {
            execSync('npx drizzle-kit push --force', {
               cwd: projectRoot,
               stdio: 'pipe',
            });
         }
      },

      async tearDown() {
         if (config.database === 'drizzle') {
            execSync('pnpm drizzle-kit drop', {
               cwd: projectRoot,
            });
         }

         await db.$client.end();
         this.stopDockerContainer();
         console.log('Teardown went Successfull');
         process.exit(0);
      },

      spinUp() {
         this.startDockerContainer();
         this.waitForDb();
         // console.log('Docker containers for postgres and mysql has started');

         this.drizzleSetup();
         // console.log('Generating necessary templates');

         this.genarateSchema();
         // console.log('generating schema');

         this.migrateDb();
         // console.log('Database schema Migration is successfull');

         this.startServer();

         return;
      },
   };
}
