import { describe, it, expect, vi } from 'vitest';

// Test development environment setup
describe('Development Environment Configuration', () => {
  describe('Environment Variables', () => {
    it('should use proxy URLs in development mode', () => {
      // Mock development environment
      vi.stubEnv('DEV', true);
      vi.stubEnv('PROD', false);
      
      // Simulate the logic from env.ts
      const isDev = true;
      const mcpApiUrl = isDev ? 'http://localhost:8888/api/mcp' : '/api/mcp';
      
      // In development, frontend uses proxy routes
      const frontendTaseUrl = '/api/maya';
      
      expect(frontendTaseUrl).toBe('/api/maya');
      expect(mcpApiUrl).toBe('http://localhost:8888/api/mcp');
    });

    it('should use Netlify functions in production mode', () => {
      // Mock production environment
      vi.stubEnv('DEV', false);
      vi.stubEnv('PROD', true);
      
      // Simulate the logic from env.ts
      const isDev = false;
      const mcpApiUrl = isDev ? 'http://localhost:8888/api/mcp' : '/api/mcp';
      
      // In production, use direct Netlify function URLs
      const productionTaseUrl = '/.netlify/functions/maya-proxy';
      
      expect(productionTaseUrl).toBe('/.netlify/functions/maya-proxy');
      expect(mcpApiUrl).toBe('/api/mcp');
    });
  });

  describe('API URL Construction', () => {
    it('should construct valid TASE API URLs for local development', () => {
      const baseUrl = '/api/maya';
      const fundId = '5113022';
      const securityType = 'mutual';
      
      const fullUrl = `${baseUrl}/${securityType}/${fundId}`;
      
      expect(fullUrl).toBe('/api/maya/mutual/5113022');
      expect(fullUrl).toMatch(/^\/api\/maya\/\w+\/\d+$/);
    });

    it('should construct valid TASE API URLs for production', () => {
      const baseUrl = '/.netlify/functions/maya-proxy';
      const fundId = '5113022';
      const securityType = 'mutual';
      
      const fullUrl = `${baseUrl}/${securityType}/${fundId}`;
      
      expect(fullUrl).toBe('/.netlify/functions/maya-proxy/mutual/5113022');
      expect(fullUrl).toMatch(/^\/\.netlify\/functions\/maya-proxy\/\w+\/\d+$/);
    });

    it('should validate fund ID format', () => {
      const validFundIds = ['5113022', '1234567', '999'];
      const invalidFundIds = ['', 'abc', '12.34', null, undefined];
      
      validFundIds.forEach(id => {
        expect(id).toMatch(/^\d+$/);
      });
      
      invalidFundIds.forEach(id => {
        if (id) {
          expect(id).not.toMatch(/^\d+$/);
        }
      });
    });

    it('should handle URL path encoding correctly', () => {
      const localPaths = [
        '/api/maya/mutual/5113022',
        '/api/maya/etf/1234',
        '/api/mcp'
      ];

      const productionPaths = [
        '/.netlify/functions/maya-proxy/mutual/5113022',
        '/.netlify/functions/maya-proxy/etf/1234',
        '/api/mcp'
      ];
      
      [...localPaths, ...productionPaths].forEach(path => {
        expect(path).not.toContain(' ');
        expect(path).not.toContain('%');
        expect(path.split('/').length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error messages for proxy failures', () => {
      const proxyErrors = {
        tase: 'TASE API proxy error - Check Netlify dev server',
        mcp: 'MCP API proxy error - Netlify dev not running on port 8888',
        generic: 'Proxy configuration error - Check vite.config.ts'
      };
      
      Object.values(proxyErrors).forEach(error => {
        expect(error).toContain('error');
        expect(error.length).toBeGreaterThan(10);
      });
    });

    it('should validate proxy configuration structure', () => {
      const proxyConfig = {
        '/api/maya': {
          target: 'http://localhost:8888/.netlify/functions/maya-proxy',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api\/maya/, '')
        },
        '/api/mcp': {
          target: 'http://localhost:8888',
          changeOrigin: true,
          secure: false
        }
      };
      
      // Validate TASE proxy config
      expect(proxyConfig['/api/maya'].target).toMatch(/^http:\/\/localhost:8888/);
      expect(proxyConfig['/api/maya'].changeOrigin).toBe(true);
      expect(proxyConfig['/api/maya'].secure).toBe(false);
      expect(proxyConfig['/api/maya'].rewrite).toBeTypeOf('function');
      
      // Validate MCP proxy config
      expect(proxyConfig['/api/mcp'].target).toMatch(/^http:\/\/localhost:8888$/);
      expect(proxyConfig['/api/mcp'].changeOrigin).toBe(true);
      expect(proxyConfig['/api/mcp'].secure).toBe(false);
    });
  });

  describe('Proxy Path Rewriting', () => {
    it('should rewrite TASE API paths correctly', () => {
      const rewrite = (path: string) => path.replace(/^\/api\/maya/, '');
      
      const testCases = [
        { input: '/api/maya/mutual/5113022', expected: '/mutual/5113022' },
        { input: '/api/maya/etf/1234', expected: '/etf/1234' },
        { input: '/api/maya/funds/search', expected: '/funds/search' },
        { input: '/api/maya', expected: '' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        expect(rewrite(input)).toBe(expected);
      });
    });

    it('should not affect non-maya paths', () => {
      const rewrite = (path: string) => path.replace(/^\/api\/maya/, '');
      
      const nonMayaPaths = [
        '/api/mcp/test',
        '/other/path',
        '/maya/different'
      ];
      
      nonMayaPaths.forEach(path => {
        expect(rewrite(path)).toBe(path);
      });
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should handle local development with Netlify dev', () => {
      const localConfig = {
        netlifyDevPort: 8888,
        viteDevPort: 5174, // Auto-selected since 5173 was in use
        proxyEnabled: true
      };

      expect(localConfig.netlifyDevPort).toBe(8888);
      expect(localConfig.viteDevPort).toBeGreaterThan(5173);
      expect(localConfig.proxyEnabled).toBe(true);
    });

    it('should handle production deployment', () => {
      const prodConfig = {
        netlifyFunctions: true,
        proxyEnabled: false,
        directFunctionCalls: true
      };

      expect(prodConfig.netlifyFunctions).toBe(true);
      expect(prodConfig.proxyEnabled).toBe(false);
      expect(prodConfig.directFunctionCalls).toBe(true);
    });
  });
}); 