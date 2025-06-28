import { describe, it, expect } from 'vitest';
import {
  PROXY_CONFIG,
  API_ENDPOINTS,
  URL_PATTERNS,
  validatePathRewriting,
  validateUrlsArray,
  VALIDATION_PATTERNS
} from '../test/test-utils';

// Test the proxy configuration logic without importing Vite
describe('Vite Configuration Logic', () => {
  describe('Local Development Configuration', () => {
    it('should have proxy configuration for TASE API via Netlify function', () => {
      const mayaConfig = PROXY_CONFIG['/api/maya'];
      
      expect(mayaConfig).toBeDefined();
      expect(mayaConfig.target).toBe(API_ENDPOINTS.targets.mayaProxy);
      expect(mayaConfig.changeOrigin).toBe(true);
      expect(mayaConfig.secure).toBe(false);
    });

    it('should have proxy configuration for MCP API', () => {
      const mcpConfig = PROXY_CONFIG['/api/mcp'];
      
      expect(mcpConfig).toBeDefined();
      expect(mcpConfig.target).toBe(API_ENDPOINTS.targets.netlifyDev);
      expect(mcpConfig.changeOrigin).toBe(true);
      expect(mcpConfig.secure).toBe(false);
    });

    it('should rewrite TASE API paths correctly', () => {
      validatePathRewriting();
    });

    it('should have correct proxy targets for localhost development', () => {
      expect(PROXY_CONFIG['/api/maya'].target).toMatch(VALIDATION_PATTERNS.mayaProxyPattern);
      expect(PROXY_CONFIG['/api/mcp'].target).toMatch(VALIDATION_PATTERNS.mcpProxyPattern);
    });

    it('should enable changeOrigin for both proxies', () => {
      expect(PROXY_CONFIG['/api/maya'].changeOrigin).toBe(true);
      expect(PROXY_CONFIG['/api/mcp'].changeOrigin).toBe(true);
    });

    it('should disable secure flag for local development', () => {
      expect(PROXY_CONFIG['/api/maya'].secure).toBe(false);
      expect(PROXY_CONFIG['/api/mcp'].secure).toBe(false);
    });
  });

  describe('Deployed Configuration', () => {
    it('should handle deployed API endpoints without proxy', () => {
      const deployedEndpoints = {
        maya: API_ENDPOINTS.prod.mayaApi,
        mcp: API_ENDPOINTS.prod.mcpApi
      };

      expect(deployedEndpoints.maya).toBe('/.netlify/functions/maya-proxy');
      expect(deployedEndpoints.mcp).toBe('/api/mcp');
    });

    it('should construct correct deployed URLs', () => {
      validateUrlsArray(URL_PATTERNS.prod.taseUrls, VALIDATION_PATTERNS.prodApiPattern);
      validateUrlsArray(URL_PATTERNS.prod.mcpUrls, /^\/api/);
    });
  });
}); 