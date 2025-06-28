// Shared constants for tests to eliminate duplication

// API Endpoints
export const API_ENDPOINTS = {
  // Development endpoints (proxied)
  dev: {
    mayaApi: '/api/maya',
    mcpApi: '/api/mcp',
  },
  // Production endpoints (direct)
  prod: {
    mayaApi: '/.netlify/functions/maya-proxy',
    mcpApi: '/api/mcp',
  },
  // Proxy targets
  targets: {
    netlifyDev: 'http://localhost:8888',
    mayaProxy: 'http://localhost:8888/.netlify/functions/maya-proxy',
  }
} as const;

// Port Configuration
export const PORTS = {
  netlifyDev: 8888,
  viteDefault: 5173,
  viteAlternate: 5174,  // When 5173 is taken
  preview: 4173,
} as const;

// Proxy Configuration Template
export const PROXY_CONFIG = {
  '/api/maya': {
    target: API_ENDPOINTS.targets.mayaProxy,
    changeOrigin: true,
    secure: false,
    rewrite: (path: string) => path.replace(/^\/api\/maya/, ''),
  },
  '/api/mcp': {
    target: API_ENDPOINTS.targets.netlifyDev,
    changeOrigin: true,
    secure: false,
  }
} as const;

// Test Data
export const TEST_DATA = {
  fundIds: {
    valid: ['5113022', '1234567', '999'],
    invalid: ['', 'abc', '12.34', null, undefined],
  },
  securityTypes: ['mutual', 'etf'],
  sampleFundId: '5113022',
  sampleSecurityType: 'mutual',
  alternativeFundId: '1234',
} as const;

// URL Patterns
export const URL_PATTERNS = {
  // Development URLs
  dev: {
    taseUrls: [
      '/api/maya/mutual/5113022',
      '/api/maya/etf/1234',
      '/api/maya/mutual/999'
    ],
    mcpUrls: ['/api/mcp'],
  },
  // Production URLs
  prod: {
    taseUrls: [
      '/.netlify/functions/maya-proxy/mutual/5113022',
      '/.netlify/functions/maya-proxy/etf/1234',
      '/.netlify/functions/maya-proxy/mutual/999'
    ],
    mcpUrls: ['/api/mcp'],
  },
  // Path validation patterns
  localPaths: [
    '/api/maya/mutual/5113022',
    '/api/maya/etf/1234',
    '/api/mcp'
  ],
  productionPaths: [
    '/.netlify/functions/maya-proxy/mutual/5113022',
    '/.netlify/functions/maya-proxy/etf/1234',
    '/api/mcp'
  ]
} as const;

// Path Rewrite Test Cases
export const REWRITE_TEST_CASES = [
  { input: '/api/maya/mutual/5113022', expected: '/mutual/5113022' },
  { input: '/api/maya/etf/1234', expected: '/etf/1234' },
  { input: '/api/maya/funds/search', expected: '/funds/search' },
  { input: '/api/maya', expected: '' }
] as const;

// Non-Maya paths (should not be affected by rewrite)
export const NON_MAYA_PATHS = [
  '/api/mcp/test',
  '/other/path',
  '/maya/different'
] as const;

// Environment Configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    mayaApi: API_ENDPOINTS.dev.mayaApi,
    mcpApi: API_ENDPOINTS.dev.mcpApi,
    netlifyDevPort: PORTS.netlifyDev,
    viteDevPort: PORTS.viteAlternate,
    proxyEnabled: true,
  },
  production: {
    mayaApi: API_ENDPOINTS.prod.mayaApi,
    mcpApi: API_ENDPOINTS.prod.mcpApi,
    netlifyFunctions: true,
    proxyEnabled: false,
    directFunctionCalls: true,
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  proxyErrors: {
    tase: 'TASE API proxy error - Check Netlify dev server',
    mcp: 'MCP API proxy error - Netlify dev not running on port 8888',
    generic: 'Proxy configuration error - Check vite.config.ts'
  },
  configErrors: {
    proxyMissing: 'Proxy configuration was removed! This will break development mode.',
    mayaMissing: 'API Maya proxy route is missing! This will break TASE API calls in development.',
    mcpMissing: 'API MCP proxy route is missing! This will break MCP API calls in development.',
    rewriteMissing: 'TASE API path rewrite function is missing! This will cause incorrect API routing.'
  }
} as const;

// Required Configuration Elements
export const REQUIRED_CONFIG_ELEMENTS = [
  'proxy:',
  "'/api/maya':",
  'http://localhost:8888/.netlify/functions/maya-proxy',
  "'/api/mcp':",
  'http://localhost:8888',
  'changeOrigin: true',
  'secure: false',
  'rewrite:'
] as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  fundIdPattern: /^\d+$/,
  devApiPattern: /^\/api/,
  prodApiPattern: /^\/\.netlify\/functions/,
  localhostPattern: /^http:\/\/localhost:8888/,
  mayaProxyPattern: /^http:\/\/localhost:8888/,
  mcpProxyPattern: /^http:\/\/localhost:8888$/,
} as const; 