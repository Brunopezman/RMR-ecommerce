import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['server/__tests__/**/*.test.{ts,js}'],
    // 30s timeout for integration tests (PostgreSQL connection, dual-backend)
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Do not force exit — let Vitest handle cleanup naturally
    teardownTimeout: 10_000,
  },
});
