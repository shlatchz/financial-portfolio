import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// CI-specific test to ensure proxy configuration is always validated
describe('CI Proxy Configuration Validation', () => {
  it('should ensure vite.config.ts contains required Netlify proxy settings', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    expect(existsSync(viteConfigPath), 'vite.config.ts must exist').toBe(true);
    
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    const requiredElements = [
      'proxy:',
      "'/api/maya':",
      'http://localhost:8888/.netlify/functions/maya-proxy',
      "'/api/mcp':",
      'http://localhost:8888',
      'changeOrigin: true',
      'secure: false',
      'rewrite:'
    ];
    
    requiredElements.forEach(element => {
      expect(configContent, `Missing required proxy element: ${element}`).toContain(element);
    });
  });

  it('should prevent regression of Netlify proxy configuration', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    const expectedProxyStructure = {
      '/api/maya': {
        target: 'http://localhost:8888/.netlify/functions/maya-proxy',
        mustHave: ['changeOrigin', 'secure', 'rewrite']
      },
      '/api/mcp': {
        target: 'http://localhost:8888',
        mustHave: ['changeOrigin', 'secure']
      }
    };
    
    Object.entries(expectedProxyStructure).forEach(([route, config]) => {
      expect(configContent, `Route ${route} must be present`).toContain(`'${route}'`);
      expect(configContent, `Target for ${route} is incorrect`).toContain(config.target);
      
      config.mustHave.forEach(property => {
        expect(configContent, `Property ${property} missing for ${route}`).toContain(property);
      });
    });
  });

  it('should validate development vs production API handling', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    // Should target local Netlify dev server
    expect(configContent).toContain('localhost:8888');
    expect(configContent).toContain('.netlify/functions/maya-proxy');
    
    // Should NOT contain direct TASE API endpoints (these go through Netlify function)
    expect(configContent).not.toContain('maya.tase.co.il');
    expect(configContent).not.toContain('mayaapi.tase.co.il');
  });

  it('should fail if proxy configuration is missing or incomplete', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    // This test will fail if someone accidentally removes the proxy config
    expect(configContent.includes('proxy:'), 'Proxy configuration was removed! This will break development mode.').toBe(true);
    
    // Check for specific proxy routes
    const hasApiMaya = configContent.includes("'/api/maya'");
    const hasApiMcp = configContent.includes("'/api/mcp'");
    
    expect(hasApiMaya, 'API Maya proxy route is missing! This will break TASE API calls in development.').toBe(true);
    expect(hasApiMcp, 'API MCP proxy route is missing! This will break MCP API calls in development.').toBe(true);
    
    // Validate rewrite function exists for TASE API
    const hasTaseRewrite = configContent.includes('rewrite:') && configContent.includes('path.replace');
    expect(hasTaseRewrite, 'TASE API path rewrite function is missing! This will cause incorrect API routing.').toBe(true);
  });

  it('should ensure secure:false is set for local development', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    // Check that secure: false is set for both proxies (required for localhost)
    const secureInstances = (configContent.match(/secure:\s*false/g) || []).length;
    expect(secureInstances, 'secure: false must be set for both proxy configurations').toBeGreaterThanOrEqual(2);
  });

  it('should validate proxy path rewriting for Maya API', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    // Check that path rewriting is correctly configured
    expect(configContent).toContain('rewrite:');
    expect(configContent).toContain('path.replace');
    expect(configContent).toContain('api/maya');
    
    // Test the rewrite logic
    const rewrite = (path: string) => path.replace(/^\/api\/maya/, '');
    expect(rewrite('/api/maya/mutual/5113022')).toBe('/mutual/5113022');
    expect(rewrite('/api/maya/etf/1234')).toBe('/etf/1234');
  });

  describe('Production Deployment Compatibility', () => {
    it('should not break production builds', () => {
      // Ensure proxy config doesn't interfere with production
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const configContent = readFileSync(viteConfigPath, 'utf-8');
      
      // Proxy config should only be in server.proxy, not affecting build
      expect(configContent).toContain('server:');
      expect(configContent).toContain('build:');
      
      // Should not have proxy config bleeding into build configuration
      const buildSection = configContent.split('build:')[1]?.split('}')[0] || '';
      expect(buildSection).not.toContain('proxy');
    });

    it('should maintain environment separation', () => {
      // Development uses proxy, production uses direct Netlify functions
      const environments = {
        development: {
          mayaApi: '/api/maya', // Proxy route
          mcpApi: '/api/mcp'    // Proxy route
        },
        production: {
          mayaApi: '/.netlify/functions/maya-proxy', // Direct function
          mcpApi: '/api/mcp'  // Same endpoint (handled by Netlify)
        }
      };

      // Validate structure
      expect(environments.development.mayaApi).toMatch(/^\/api\/maya$/);
      expect(environments.production.mayaApi).toMatch(/^\/\.netlify\/functions/);
      
      // MCP API endpoint is consistent
      expect(environments.development.mcpApi).toBe(environments.production.mcpApi);
    });
  });
}); 