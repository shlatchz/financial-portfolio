// Environment configuration with validation

import { APP_CONFIG } from './constants';

// Constants
const TASE_BASE_URL = 'https://maya.tase.co.il';

/**
 * Parses custom securities from environment variable
 * @returns Array of validated custom securities
 */
const parseCustomSecurities = (): CustomSecurity[] => {
  const customSecuritiesStr = import.meta.env.VITE_CUSTOM_SECURITIES || '';
  if (!customSecuritiesStr.trim()) {
    return [];
  }

  try {
    const customSecurities = JSON.parse(customSecuritiesStr);
    
    if (!Array.isArray(customSecurities)) {
      throw new Error('VITE_CUSTOM_SECURITIES must be a JSON array');
    }

    return customSecurities.map((security: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!security || typeof security !== 'object') {
        throw new Error(`Custom security ${index + 1}: must be an object`);
      }
      
      const requiredFields = ['id', 'bondPercentage', 'sharePercentage', 'value', 'date'];
      for (const field of requiredFields) {
        if (!(field in security)) {
          throw new Error(`Custom security ${index + 1}: missing required field '${field}'`);
        }
      }
      
      if (typeof security.id !== 'string') {
        throw new Error(`Custom security ${index + 1}: 'id' must be a string`);
      }
      
      if (typeof security.bondPercentage !== 'number' || security.bondPercentage < 0 || security.bondPercentage > 1) {
        throw new Error(`Custom security ${security.id}: 'bondPercentage' must be between 0 and 1`);
      }
      
      if (typeof security.sharePercentage !== 'number' || security.sharePercentage < 0 || security.sharePercentage > 1) {
        throw new Error(`Custom security ${security.id}: 'sharePercentage' must be between 0 and 1`);
      }
      
      if (typeof security.value !== 'number' || security.value <= 0) {
        throw new Error(`Custom security ${security.id}: 'value' must be positive`);
      }
      
      if (typeof security.date !== 'string') {
        throw new Error(`Custom security ${security.id}: 'date' must be a string`);
      }

      if (Math.abs(security.bondPercentage + security.sharePercentage - 1) > 0.001) {
        throw new Error(`Custom security ${security.id}: bond and share percentages must sum to 1`);
      }

      return {
        id: security.id,
        bondPercentage: security.bondPercentage,
        sharePercentage: security.sharePercentage,
        value: security.value,
        date: security.date
      };
    });
  } catch (error) {
    if (env.isDevelopment) {
      console.error('[ENV] Custom securities parsing failed:', {
        error: error instanceof Error ? error.message : String(error),
        example: '[{"id":"Pension","bondPercentage":0.6,"sharePercentage":0.4,"value":50000,"date":"2024-01-15"}]'
      });
    }
    return [];
  }
};

export interface CustomSecurity {
  id: string;
  bondPercentage: number;
  sharePercentage: number;
  value: number;
  date: string;
}

export const env = {
  // Portfolio Data Source
  defaultGoogleSheetsApiKey: import.meta.env.VITE_DEFAULT_GOOGLE_SHEETS_API_KEY || '',
  
  // TASE API (constant)
  taseBaseUrl: TASE_BASE_URL,
  
  // Fund Distribution
  fundsTypeDistributionBond: parseFloat(import.meta.env.VITE_FUNDS_TYPE_DISTRIBUTION_BOND || '0.2'),
  fundsTypeDistributionShare: parseFloat(import.meta.env.VITE_FUNDS_TYPE_DISTRIBUTION_SHARE || '0.8'),
  
  // Custom Securities
  customSecurities: parseCustomSecurities(),
  
  // Default Spreadsheet URL
  defaultSpreadsheetUrl: import.meta.env.VITE_DEFAULT_SPREADSHEET_URL || '',
  
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
    }
  };

  if (env.isDevelopment) {
    console.log('[ENV] Configuration loaded:', info);
  }

  return info;
}; 