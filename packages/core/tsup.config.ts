import { defineConfig } from 'tsup';

export default defineConfig({
   entry: ['src/index.ts', 'src/providers/index.ts'],
   format: ['esm', 'cjs'],
   dts: true,
   clean: true,
   sourcemap: true,
});
