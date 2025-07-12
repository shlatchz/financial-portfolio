// Environment configuration with validation

import { APP_CONFIG } from './constants';
import type { CustomSecurity } from '@portfolio/core';
import { URL_BUILDERS } from '@portfolio/core';

// Constants are now imported from @portfolio/core

/**
 * Parses custom securities from environment variable
 * @returns Array of validated custom securities
 */
const parseCustomSecurities = (value: string): CustomSecurity[] => {
  if (!value || value.trim() === '') {
    // Return default custom securities when environment variable is not set
    return [
      {
        id: "קרן השתלמות",
        bondPercentage: 0.3,
        sharePercentage: 0.7,
        value: 30000,
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: "BitGo Bitcoin",
        bondPercentage: 0,
        sharePercentage: 1.0,
        value: 15000,
        date: new Date().toISOString().split('T')[0],
        apiUrl: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=ILS',
        apiHeaders: {"Content-Type": "application/json"},
        apiResponseParser: '(data) => 0.5 * data.ILS'
      }
    ];
  }
  
  try {
    const parsed = JSON.parse(value) as unknown;
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      console.warn('[ENV] VITE_CUSTOM_SECURITIES must be an array, got:', typeof parsed);
      return [];
    }
    
    // Type-safe mapping with validation
    return parsed.map((security: unknown, index: number) => {
      if (typeof security !== 'object' || security === null) {
        console.warn(`[ENV] Invalid custom security at index ${index}: not an object`);
        return createEmptyCustomSecurity(index);
      }
      
      const sec = security as Record<string, unknown>;
      return {
        id: typeof sec.id === 'string' ? sec.id : `custom-${index}`,
        bondPercentage: typeof sec.bondPercentage === 'number' ? sec.bondPercentage : 0,
        sharePercentage: typeof sec.sharePercentage === 'number' ? sec.sharePercentage : 0,
        value: typeof sec.value === 'number' ? sec.value : 0,
        date: typeof sec.date === 'string' ? sec.date : new Date().toISOString().split('T')[0],
        apiUrl: typeof sec.apiUrl === 'string' ? sec.apiUrl : undefined,
        apiResponseParser: typeof sec.apiResponseParser === 'string' ? sec.apiResponseParser : undefined,
        apiHeaders: typeof sec.apiHeaders === 'object' && sec.apiHeaders !== null ? sec.apiHeaders as Record<string, string> : undefined,
        currentValue: typeof sec.currentValue === 'number' ? sec.currentValue : undefined,
        currentValueDate: typeof sec.currentValueDate === 'string' ? sec.currentValueDate : undefined
      };
    });
  } catch (error) {
    console.error('[ENV] Failed to parse VITE_CUSTOM_SECURITIES:', error);
    return [];
  }
};

const createEmptyCustomSecurity = (index: number): CustomSecurity => ({
  id: `custom-${index}`,
  bondPercentage: 0,
  sharePercentage: 0,
  value: 0,
  date: new Date().toISOString().split('T')[0],
  apiUrl: undefined,
  apiResponseParser: undefined,
  apiHeaders: undefined,
  currentValue: undefined,
  currentValueDate: undefined
});

export const env = {
  // Portfolio Data Source
  defaultGoogleSheetsApiKey: import.meta.env.VITE_DEFAULT_GOOGLE_SHEETS_API_KEY || 'AIzaSyDgHNVucCDy3TnZ87CNHGm6hPQO1lLrTFU',
  
  // TASE API (constant) - now using shared constants
  taseBaseUrl: URL_BUILDERS.getTaseApiUrl(import.meta.env.DEV),
  
  // MCP API URL - auto-detect local vs deployed using shared constants
  mcpApiUrl: import.meta.env.VITE_MCP_API_URL || URL_BUILDERS.getMcpApiUrl(import.meta.env.DEV),
  
  // Fund Distribution
  fundsTypeDistributionBond: parseFloat(import.meta.env.VITE_FUNDS_TYPE_DISTRIBUTION_BOND || '0.2'),
  fundsTypeDistributionShare: parseFloat(import.meta.env.VITE_FUNDS_TYPE_DISTRIBUTION_SHARE || '0.8'),
  
  // Custom Securities
  customSecurities: parseCustomSecurities(import.meta.env.VITE_CUSTOM_SECURITIES || ''),
  
  // Default Spreadsheet URL
  defaultSpreadsheetUrl: import.meta.env.VITE_DEFAULT_SPREADSHEET_URL || 'https://docs.google.com/spreadsheets/d/1_xmOb5MHUrGyzR_kvsjrHhGQ_-mAUJLFAhfpjQE_c-U/edit?usp=sharing',
  
  // Query Configuration
  queryStaleTime: parseInt(import.meta.env.VITE_QUERY_STALE_TIME || String(APP_CONFIG.QUERY.STALE_TIME)),
  queryRetryCount: parseInt(import.meta.env.VITE_QUERY_RETRY_COUNT || String(APP_CONFIG.QUERY.RETRY_COUNT)),
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

/**
 * Validates environment configuration
 * @returns True if all required environment variables are valid
 */
export const validateEnv = (): boolean => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const distributionSum = env.fundsTypeDistributionBond + env.fundsTypeDistributionShare;
  if (Math.abs(distributionSum - 1) > 0.001) {
    warnings.push(`Fund distribution sum: ${distributionSum.toFixed(3)} (should be 1.0)`);
  }

  env.customSecurities.forEach((security, index) => {
    if (!security.id) {
      errors.push(`Custom security ${index + 1}: missing ID`);
    }
    if (security.value <= 0) {
      errors.push(`Custom security ${security.id}: invalid value ${security.value}`);
    }
  });
  
  if (env.isDevelopment && warnings.length > 0) {
    console.warn('[ENV] Configuration warnings:', warnings);
  }
  
  if (errors.length > 0) {
    console.error('[ENV] Validation failed:', errors);
    if (env.isProduction) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }
  
  return errors.length === 0;
};

/**
 * Returns environment information for debugging purposes
 * @returns Object containing environment status and configuration
 */
export const getEnvInfo = () => {
  const info = {
    hasDefaultGoogleApiKey: !!env.defaultGoogleSheetsApiKey,
    hasDefaultSpreadsheet: !!env.defaultSpreadsheetUrl,
    environment: env.isDevelopment ? 'development' : 'production',
    queryConfig: {
      staleTime: env.queryStaleTime,
      retryCount: env.queryRetryCount,
    },
    customSecurities: env.customSecurities.length,
    fundDistribution: {
      bond: `${(env.fundsTypeDistributionBond * 100).toFixed(1)}%`,
      share: `${(env.fundsTypeDistributionShare * 100).toFixed(1)}%`,
    },
    apiEndpoints: {
      taseBaseUrl: env.taseBaseUrl,
      mcpApiUrl: env.mcpApiUrl,
    }
  };

  // Development-only logging
  if (env.isDevelopment) {
    console.log('[ENV] Configuration loaded:', info);
  }

  return info;
};

 