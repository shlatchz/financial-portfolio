export const APP_CONFIG = {
  PORTFOLIO: {
    BOND_TYPE: 'Bond',
    SHARE_TYPE: 'Share',
    PRECISION: 2,
  },
  
  API: {
    TIMEOUT: 10000,
    BATCH_SIZE: 10,
  },

  // Query configuration for React Query
  QUERY: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    RETRY_COUNT: 2,
  },

  // TASE API configuration  
  TASE: {
    BASE_URL: 'https://maya.tase.co.il/api/v1/funds',
  },

  FORMATS: {
    LOCALE: 'he-IL',
    CURRENCY: 'ILS',
    DATE_FORMAT_OPTIONS: {
      year: 'numeric' as const,
      month: '2-digit' as const,
      day: '2-digit' as const,
    },
  },

  DEFAULT_TARGETS: {
    BOND_PERCENTAGE: 0.2,
    SHARE_PERCENTAGE: 0.8,
  },
} as const;

export const OPERATIONS = {
  DEPOSIT: 'DEPOSIT',
  BUY: 'BUY',
  SELL: 'SELL',
} as const; 