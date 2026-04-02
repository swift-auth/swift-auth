import { createJiti } from 'jiti';
import { SwiftAuth } from 'swift-auth';

const jiti = createJiti(import.meta.url);

export async function loadAuthConfig(path: string) {
   const mod: any = await jiti.import(path);

   const auth = mod.default;

   if (!auth) {
      throw new Error('Invalid config: expected `export default { auth: ... }`');
   }

   if (!auth || typeof auth !== 'object' || !('config' in auth)) {
      throw Error('Your auth file must export a SwiftAuth instance as the default export');
   }

   return auth;
}
