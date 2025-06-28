/// <reference types="vitest" />
import { createVitestConfig, nodeEnvironmentConfig } from '../../vitest.config.shared';

export default createVitestConfig({
  ...nodeEnvironmentConfig
}); 