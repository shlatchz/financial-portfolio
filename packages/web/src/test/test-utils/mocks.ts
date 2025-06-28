// Shared mock data and response structures for tests

import { expect } from 'vitest';
import { TEST_DATA } from './constants';

// Mock API Responses
export const MOCK_API_RESPONSES = {
  // TASE API Responses
  tase: {
    success: {
      fundId: TEST_DATA.sampleFundId,
      fundName: 'Test Fund',
      currentPrice: 100.50,
      change: 1.5
    },
    production: {
      fundId: TEST_DATA.sampleFundId,
      fundName: 'Production Fund',
      currentPrice: 105.75,
      change: 2.1
    },
    error: {
      error: 'Fund not found',
      statusCode: 404
    }
  },
  
  // MCP API Responses
  mcp: {
    success: {
      result: 'Portfolio status retrieved successfully',
      tools: 6
    },
    unavailable: {
      error: 'MCP API not available. Start with: netlify dev'
    },
    testConnections: {
      result: 'All connections successful',
      status: 'ok'
    }
  }
} as const;

// Mock Response Structures for validation
export const RESPONSE_STRUCTURES = {
  taseApi: {
    fundId: expect.any(String),
    fundName: expect.any(String),
    currentPrice: expect.any(Number),
    change: expect.any(Number)
  },
  mcpApi: {
    result: expect.any(String)
  }
} as const;

// Mock Fetch Responses
export const createMockFetchResponse = (data: unknown, options: {
  status?: number;
  statusText?: string;
  ok?: boolean;
} = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  statusText: options.statusText ?? 'OK',
  json: async () => data,
} as Response);

// Common Mock Responses
export const MOCK_FETCH_RESPONSES = {
  taseSuccess: () => createMockFetchResponse(MOCK_API_RESPONSES.tase.success),
  taseProduction: () => createMockFetchResponse(MOCK_API_RESPONSES.tase.production),
  taseError: () => createMockFetchResponse(
    MOCK_API_RESPONSES.tase.error, 
    { status: 404, statusText: 'Not Found', ok: false }
  ),
  mcpSuccess: () => createMockFetchResponse(MOCK_API_RESPONSES.mcp.success),
  mcpUnavailable: () => createMockFetchResponse(
    MOCK_API_RESPONSES.mcp.unavailable,
    { status: 503, statusText: 'Service Unavailable', ok: false }
  ),
  networkError: () => Promise.reject(new Error('Netlify dev server not running')),
} as const;

// Mock Error Objects
export const MOCK_ERRORS = {
  networkError: new Error('Network error'),
  netlifyDevNotRunning: new Error('Netlify dev server not running'),
  proxyConfigurationError: new Error('Proxy configuration error'),
  taseApiError: new Error('TASE API error'),
  mcpApiError: new Error('MCP API error'),
} as const;

// Proxy Configuration Structure for Testing
export const MOCK_PROXY_VALIDATION = {
  '/api/maya': {
    target: 'http://localhost:8888/.netlify/functions/maya-proxy',
    mustHave: ['changeOrigin', 'secure', 'rewrite']
  },
  '/api/mcp': {
    target: 'http://localhost:8888',
    mustHave: ['changeOrigin', 'secure']
  }
} as const;

// Environment Mock Data
export const MOCK_ENVIRONMENTS = {
  development: {
    tase: '/api/maya',
    mcp: '/api/mcp'
  },
  production: {
    tase: '/.netlify/functions/maya-proxy',
    mcp: '/api/mcp'
  }
} as const; 