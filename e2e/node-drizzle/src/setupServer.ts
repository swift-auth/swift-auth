import app from './index.js';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { drizzleTemplatesGenerator } from './utils/drizzleTemplates.js';
import { execSync } from 'node:child_process';
import { prismaTemplatesGenerator } from './utils/prismaTemplates.js';

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
   const prismaInstanceFilePath = path.resolve(projectRoot, 'src/lib/prisma.ts');
   const prismaConfigFile = path.resolve(projectRoot, 'prisma.config.ts');
   return {
      startDockerContainer: () => {
         execSync('docker compose up -d --wait', {
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

      prismaSetup: () => {
         execSync('rm -rf src/generated/prisma', {
            cwd: projectRoot,
            stdio: 'pipe',
         });

         const templates = prismaTemplatesGenerator(config.provider, config.database)!;
         writeFileSync(authFilePath, templates?.authio);
         writeFileSync(prismaInstanceFilePath, templates?.dbInstance);
         writeFileSync(prismaConfigFile, templates.prismaConfig);
      },

      generateSchema: () => {
         execSync('npx @authio/cli generate', {
            cwd: projectRoot,

            stdio: 'pipe',
         });
      },

      migrateDb() {
         if (config.database == 'prisma') {
            execSync('npx prisma generate', {
               cwd: projectRoot,
               stdio: 'pipe',
            });
            execSync('npx prisma db push --force-reset', {
               cwd: projectRoot,
               stdio: 'pipe',
            });
         }

         if (config.database == 'drizzle') {
            execSync('npx drizzle-kit push --force', {
               cwd: projectRoot,
               stdio: 'pipe',
            });
         }
      },

      tearDown() {
         if (config.provider === 'sqlite') return;

         if (config.database == 'prisma') {
            // execSync('npx prisma db drop', {
            //    cwd: projectRoot,
            // });
         }

         if (config.database == 'drizzle') {
            execSync('npx drizzle-kit drop', {
               cwd: projectRoot,
            });
         }

         this.stopDockerContainer();
         console.log('Teardown went Successfull');
      },

      spinUp() {
         console.log(
            `Spinning up server and db's for database: ${config.database} & provider: ${config.provider} `,
         );
         if (config.provider !== 'sqlite') {
            this.startDockerContainer();
            this.waitForDb();

            console.log(`Docker containers for ${config.provider} started`);
         }

         if (config.database == 'drizzle') {
            this.drizzleSetup();
         }

         if (config.database == 'prisma') {
            this.prismaSetup();
         }

         console.log('Successfully generated all required templates');

         this.generateSchema();
         console.log('successfully generated schema');

         this.migrateDb();
         console.log('successfully  executed migrations');

         this.startServer();
         console.log('successfully started node server....');

         return;
      },
   };
}
