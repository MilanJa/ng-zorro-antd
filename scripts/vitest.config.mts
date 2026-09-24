import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/__tests__/**/*.spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false
  }
});
