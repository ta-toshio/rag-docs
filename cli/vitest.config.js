import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

export default defineConfig({
  test: {
    testTimeout: 30000,
    environment: 'node',
    globals: true,
    env: dotenv.config({ path: ".env.test" }).parsed,
  },
});