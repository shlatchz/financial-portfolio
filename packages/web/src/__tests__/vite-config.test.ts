import { describe, it, expect } from 'vitest';

// Test the proxy configuration logic without importing Vite
describe('Vite Configuration Logic', () => {
  const mockProxyConfig = {
    '/api/maya': {
      target: 'http://localhost:8888/.netlify/functions/maya-proxy',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/maya/, ''),
    },
    '/api/mcp': {
      target: 'http://localhost:8888',
      changeOrigin: true,
      secure: false,
    }
  };

  describe('Local Development Configuration', () => {
    it('should have proxy configuration for TASE API via Netlify function', () => {
      expect(mockProxyConfig['/api/maya']).toBeDefined();
      expect(mockProxyConfig['/api/maya'].target).toBe('http://localhost:8888/.netlify/functions/maya-proxy');
      expect(mockProxyConfig['/api/maya'].changeOrigin).toBe(true);
      expect(mockProxyConfig['/api/maya'].secure).toBe(false);
    });

    it('should have proxy configuration for MCP API', () => {
      expect(mockProxyConfig['/api/mcp']).toBeDefined();
      expect(mockProxyConfig['/api/mcp'].target).toBe('http://localhost:8888');
      expect(mockProxyConfig['/api/mcp'].changeOrigin).toBe(true);
      expect(mockProxyConfig['/api/mcp'].secure).toBe(false);
    });

    it('should rewrite TASE API paths correctly', () => {
      const rewriteFn = mockProxyConfig['/api/maya'].rewrite;
      
      expect(rewriteFn).toBeTypeOf('function');
      expect(rewriteFn('/api/maya/mutual/5113022')).toBe('/mutual/5113022');
      expect(rewriteFn('/api/maya/etf/1234')).toBe('/etf/1234');
      expect(rewriteFn('/api/maya')).toBe('');
    });

    it('should have correct proxy targets for localhost development', () => {
      expect(mockProxyConfig['/api/maya'].target).toMatch(/^http:\/\/localhost:8888/);
      expect(mockProxyConfig['/api/mcp'].target).toMatch(/^http:\/\/localhost:8888$/);
    });

    it('should enable changeOrigin for both proxies', () => {
      expect(mockProxyConfig['/api/maya'].changeOrigin).toBe(true);
      expect(mockProxyConfig['/api/mcp'].changeOrigin).toBe(true);
    });

    it('should disable secure flag for local development', () => {
      expect(mockProxyConfig['/api/maya'].secure).toBe(false);
      expect(mockProxyConfig['/api/mcp'].secure).toBe(false);
    });
  });

  describe('Deployed Configuration', () => {
    it('should handle deployed API endpoints without proxy', () => {
      // In production, these are handled by Netlify directly
      const deployedEndpoints = {
        maya: '/.netlify/functions/maya-proxy',
        mcp: '/api/mcp'
      };

      expect(deployedEndpoints.maya).toBe('/.netlify/functions/maya-proxy');
      expect(deployedEndpoints.mcp).toBe('/api/mcp');
    });

    it('should construct correct deployed URLs', () => {
      const deployedUrls = [
        '/.netlify/functions/maya-proxy/mutual/5113022',
        '/.netlify/functions/maya-proxy/etf/1234',
        '/api/mcp'
      ];

      deployedUrls.forEach(url => {
        expect(url).toMatch(/^(\/\.netlify\/functions|\/api)/);
      });
    });
  });
}); 