import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      include: ['./test/**/*.test.ts'],
      testTimeout: 30000,
      hookTimeout: 60000,
      fileParallelism: false, // ← run one file at a time
      sequence: {
         concurrent: false,
      },
      pool: 'forks',
   },
});
