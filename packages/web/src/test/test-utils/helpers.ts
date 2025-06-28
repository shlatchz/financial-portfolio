// Shared helper functions for tests

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { expect } from 'vitest';
import { 
  API_ENDPOINTS, 
  PROXY_CONFIG, 
  REWRITE_TEST_CASES, 
  NON_MAYA_PATHS,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  REQUIRED_CONFIG_ELEMENTS 
} from './constants';

// File Operations
export const getViteConfigPath = () => join(process.cwd(), 'vite.config.ts');

export const readViteConfig = () => {
  const configPath = getViteConfigPath();
  if (!existsSync(configPath)) {
    throw new Error('vite.config.ts not found');
  }
  return readFileSync(configPath, 'utf-8');
};

// Proxy Configuration Validation
export const validateProxyConfigStructure = (configContent: string) => {
  // Validate TASE proxy config
  expect(configContent).toContain("'/api/maya'");
  expect(configContent).toContain(API_ENDPOINTS.targets.mayaProxy);
  expect(configContent).toContain('changeOrigin: true');
  expect(configContent).toContain('secure: false');
  expect(configContent).toContain('rewrite:');
  
  // Validate MCP proxy config  
  expect(configContent).toContain("'/api/mcp'");
  expect(configContent).toContain(API_ENDPOINTS.targets.netlifyDev);
  expect(configContent).toContain('changeOrigin: true');
  expect(configContent).toContain('secure: false');
};

export const validateRequiredConfigElements = (configContent: string) => {
  REQUIRED_CONFIG_ELEMENTS.forEach(element => {
    expect(configContent, `Missing required proxy element: ${element}`).toContain(element);
  });
};

export const validateProxyConfigRegression = (configContent: string) => {
  const expectedStructure = {
    '/api/maya': {
      target: API_ENDPOINTS.targets.mayaProxy,
      mustHave: ['changeOrigin', 'secure', 'rewrite']
    },
    '/api/mcp': {
      target: API_ENDPOINTS.targets.netlifyDev,
      mustHave: ['changeOrigin', 'secure']
    }
  };
  
  Object.entries(expectedStructure).forEach(([route, config]) => {
    expect(configContent, `Route ${route} must be present`).toContain(`'${route}'`);
    expect(configContent, `Target for ${route} is incorrect`).toContain(config.target);
    
    config.mustHave.forEach(property => {
      expect(configContent, `Property ${property} missing for ${route}`).toContain(property);
    });
  });
};

// Path Rewriting Validation
export const validatePathRewriting = () => {
  const rewrite = PROXY_CONFIG['/api/maya'].rewrite;
  
  expect(rewrite).toBeTypeOf('function');
  
  REWRITE_TEST_CASES.forEach(({ input, expected }) => {
    expect(rewrite(input)).toBe(expected);
  });
};

export const validateNonMayaPathsUnaffected = () => {
  const rewrite = (path: string) => path.replace(/^\/api\/maya/, '');
  
  NON_MAYA_PATHS.forEach(path => {
    expect(rewrite(path)).toBe(path);
  });
};

// URL Validation Helpers
export const validateUrlFormat = (url: string, pattern: RegExp) => {
  expect(url).toMatch(pattern);
};

export const validateUrlsArray = (urls: string[], pattern: RegExp) => {
  urls.forEach(url => validateUrlFormat(url, pattern));
};

export const validateDevUrls = (urls: string[]) => {
  urls.forEach(url => {
    expect(url).toMatch(VALIDATION_PATTERNS.devApiPattern);
    expect(url).not.toMatch(/^https?:\/\//);
    expect(url).not.toMatch(/netlify/);
  });
};

export const validateProdUrls = (urls: string[]) => {
  urls.forEach(url => {
    expect(url).toMatch(VALIDATION_PATTERNS.prodApiPattern);
    expect(url).not.toMatch(/^\/api\/maya/);
  });
};

// Fund ID Validation
export const validateFundIds = (validIds: (string | number)[], invalidIds: (string | number | null | undefined)[]) => {
  validIds.forEach(id => {
    expect(String(id)).toMatch(VALIDATION_PATTERNS.fundIdPattern);
  });
  
  invalidIds.forEach(id => {
    if (id) {
      expect(String(id)).not.toMatch(VALIDATION_PATTERNS.fundIdPattern);
    }
  });
};

// URL Construction Helpers
export const constructApiUrl = (baseUrl: string, securityType: string, fundId: string) => {
  return `${baseUrl}/${securityType}/${fundId}`;
};

export const validateApiUrlConstruction = (baseUrl: string, securityType: string, fundId: string, expectedPattern: RegExp) => {
  const fullUrl = constructApiUrl(baseUrl, securityType, fundId);
  expect(fullUrl).toMatch(expectedPattern);
  return fullUrl;
};

// Path Validation Helpers
export const validatePathEncoding = (paths: string[]) => {
  paths.forEach(path => {
    expect(path).not.toContain(' ');
    expect(path).not.toContain('%');
    expect(path.split('/').length).toBeGreaterThanOrEqual(3);
  });
};

// Error Message Validation
export const validateErrorMessages = (errors: Record<string, string>) => {
  Object.values(errors).forEach(error => {
    expect(error).toContain('error');
    expect(error.length).toBeGreaterThan(10);
  });
};

// Environment Helpers
export const validateEnvironmentSeparation = (devEnv: Record<string, string>, prodEnv: Record<string, string>) => {
  // Development URLs should be proxy-friendly
  Object.values(devEnv).forEach(url => {
    expect(url).toMatch(VALIDATION_PATTERNS.devApiPattern);
  });

  // Production URLs should be Netlify function paths or API paths
  expect(prodEnv.tase || prodEnv.mayaApi).toMatch(VALIDATION_PATTERNS.prodApiPattern);
  expect(prodEnv.mcp || prodEnv.mcpApi).toMatch(/^\/api/);
};

// Configuration Validation
export const validateConfigurationMissing = (configContent: string) => {
  // This test will fail if someone accidentally removes the proxy config
  expect(configContent.includes('proxy:'), ERROR_MESSAGES.configErrors.proxyMissing).toBe(true);
  
  // Check for specific proxy routes
  const hasApiMaya = configContent.includes("'/api/maya'");
  const hasApiMcp = configContent.includes("'/api/mcp'");
  
  expect(hasApiMaya, ERROR_MESSAGES.configErrors.mayaMissing).toBe(true);
  expect(hasApiMcp, ERROR_MESSAGES.configErrors.mcpMissing).toBe(true);
  
  // Validate rewrite function exists for TASE API
  const hasTaseRewrite = configContent.includes('rewrite:') && configContent.includes('path.replace');
  expect(hasTaseRewrite, ERROR_MESSAGES.configErrors.rewriteMissing).toBe(true);
};

// Security Configuration Validation
export const validateSecurityConfiguration = (configContent: string) => {
  // Check that secure: false is set for both proxies (required for localhost)
  const secureInstances = (configContent.match(/secure:\s*false/g) || []).length;
  expect(secureInstances, 'secure: false must be set for both proxy configurations').toBeGreaterThanOrEqual(2);
};

// Build Configuration Validation
export const validateBuildConfiguration = (configContent: string) => {
  // Proxy config should only be in server.proxy, not affecting build
  expect(configContent).toContain('server:');
  expect(configContent).toContain('build:');
  
  // Should not have proxy config bleeding into build configuration
  const buildSection = configContent.split('build:')[1]?.split('}')[0] || '';
  expect(buildSection).not.toContain('proxy');
};

// Response Structure Validation
export const validateResponseStructure = <T>(response: T, expectedStructure: Record<string, unknown>) => {
  expect(response).toMatchObject(expectedStructure);
}; 