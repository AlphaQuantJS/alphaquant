import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.test.{js,mjs}', '**/*.{spec,test}.{js,mjs}'],
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
});
