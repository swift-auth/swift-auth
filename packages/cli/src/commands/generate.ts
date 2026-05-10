import { defineCommand } from 'citty';
import {
   loadConfig,
   validateDefaultConfigPaths,
   validateInputConfigPath,
} from '../utils/configHelpers.js';
import { generateSchema, writeSchemaToFile } from '../utils/schemaHelper.js';

export const generate = defineCommand({
   meta: {
      name: 'generate',
      description: 'Generate authentication database schemas',
   },

   args: {
      config: {
         type: 'string',
         description: 'Relative path to your auth config file',
         required: false,
      },

      output: {
         type: 'string',
         description: 'Custom output path for the generated schema',
         required: false,
      },
   },

   async run({ args }) {
      try {
         let configPath: string | null = null;

         if (args.config) {
            configPath = validateInputConfigPath(args.config);

            if (!configPath) {
               throw new Error(
                  [
                     'Could not find the auth config file.',
                     '',
                     `Checked path: ${args.config}`,
                     '',
                     'Make sure:',
                     '- the file exists',
                     '- the path is relative to your project root',
                     '- the file ends with .ts or .js',
                  ].join('\n'),
               );
            }
         } else {
            configPath = validateDefaultConfigPaths();

            if (!configPath) {
               throw new Error(
                  [
                     'Could not locate your auth config file.',
                     '',
                     'Checked default locations:',
                     '- ./src/lib/auth.ts',
                     '- ./src/lib/auth.js',
                     '- ./lib/auth.ts',
                     '- ./lib/auth.js',
                     '',
                     'You can also explicitly provide one:',
                     '',
                     '  swift-auth generate --config ./path/to/auth.ts',
                  ].join('\n'),
               );
            }
         }

         const config = await loadConfig(configPath);

         if (!config) {
            throw new Error(
               [
                  'Failed to load auth config.',
                  '',
                  'Make sure your config file has a default export.',
                  '',
                  'Example:',
                  '',
                  'export default auth({ ... })',
               ].join('\n'),
            );
         }

         const schema = generateSchema(config);

         if (!schema) {
            throw new Error(
               [
                  'Failed to generate schema.',
                  '',
                  'Unsupported database adapter or provider detected.',
                  '',
                  'Supported adapters:',
                  '- drizzle-adapter',
                  '- prisma-adapter',
                  '',
                  'Supported providers:',
                  '- postgres',
                  '- mysql',
                  '- sqlite',
               ].join('\n'),
            );
         }

         const writtenPath = writeSchemaToFile(args.output, config);

         console.log('');
         console.log('✓ Schema generated successfully');
         console.log('');
         console.log(`Adapter : ${config?.database.id}`);
         console.log(`Provider: ${config?.database.provider}`);
         console.log(`Output  : ${writtenPath}`);
         console.log('');
      } catch (error) {
         console.error('');
         console.error('✗ Failed to generate schema');
         console.error('');

         if (error instanceof Error) {
            console.error(error.message);
         } else {
            console.error('Unknown error occurred');
         }

         console.error('');
         process.exit(1);
      }
   },
});
