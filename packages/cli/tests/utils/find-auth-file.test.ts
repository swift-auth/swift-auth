import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { findAuthFile } from '../../src/utils/find-auth-file.js';
vi.mock('fs');

describe('findAuthFile', () => {
   it('returns a absolute path when path is provided in command args', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = findAuthFile('src/config/auth.ts');

      expect(result).toBe(path.join(process.cwd(), 'src/config/auth.ts'));
   });

   it('returns a common path when path is not provided in command args', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = findAuthFile();

      expect(result).toBe(path.join(process.cwd(), 'src/lib/auth.ts'));
   });

   it('returns undefined when no file is found in all the common paths', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = findAuthFile();

      expect(result).toBeUndefined();
   });

   afterEach(() => {
      vi.restoreAllMocks();
   });
});
