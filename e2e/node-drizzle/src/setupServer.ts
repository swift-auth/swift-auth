import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { drizzleTemplatesGenerator } from './utils/drizzleTemplates.js';
import { prismaTemplatesGenerator } from './utils/prismaTemplates.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface SetupServerConfigType {
   database: 'prisma' | 'drizzle';
   provider: 'postgres' | 'mysql' | 'sqlite';
}

export function setupNodeServer(config: SetupServerConfigType) {
   const projectRoot = path.resolve(import.meta.dirname, '..');
   const authFilePath = path.resolve(import.meta.dirname, 'lib/auth.ts');
   const drizzleDbPath = path.resolve(import.meta.dirname, 'db/index.ts');
   const drizzleConfigFile = path.join(projectRoot, 'drizzle.config.ts');
   const repoRoot = path.resolve(import.meta.dirname, '../../../');
   const prismaInstanceFilePath = path.resolve(projectRoot, 'src/lib/prisma.ts');
   const prismaConfigFile = path.resolve(projectRoot, 'prisma.config.ts');

   let server: any;

   return {
      async startDockerContainer() {
         await execAsync('docker compose up -d --wait', {
            cwd: repoRoot,
         });
      },

      async stopDockerContainer() {
         await execAsync('docker compose down', {
            cwd: repoRoot,
         });
      },

      async waitForDb() {
         const maxRetries = 30;

         for (let i = 0; i < maxRetries; i++) {
            try {
               if (config.provider === 'postgres') {
                  await execAsync('docker compose exec postgres pg_isready -U postgres', {
                     cwd: repoRoot,
                  });
               } else if (config.provider === 'mysql') {
                  await execAsync(
                     'docker compose exec mysql mysqladmin ping -h localhost --silent',
                     {
                        cwd: repoRoot,
                     },
                  );
               }

               return;
            } catch {
               await new Promise((resolve) => setTimeout(resolve, 1000));
            }
         }

         throw new Error('Database did not become ready in time');
      },

      async startServer() {
         const { default: app } = await import('./index.js');

         server = app.listen(process.env.PORT!, () => {
            console.log(`Server listening on ${process.env.PORT}`);
         });
      },

      async drizzleSetup() {
         const templates = drizzleTemplatesGenerator(config.provider, config.database)!;

         await Promise.all([
            writeFile(authFilePath, templates.authTemplate),
            writeFile(drizzleDbPath, templates.dbTemplate),
            writeFile(drizzleConfigFile, templates.configTemplate),
         ]);
      },

      async prismaSetup() {
         const templates = prismaTemplatesGenerator(config.provider, config.database)!;

         await Promise.all([
            writeFile(authFilePath, templates.authio),
            writeFile(prismaInstanceFilePath, templates.dbInstance),
            writeFile(prismaConfigFile, templates.prismaConfig),
         ]);
      },

      async generateSchema() {
         await execAsync('npx @authio/cli generate', {
            cwd: projectRoot,
         });
      },

      async migrateDb() {
         if (config.database === 'prisma') {
            console.log('generated');

            await execAsync('npx prisma generate', {
               cwd: projectRoot,
            });

            await execAsync('npx prisma db push', {
               cwd: projectRoot,
            });
         }

         if (config.database === 'drizzle') {
            await execAsync('npx drizzle-kit push --force', {
               cwd: projectRoot,
            });
         }
      },

      async tearDown() {
         if (server) {
            await new Promise<void>((resolve, reject) => {
               server.close((err?: Error) => {
                  if (err) return reject(err);

                  console.log('Server closed and all active connections finished.');

                  resolve();
               });
            });
         }

         if (config.provider === 'sqlite') {
            return;
         }

         if (config.database === 'drizzle') {
            await execAsync('npx drizzle-kit drop', {
               cwd: projectRoot,
            });
         }

         await this.stopDockerContainer();

         console.log('Teardown went Successful');
      },

      async spinUp() {
         console.log(
            `Spinning up server and db's for database: ${config.database} & provider: ${config.provider}`,
         );

         if (config.provider !== 'sqlite') {
            await this.startDockerContainer();
            await this.waitForDb();

            console.log(`Docker containers for ${config.provider} started`);
         }

         if (config.database === 'drizzle') {
            await this.drizzleSetup();
         }

         if (config.database === 'prisma') {
            await this.prismaSetup();
         }

         console.log('Successfully generated all required templates');

         await this.generateSchema();
         console.log('successfully generated schema');

         await this.migrateDb();
         console.log('successfully executed migrations');

         await this.startServer();
         console.log('successfully started node server....');
      },
   };
}
