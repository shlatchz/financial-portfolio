/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest configuration for the portfolio management monorepo
 * This base configuration can be extended by individual packages
 */
export const createVitestConfig = (overrides: Parameters<typeof defineConfig>[0] = {}) => {
  return defineConfig({
    test: {
      globals: true,
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude: ['node_modules', 'dist'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.d.ts',
          '**/*.config.*',
        ]
      },
      ...overrides.test
    },
    ...overrides
  });
};

// Common configurations for different environments
export const nodeEnvironmentConfig = {
  test: {
    environment: 'node' as const,
  }
};

export const reactEnvironmentConfig = {
  test: {
    environment: 'jsdom' as const,
    setupFiles: ['./src/test/setup.ts'],
    globals: true, // Ensure globals are enabled for React testing
  }
}; 