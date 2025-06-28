/**
 * Shared API constants for the entire portfolio management system
 * This file centralizes all URLs, endpoints, and API-related constants
 * to eliminate duplication across packages.
 */

// External API URLs
export const EXTERNAL_APIS = {
  // TASE (Tel Aviv Stock Exchange) Maya API
  TASE: {
    BASE_URL: 'https://maya.tase.co.il',
    API_BASE_URL: 'https://maya.tase.co.il/api/v1/funds',
    REFERRER_PATHS: {
      MUTUAL_FUNDS: 'mutual-funds',
      ETF: 'etf'
    }
  },
  
  // Google Sheets API
  GOOGLE_SHEETS: {
    BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets'
  }
} as const;

// Netlify Function Endpoints
export const NETLIFY_FUNCTIONS = {
  // Production endpoints (direct Netlify function calls)
  PRODUCTION: {
    MAYA_PROXY: '/.netlify/functions/maya-proxy',
    MCP_API: '/api/mcp'
  },
  
  // Development endpoints (Netlify dev server)
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:8888',
    MAYA_PROXY: 'http://localhost:8888/.netlify/functions/maya-proxy',
    MCP_API: 'http://localhost:8888/api/mcp'
  }
} as const;

// Vite Proxy Routes (for development)
export const VITE_PROXY_ROUTES = {
  MAYA_API: '/api/maya',
  MCP_API: '/api/mcp'
} as const;

// Port Constants
export const PORTS = {
  VITE_DEFAULT: 5173,
  VITE_PREVIEW: 4173,
  NETLIFY_DEV: 8888
} as const;

// API Path Patterns
export const API_PATHS = {
  TASE: {
    MUTUAL_FUND: (fundId: string) => `/mutual/${fundId}`,
    ETF: (fundId: string) => `/etf/${fundId}`
  },
  
  GOOGLE_SHEETS: {
    VALUES: (spreadsheetId: string, range: string) => 
      `/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    METADATA: (spreadsheetId: string) => 
      `/${spreadsheetId}?fields=sheets.properties.title`
  }
} as const;

// Environment-specific URL builders
export const URL_BUILDERS = {
  /**
   * Get the appropriate TASE API base URL based on environment
   */
  getTaseApiUrl: (isDevelopment: boolean): string => {
    return isDevelopment 
      ? VITE_PROXY_ROUTES.MAYA_API 
      : NETLIFY_FUNCTIONS.PRODUCTION.MAYA_PROXY;
  },
  
  /**
   * Get the appropriate MCP API URL based on environment
   */
  getMcpApiUrl: (isDevelopment: boolean): string => {
    return isDevelopment 
      ? VITE_PROXY_ROUTES.MCP_API 
      : NETLIFY_FUNCTIONS.PRODUCTION.MCP_API;
  },
  
  /**
   * Build complete TASE API URL for a specific fund
   */
  buildTaseUrl: (baseUrl: string, fundType: 'mutual' | 'etf', fundId: string): string => {
    return `${baseUrl}${API_PATHS.TASE[fundType === 'mutual' ? 'MUTUAL_FUND' : 'ETF'](fundId)}`;
  },
  
  /**
   * Build Google Sheets API URL
   */
  buildSheetsUrl: (spreadsheetId: string, range: string, apiKey: string): string => {
    return `${EXTERNAL_APIS.GOOGLE_SHEETS.BASE_URL}${API_PATHS.GOOGLE_SHEETS.VALUES(spreadsheetId, range)}?key=${apiKey}`;
  }
} as const;

// Validation patterns for URLs
const URL_PATTERNS = {
  TASE_API: /^\/api\/maya\/\w+\/\d+$/,
  NETLIFY_FUNCTION: /^\/\.netlify\/functions\/[\w-]+/,
  MCP_API: /^\/api\/mcp$/,
  LOCALHOST: /^http:\/\/localhost:\d+/
} as const;

export const URL_VALIDATION = {
  PATTERNS: URL_PATTERNS,
  
  /**
   * Validate if a URL matches expected patterns
   */
  validateUrl: (url: string, type: keyof typeof URL_PATTERNS): boolean => {
    return URL_PATTERNS[type].test(url);
  }
} as const;

// Common headers for API requests
export const API_HEADERS = {
  TASE: {
    ACCEPT: 'application/json, text/plain, */*',
    ACCEPT_LANGUAGE: 'he-IL',
    CONTENT_TYPE: 'application/json'
  },
  
  COMMON: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json'
  }
} as const;

// Export all constants as a single object for convenience
export const API_CONSTANTS = {
  EXTERNAL_APIS,
  NETLIFY_FUNCTIONS,
  VITE_PROXY_ROUTES,
  PORTS,
  API_PATHS,
  URL_BUILDERS,
  URL_VALIDATION,
  API_HEADERS
} as const; 