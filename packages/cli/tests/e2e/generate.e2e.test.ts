import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, afterEach } from 'vitest';

// same pattern you used in integration test
// gives you absolute path of THIS test file's folder
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// absolute path to the fixture project folder
const fixturePath = path.resolve(__dirname, '../fixtures/node-project');

// absolute path to the CLI binary
const cliPath = path.resolve(__dirname, '../../dist/index.js');

let generatedFile: string;

describe('generate command e2e', () => {
   afterEach(() => {
      if (generatedFile && fs.existsSync(generatedFile)) {
         fs.rmSync(generatedFile, { force: true });
      }
   });

   it('generates schema with no flags', () => {
      generatedFile = path.resolve(fixturePath, 'src/db/auth-schema.ts');

      execSync(`node ${cliPath} generate`, {
         cwd: fixturePath,
         stdio: 'pipe',
      });

      expect(fs.existsSync(generatedFile)).toBe(true);

      const content = fs.readFileSync(generatedFile, 'utf-8');
      expect(content).toContain('usersTable');
      expect(content).toContain('sessionTable');
      expect(content).toContain('verificationTable');
   });

   it('generates schema with only the path flag', () => {
      generatedFile = path.resolve(fixturePath, 'src/db/auth-schema.ts');

      execSync(`node ${cliPath} generate --path ./src/lib/auth.ts`, {
         cwd: fixturePath,
         stdio: 'pipe',
      });

      expect(fs.existsSync(generatedFile)).toBe(true);

      const content = fs.readFileSync(generatedFile, 'utf-8');
      expect(content).toContain('usersTable');
      expect(content).toContain('sessionTable');
      expect(content).toContain('verificationTable');
   });

   it('generates schema with only the output flag', () => {
      generatedFile = path.resolve(fixturePath, 'src/config/userSchema.ts');

      execSync(`node ${cliPath} generate --output ./src/config/userSchema.ts`, {
         cwd: fixturePath,
         stdio: 'pipe',
      });

      expect(fs.existsSync(generatedFile)).toBe(true);

      const content = fs.readFileSync(generatedFile, 'utf-8');
      expect(content).toContain('usersTable');
      expect(content).toContain('sessionTable');
      expect(content).toContain('verificationTable');
   });

   it('generates schema with both path and output flag', () => {
      generatedFile = path.resolve(fixturePath, 'src/db/auth-schema.ts');

      execSync(
         `node ${cliPath} generate --path ./src/lib/auth.ts  --output ./src/db/auth-schema.ts`,
         {
            cwd: fixturePath,
            stdio: 'pipe',
         },
      );

      expect(fs.existsSync(generatedFile)).toBe(true);

      const content = fs.readFileSync(generatedFile, 'utf-8');
      expect(content).toContain('usersTable');
      expect(content).toContain('sessionTable');
      expect(content).toContain('verificationTable');
   });

   it('throws error when common path is doesnt exist', () => {
      expect(() => {
         execSync(`node ${cliPath} generate --path nothjinh`, {
            cwd: fixturePath,
            stdio: 'pipe',
         });
      }).toThrow();
   });
});
