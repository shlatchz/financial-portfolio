/// <reference types="vitest" />
import { createVitestConfig, reactEnvironmentConfig } from '../../vitest.config.shared';
import react from '@vitejs/plugin-react';

export default createVitestConfig({
  plugins: [react()],
  test: {
    ...reactEnvironmentConfig.test,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/test/**' // Web-specific exclusion for test utilities
      ]
    }
  },
}); 