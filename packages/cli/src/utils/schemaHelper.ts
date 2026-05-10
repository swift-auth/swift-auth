import fs from 'fs';
import path from 'path';

import { generateDrizzleSchema } from '../generators/drizzle.js';
import { generatePrismaSchema } from '../generators/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateSchema(config: any) {
   if (config.database.id === 'drizzle-adapter') {
      return generateDrizzleSchema(config.database.provider);
   }

   if (config.database.id === 'prisma-adapter') {
      return generatePrismaSchema(config.database.provider);
   }

   return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeSchemaToFile(providedPath?: string, config?: any) {
   if (!config) {
      throw new Error('Config is required');
   }

   const schema = generateSchema(config);

   if (!schema) {
      throw new Error('Could not generate schema');
   }

   let targetPath: string;

   // user explicitly provided a path
   if (providedPath) {
      targetPath = path.resolve(process.cwd(), providedPath);
   } else {
      // default conventional paths
      if (config.database.id === 'prisma-adapter') {
         targetPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
      } else if (config.database.id === 'drizzle-adapter') {
         targetPath = path.resolve(process.cwd(), 'src/db/schema.ts');
      } else {
         throw new Error('Unsupported adapter');
      }
   }

   // ensure directory exists
   fs.mkdirSync(path.dirname(targetPath), { recursive: true });

   // write schema
   fs.writeFileSync(targetPath, schema, 'utf-8');

   return targetPath;
}
