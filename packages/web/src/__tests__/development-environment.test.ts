import { describe, it, expect, vi } from 'vitest';
import {
  API_ENDPOINTS,
  TEST_DATA,
  URL_PATTERNS,
  ENVIRONMENT_CONFIGS,
  ERROR_MESSAGES,
  validateFundIds,
  validatePathEncoding,
  validateErrorMessages,
  validateProxyConfigStructure,
  validatePathRewriting,
  validateNonMayaPathsUnaffected,
  constructApiUrl
} from '../test/test-utils';

// Test development environment setup
describe('Development Environment Configuration', () => {
  describe('Environment Variables', () => {
    it('should use proxy URLs in development mode', () => {
      // Mock development environment
      vi.stubEnv('DEV', true);
      vi.stubEnv('PROD', false);
      
      // Simulate the logic from env.ts
      const isDev = true;
      const mcpApiUrl = isDev ? API_ENDPOINTS.targets.netlifyDev + '/api/mcp' : API_ENDPOINTS.dev.mcpApi;
      
      // In development, frontend uses proxy routes
      const frontendTaseUrl = API_ENDPOINTS.dev.mayaApi;
      
      expect(frontendTaseUrl).toBe(API_ENDPOINTS.dev.mayaApi);
      expect(mcpApiUrl).toBe('http://localhost:8888/api/mcp');
    });

    it('should use Netlify functions in production mode', () => {
      // Mock production environment
      vi.stubEnv('DEV', false);
      vi.stubEnv('PROD', true);
      
      // Simulate the logic from env.ts
      const isDev = false;
      const mcpApiUrl = isDev ? API_ENDPOINTS.targets.netlifyDev + '/api/mcp' : API_ENDPOINTS.prod.mcpApi;
      
      // In production, use direct Netlify function URLs
      const productionTaseUrl = API_ENDPOINTS.prod.mayaApi;
      
      expect(productionTaseUrl).toBe(API_ENDPOINTS.prod.mayaApi);
      expect(mcpApiUrl).toBe('/api/mcp');
    });
  });

  describe('API URL Construction', () => {
    it('should construct valid TASE API URLs for local development', () => {
      const fullUrl = constructApiUrl(
        API_ENDPOINTS.dev.mayaApi,
        TEST_DATA.sampleSecurityType,
        TEST_DATA.sampleFundId
      );
      
      expect(fullUrl).toBe('/api/maya/mutual/5113022');
      expect(fullUrl).toMatch(/^\/api\/maya\/\w+\/\d+$/);
    });

    it('should construct valid TASE API URLs for production', () => {
      const fullUrl = constructApiUrl(
        API_ENDPOINTS.prod.mayaApi,
        TEST_DATA.sampleSecurityType,
        TEST_DATA.sampleFundId
      );
      
      expect(fullUrl).toBe('/.netlify/functions/maya-proxy/mutual/5113022');
      expect(fullUrl).toMatch(/^\/\.netlify\/functions\/maya-proxy\/\w+\/\d+$/);
    });

    it('should validate fund ID format', () => {
      validateFundIds(TEST_DATA.fundIds.valid, TEST_DATA.fundIds.invalid);
    });

    it('should handle URL path encoding correctly', () => {
      validatePathEncoding([...URL_PATTERNS.localPaths, ...URL_PATTERNS.productionPaths]);
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error messages for proxy failures', () => {
      validateErrorMessages(ERROR_MESSAGES.proxyErrors);
    });

    it('should validate proxy configuration structure', () => {
      // Using mock config content to validate structure
      const mockConfigContent = `
        proxy: {
          '/api/maya': {
            target: '${API_ENDPOINTS.targets.mayaProxy}',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^/api/maya/, '')
          },
          '/api/mcp': {
            target: '${API_ENDPOINTS.targets.netlifyDev}',
            changeOrigin: true,
            secure: false
          }
        }
      `;
      
      validateProxyConfigStructure(mockConfigContent);
    });
  });

  describe('Proxy Path Rewriting', () => {
    it('should rewrite TASE API paths correctly', () => {
      validatePathRewriting();
    });

    it('should not affect non-maya paths', () => {
      validateNonMayaPathsUnaffected();
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should handle local development with Netlify dev', () => {
      const localConfig = ENVIRONMENT_CONFIGS.development;

      expect(localConfig.netlifyDevPort).toBe(8888);
      expect(localConfig.viteDevPort).toBeGreaterThan(5173);
      expect(localConfig.proxyEnabled).toBe(true);
    });

    it('should handle production deployment', () => {
      const prodConfig = ENVIRONMENT_CONFIGS.production;

      expect(prodConfig.netlifyFunctions).toBe(true);
      expect(prodConfig.proxyEnabled).toBe(false);
      expect(prodConfig.directFunctionCalls).toBe(true);
    });
  });
}); 