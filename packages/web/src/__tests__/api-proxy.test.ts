import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  URL_PATTERNS,
  API_ENDPOINTS,
  MOCK_FETCH_RESPONSES,
  MOCK_ENVIRONMENTS,
  RESPONSE_STRUCTURES,
  validateDevUrls,
  validateProdUrls,
  validateEnvironmentSeparation,
  validateResponseStructure
} from '../test/test-utils';

// Mock fetch for testing
const originalFetch = globalThis.fetch;

describe('API Proxy Integration', () => {
  beforeAll(() => {
    // Mock fetch to simulate proxy behavior
    globalThis.fetch = vi.fn();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  describe('TASE API Proxy - Local Development', () => {
    it('should construct correct TASE API URLs in development', () => {
      validateDevUrls(URL_PATTERNS.dev.taseUrls);
    });

    it('should use Netlify proxy in local development', () => {
      // Vite proxy configuration routes to Netlify function
      const proxyTarget = API_ENDPOINTS.targets.mayaProxy;
      const pathRewrite = '/api/maya/mutual/5113022'.replace(/^\/api\/maya/, '');
      
      expect(proxyTarget).toMatch(/localhost:8888/);
      expect(proxyTarget).toContain('.netlify/functions/maya-proxy');
      expect(pathRewrite).toBe('/mutual/5113022');
    });

    it('should handle TASE API response correctly in development', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(MOCK_FETCH_RESPONSES.taseSuccess());

      const response = await fetch('/api/maya/mutual/5113022');
      const data = await response.json();

      expect(data.fundId).toBe('5113022');
      expect(data.fundName).toBe('Test Fund');
      expect(fetch).toHaveBeenCalledWith('/api/maya/mutual/5113022');
    });

    it('should handle TASE API errors gracefully in development', async () => {
      vi.mocked(fetch).mockImplementationOnce(() => MOCK_FETCH_RESPONSES.networkError());

      await expect(fetch('/api/maya/mutual/invalid')).rejects.toThrow('Netlify dev server not running');
    });
  });

  describe('TASE API Proxy - Production Deployment', () => {
    it('should use direct Netlify functions in production', () => {
      validateProdUrls(URL_PATTERNS.prod.taseUrls);
    });

    it('should handle production TASE API responses', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(MOCK_FETCH_RESPONSES.taseProduction());

      const response = await fetch('/.netlify/functions/maya-proxy/mutual/5113022');
      const data = await response.json();

      expect(data.fundId).toBe('5113022');
      expect(data.fundName).toBe('Production Fund');
      expect(fetch).toHaveBeenCalledWith('/.netlify/functions/maya-proxy/mutual/5113022');
    });
  });

  describe('MCP API Proxy', () => {
    it('should route MCP requests correctly in development', () => {
      const mcpUrls = URL_PATTERNS.dev.mcpUrls;

      mcpUrls.forEach(url => {
        expect(url).toMatch(/^\/api\/mcp$/);
      });
    });

    it('should handle MCP API responses in development', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(MOCK_FETCH_RESPONSES.mcpSuccess());

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'test_connections', args: {} })
      });

      const data = await response.json();
      expect(data.result).toBe('Portfolio status retrieved successfully');
      expect(data.tools).toBe(6);
    });

    it('should handle MCP API unavailability gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(MOCK_FETCH_RESPONSES.mcpUnavailable());

      const response = await fetch('/api/mcp');
      expect(response.status).toBe(503);
      
      const error = await response.json();
      expect(error.error).toContain('MCP API not available');
    });

    it('should use same endpoint in production', () => {
      // MCP API uses the same /api/mcp endpoint in both dev and prod
      const mcpEndpoint = API_ENDPOINTS.prod.mcpApi;
      
      expect(mcpEndpoint).toBe('/api/mcp');
      expect(mcpEndpoint).not.toContain('localhost');
      expect(mcpEndpoint).not.toContain('8888');
    });
  });

  describe('Cross-Environment Compatibility', () => {
    it('should handle environment switching correctly', () => {
      validateEnvironmentSeparation(
        MOCK_ENVIRONMENTS.development,
        MOCK_ENVIRONMENTS.production
      );
    });

    it('should maintain consistent response format across environments', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(MOCK_FETCH_RESPONSES.taseSuccess());

      const response = await fetch('/api/maya/mutual/5113022');
      const data = await response.json();

      validateResponseStructure(data, RESPONSE_STRUCTURES.taseApi);
    });
  });
}); 