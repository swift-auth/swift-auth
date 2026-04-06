import { SwiftAuthConfig } from '../types/config.js';
import { ParsedSwiftAuthConfig, SwiftAuthConfigSchema } from '../validator/config.validator.js';

export class SwiftAuth {
   readonly config: ParsedSwiftAuthConfig;

   constructor(config: SwiftAuthConfig) {
      const { database, socialProviders } = config;

      if (!database) {
         throw Error('Database adapter is not defined');
      }

      const result = SwiftAuthConfigSchema.safeParse(config);

      if (result.error) {
         let errorMessage = '';
         let count = 1;
         for (const issue of result.error.issues) {
            errorMessage += `ERROR ${count} :${issue.path.join('.')} ${issue.message}\n`;
            count++;
         }
         throw Error(errorMessage);
      }

      this.config = {
         database,
         ...result.data,
         socialProviders,
      };
   }
}
