import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.eval.js'],
    testTimeout: 20000,
  },
});
