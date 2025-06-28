/// <reference types="vitest" />
import { createVitestConfig, nodeEnvironmentConfig } from '../../vitest.config.shared';

export default createVitestConfig({
  ...nodeEnvironmentConfig,
  test: {
    ...nodeEnvironmentConfig.test,
    include: ['src/**/*.{test,spec}.{js,ts}'], // Node-specific file extensions
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/fix-extensions.js' // Core-specific exclusion
      ]
    }
  }
}); 