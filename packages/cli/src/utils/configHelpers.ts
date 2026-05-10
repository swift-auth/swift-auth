import path from 'path';
import fs from 'fs';
import type { Authio, AuthioConfig } from '@authio/core';

import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const default_paths = ['./src/lib/auth.ts', './src/lib/auth.js', './lib/auth.ts', './lib/auth.js'];

//when input file path is not provided we will look for some default paths
export function validateDefaultConfigPaths() {
   for (const p of default_paths) {
      const fullpath = path.resolve(process.cwd(), p);

      const file = fs.existsSync(fullpath);
      if (file) return fullpath;
   }

   return null;
}
//if user explicitly provided a config file path we will look for the the existence of the file
export function validateInputConfigPath(relativePath: string) {
   const fullPath = path.resolve(process.cwd(), relativePath);
   if (fs.existsSync(fullPath)) {
      return fullPath;
   }
   return null;
}
// user should do default export of the config otherwise throw error from the cli
export async function loadConfig(configPath: string) {
   const mod = (await jiti.import(configPath)) as { default?: Authio };
   if (!mod?.default) {
      return null;
   }
   return mod.default.config as AuthioConfig;
}
