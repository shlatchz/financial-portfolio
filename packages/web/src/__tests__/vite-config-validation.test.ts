import { describe, it, expect } from 'vitest';
import {
  getViteConfigPath,
  readViteConfig,
  validateProxyConfigStructure,
  API_ENDPOINTS,
  PORTS
} from '../test/test-utils';
import { existsSync } from 'fs';

describe('Vite Config File Validation', () => {
  it('should have vite.config.ts file present', () => {
    expect(existsSync(getViteConfigPath())).toBe(true);
  });

  it('should contain proxy configuration for TASE API via Netlify function', () => {
    const configContent = readViteConfig();
    
    // Check for proxy configuration presence
    expect(configContent).toContain('proxy:');
    expect(configContent).toContain("'/api/maya':");
    expect(configContent).toContain(API_ENDPOINTS.targets.mayaProxy);
    expect(configContent).toContain('changeOrigin: true');
    expect(configContent).toContain('secure: false');
  });

  it('should contain proxy configuration for MCP API', () => {
    const configContent = readViteConfig();
    
    expect(configContent).toContain("'/api/mcp':");
    expect(configContent).toContain(API_ENDPOINTS.targets.netlifyDev);
    expect(configContent).toContain('changeOrigin: true');
    expect(configContent).toContain('secure: false');
  });

  it('should contain path rewrite function for TASE API', () => {
    const configContent = readViteConfig();
    
    expect(configContent).toContain('rewrite:');
    expect(configContent).toContain('path.replace');
    expect(configContent).toContain('api/maya');
    expect(configContent).toContain('path.replace(/^');
  });

  it('should have correct server port configuration', () => {
    const configContent = readViteConfig();
    
    expect(configContent).toContain('server:');
    expect(configContent).toContain('port:');
    expect(configContent).toContain(String(PORTS.VITE_DEFAULT));
  });

  it('should be valid TypeScript syntax', () => {
    const configContent = readViteConfig();
    
    // Basic syntax checks
    expect(configContent).toContain('import');
    expect(configContent).toContain('defineConfig');
    expect(configContent).toContain('export default');
    
    // No obvious syntax errors
    expect(configContent).not.toContain('undefined,');
    expect(configContent).not.toContain('null,');
  });

  it('should maintain consistent formatting', () => {
    const configContent = readViteConfig();
    
    // Check for consistent indentation and structure
    const lines = configContent.split('\n');
    const proxyStartLine = lines.findIndex(line => line.includes('proxy:'));
    
    if (proxyStartLine > -1) {
      const proxySection = lines.slice(proxyStartLine, proxyStartLine + 15);
      const hasProperIndentation = proxySection.some(line => 
        line.includes("'/api/maya'") && line.trim().startsWith("'/api/maya'")
      );
      expect(hasProperIndentation).toBe(true);
    }
  });

  it('should contain both local development proxy configurations', () => {
    const configContent = readViteConfig();
    
    // Check that both proxy configurations are present
    const proxyConfigs = [
      "'/api/mcp'",
      "'/api/maya'"
    ];
    
    proxyConfigs.forEach(config => {
      expect(configContent).toContain(config);
    });
  });

  it('should target localhost for development', () => {
    const configContent = readViteConfig();
    
    // Both proxies should target localhost:8888
    expect(configContent).toContain(`localhost:${PORTS.NETLIFY_DEV}`);
    expect(configContent).not.toContain('https://maya.tase.co.il');
    expect(configContent).not.toContain('https://mayaapi.tase.co.il');
  });

  describe('Proxy Configuration Structure', () => {
    it('should have correct proxy structure for Maya API', () => {
      const configContent = readViteConfig();
      
      // Check for expected structure elements
      const expectedElements = [
        "'/api/maya'",
        'target:',
        'changeOrigin:',
        'secure:',
        'rewrite:'
      ];
      
      expectedElements.forEach(element => {
        expect(configContent).toContain(element);
      });
    });

    it('should have correct proxy structure for MCP API', () => {
      const configContent = readViteConfig();
      
      // Check for expected structure elements
      const expectedElements = [
        "'/api/mcp'",
        'target:',
        'changeOrigin:',
        'secure:'
      ];
      
      expectedElements.forEach(element => {
        expect(configContent).toContain(element);
      });
    });

    it('should validate proxy configuration structure', () => {
      const configContent = readViteConfig();
      validateProxyConfigStructure(configContent);
    });
  });
}); 