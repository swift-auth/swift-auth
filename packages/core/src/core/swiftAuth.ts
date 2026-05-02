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
         cookies: {
            name: result.data.cookies?.name ?? 'swift_auth_session_token',
            secure: result.data.cookies?.secure ?? true,
            domain: setDomain(result.data.cookies?.domain ?? result.data.baseUrl),
            sameSite: result.data.cookies?.sameSite ?? 'lax',
         },
      };
   }
}
/* 
if user did not set any domain in the cookie options then we will take the baseUrl's hostname 
as the domain to set for cookie and in the parameter if already passed a hostname then the catch will just
retuen the same value passed to it
*/
function setDomain(baseUrl: string): string {
   try {
      return new URL(baseUrl).hostname;
   } catch {
      return baseUrl;
   }
}
