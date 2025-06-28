import { describe, it, expect } from 'vitest';
import {
  readViteConfig,
  validateRequiredConfigElements,
  validateProxyConfigRegression,
  validateConfigurationMissing,
  validateSecurityConfiguration,
  validateBuildConfiguration,
  validateEnvironmentSeparation,
  ENVIRONMENT_CONFIGS,
  REWRITE_TEST_CASES
} from '../test/test-utils';
import { existsSync } from 'fs';
import { join } from 'path';

// CI-specific test to ensure proxy configuration is always validated
describe('CI Proxy Configuration Validation', () => {
  it('should ensure vite.config.ts contains required Netlify proxy settings', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    expect(existsSync(viteConfigPath), 'vite.config.ts must exist').toBe(true);
    
    const configContent = readViteConfig();
    validateRequiredConfigElements(configContent);
  });

  it('should prevent regression of Netlify proxy configuration', () => {
    const configContent = readViteConfig();
    validateProxyConfigRegression(configContent);
  });

  it('should validate development vs production API handling', () => {
    const configContent = readViteConfig();
    
    // Should target local Netlify dev server
    expect(configContent).toContain('localhost:8888');
    expect(configContent).toContain('.netlify/functions/maya-proxy');
    
    // Should NOT contain direct TASE API endpoints (these go through Netlify function)
    expect(configContent).not.toContain('maya.tase.co.il');
    expect(configContent).not.toContain('mayaapi.tase.co.il');
  });

  it('should fail if proxy configuration is missing or incomplete', () => {
    const configContent = readViteConfig();
    validateConfigurationMissing(configContent);
  });

  it('should ensure secure:false is set for local development', () => {
    const configContent = readViteConfig();
    validateSecurityConfiguration(configContent);
  });

  it('should validate proxy path rewriting for Maya API', () => {
    const configContent = readViteConfig();
    
    // Check that path rewriting is correctly configured
    expect(configContent).toContain('rewrite:');
    expect(configContent).toContain('path.replace');
    expect(configContent).toContain('api/maya');
    
    // Test the rewrite logic using shared test cases
    const rewrite = (path: string) => path.replace(/^\/api\/maya/, '');
    REWRITE_TEST_CASES.forEach(({ input, expected }) => {
      expect(rewrite(input)).toBe(expected);
    });
  });

  describe('Production Deployment Compatibility', () => {
    it('should not break production builds', () => {
      const configContent = readViteConfig();
      validateBuildConfiguration(configContent);
    });

    it('should maintain environment separation', () => {
      validateEnvironmentSeparation(
        {
          mayaApi: ENVIRONMENT_CONFIGS.development.mayaApi,
          mcpApi: ENVIRONMENT_CONFIGS.development.mcpApi
        },
        {
          mayaApi: ENVIRONMENT_CONFIGS.production.mayaApi,
          mcpApi: ENVIRONMENT_CONFIGS.production.mcpApi
        }
      );
    });
  });
}); 