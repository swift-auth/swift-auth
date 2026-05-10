import { describe, expect, it } from 'vitest';
import path from 'path';

import { loadConfig } from '../../src/utils/configHelpers.js';

describe('loadConfig', () => {
   it('loads a real SwiftAuth config instance', async () => {
      const filePath = path.resolve(process.cwd(), 'tests/fixtures/auth.ts');

      const config = await loadConfig(filePath);
      expect(config).toBeDefined();

      expect(config.baseUrl).toBe('http://test.com');

      expect(config.database.provider).toBe('postgres');
      expect(config.database.id).toBe('drizzle-adapter');
   });
});
