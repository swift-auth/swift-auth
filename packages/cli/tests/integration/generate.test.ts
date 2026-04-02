import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadAuthConfig } from '../../src/utils/load-auth-file.js';
import { generateDrizzleSchema } from '../../src/generators/drizzle.js';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const filePath = path.resolve(__dirname, '../fixtures/node-project/src/lib/auth.ts');
const outputPath = path.resolve(__dirname, '../fixtures/node-project/src/db/auth-schema.ts');

describe('drizzleGenerateSchema', () => {
   it('should output the drizzle auth schema file', async () => {
      const auth = await loadAuthConfig(filePath);

      const schema = generateDrizzleSchema(auth);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, schema);

      const file = fs.readFileSync(outputPath).toString();
      expect(file).toContain('usersTable');
      expect(file).toContain('verificationTable');
      expect(file).toContain('sessionTable');
   });

   afterEach(() => {
      fs.rmSync(outputPath, { force: true });
   });
});
