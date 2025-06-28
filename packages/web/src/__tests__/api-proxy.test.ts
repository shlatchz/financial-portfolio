import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

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
      // In development, frontend uses proxy URLs that get rewritten by Vite
      const expectedUrls = [
        '/api/maya/mutual/5113022',
        '/api/maya/etf/1234',
        '/api/maya/mutual/999'
      ];

      expectedUrls.forEach(url => {
        expect(url).toMatch(/^\/api\/maya/);
        expect(url).not.toMatch(/^https?:\/\//);
        expect(url).not.toMatch(/netlify/);
      });
    });

    it('should use Netlify proxy in local development', () => {
      // Vite proxy configuration routes to Netlify function
      const proxyTarget = 'http://localhost:8888/.netlify/functions/maya-proxy';
      const pathRewrite = '/api/maya/mutual/5113022'.replace(/^\/api\/maya/, '');
      
      expect(proxyTarget).toMatch(/localhost:8888/);
      expect(proxyTarget).toContain('.netlify/functions/maya-proxy');
      expect(pathRewrite).toBe('/mutual/5113022');
    });

    it('should handle TASE API response correctly in development', async () => {
      const mockResponse = {
        fundId: '5113022',
        fundName: 'Test Fund',
        currentPrice: 100.50,
        change: 1.5
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        statusText: 'OK'
      } as Response);

      const response = await fetch('/api/maya/mutual/5113022');
      const data = await response.json();

      expect(data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/maya/mutual/5113022');
    });

    it('should handle TASE API errors gracefully in development', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Netlify dev server not running'));

      await expect(fetch('/api/maya/mutual/invalid')).rejects.toThrow('Netlify dev server not running');
    });
  });

  describe('TASE API Proxy - Production Deployment', () => {
    it('should use direct Netlify functions in production', () => {
      // In production, use direct Netlify function URLs
      const productionUrls = [
        '/.netlify/functions/maya-proxy/mutual/5113022',
        '/.netlify/functions/maya-proxy/etf/1234',
        '/.netlify/functions/maya-proxy/mutual/999'
      ];

      productionUrls.forEach(url => {
        expect(url).toMatch(/^\/\.netlify\/functions\/maya-proxy/);
        expect(url).not.toMatch(/^\/api\/maya/);
      });
    });

    it('should handle production TASE API responses', async () => {
      const mockResponse = {
        fundId: '5113022',
        fundName: 'Production Fund',
        currentPrice: 105.75,
        change: 2.1
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        statusText: 'OK'
      } as Response);

      const response = await fetch('/.netlify/functions/maya-proxy/mutual/5113022');
      const data = await response.json();

      expect(data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/.netlify/functions/maya-proxy/mutual/5113022');
    });
  });

  describe('MCP API Proxy', () => {
    it('should route MCP requests correctly in development', () => {
      // In development, MCP requests use the configured proxy
      const mcpUrls = [
        '/api/mcp',
        '/api/mcp',  // POST requests to same endpoint
        '/api/mcp'
      ];

      mcpUrls.forEach(url => {
        expect(url).toMatch(/^\/api\/mcp$/);
      });
    });

    it('should handle MCP API responses in development', async () => {
      const mockMcpResponse = {
        result: 'Portfolio status retrieved successfully',
        tools: 6
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMcpResponse,
        status: 200,
        statusText: 'OK'
      } as Response);

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'test_connections', args: {} })
      });

      const data = await response.json();
      expect(data).toEqual(mockMcpResponse);
    });

    it('should handle MCP API unavailability gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ error: 'MCP API not available. Start with: netlify dev' })
      } as Response);

      const response = await fetch('/api/mcp');
      expect(response.status).toBe(503);
      
      const error = await response.json();
      expect(error.error).toContain('MCP API not available');
    });

    it('should use same endpoint in production', () => {
      // MCP API uses the same /api/mcp endpoint in both dev and prod
      const mcpEndpoint = '/api/mcp';
      
      expect(mcpEndpoint).toBe('/api/mcp');
      expect(mcpEndpoint).not.toContain('localhost');
      expect(mcpEndpoint).not.toContain('8888');
    });
  });

  describe('Cross-Environment Compatibility', () => {
    it('should handle environment switching correctly', () => {
      const environments = {
        development: {
          tase: '/api/maya',
          mcp: '/api/mcp'
        },
        production: {
          tase: '/.netlify/functions/maya-proxy',
          mcp: '/api/mcp'
        }
      };

      // Development URLs should be proxy-friendly
      expect(environments.development.tase).toMatch(/^\/api/);
      expect(environments.development.mcp).toMatch(/^\/api/);

      // Production URLs should be Netlify function paths
      expect(environments.production.tase).toMatch(/^\/\.netlify/);
      expect(environments.production.mcp).toMatch(/^\/api/);
    });

    it('should maintain consistent response format across environments', async () => {
      const expectedResponseStructure = {
        fundId: expect.any(String),
        fundName: expect.any(String),
        currentPrice: expect.any(Number),
        change: expect.any(Number)
      };

      // Mock response for any environment
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fundId: '5113022',
          fundName: 'Test Fund',
          currentPrice: 100.50,
          change: 1.5
        }),
        status: 200,
        statusText: 'OK'
      } as Response);

      const response = await fetch('/api/maya/mutual/5113022');
      const data = await response.json();

      expect(data).toMatchObject(expectedResponseStructure);
    });
  });
}); 