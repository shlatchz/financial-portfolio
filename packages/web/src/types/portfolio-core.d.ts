// Ambient module declaration for @portfolio/core
// This provides type information when the main package types can't be resolved in CI environments

declare module '@portfolio/core' {
  // Core interfaces
  export interface CustomSecurity {
    id: string;
    bondPercentage: number;
    sharePercentage: number;
    value: number;
    date: string;
  }

  export interface PortfolioAction {
    date: string;
    operation: 'DEPOSIT' | 'BUY' | 'SELL';
    fundId: string;
    amount: number;
    value: number;
    commission: number;
  }

  export interface SecurityInfo {
    id: string;
    name: string;
    type: string;
    currentPrice: number;
    lastUpdate: string;
    managementFee?: number;
    trusteeFee?: number;
  }

  export interface PortfolioSecurity {
    id: string;
    name: string;
    type: string;
    netBuyValue: number;
    currentMarketValue: number;
    currentAmount: number;
    currentPrice: number;
    isCustom?: boolean;
    managementFee?: number;
    trusteeFee?: number;
    lastUpdate?: string;
  }

  export interface PortfolioSummary {
    securities: PortfolioSecurity[];
    customSecurities: CustomSecurity[];
    totalNetBuyValue: number;
    totalMarketValue: number;
    totalIncome: number;
    lastTransactionDate: string;
    fundTypeDistribution: {
      bond: number;
      share: number;
    };
    cashBalance: {
      totalDeposits: number;
      totalCommissions: number;
      remainingCash: number;
    };
  }

  export interface RebalanceRecommendation {
    security: PortfolioSecurity;
    currentValue: number;
    targetValue: number;
    difference: number;
    action: 'BUY' | 'SELL' | 'HOLD';
    amount: number;
  }

  export interface RebalanceResult {
    recommendations: RebalanceRecommendation[];
    totalInvestment: number;
    currentDistribution: { bond: number; share: number };
    targetDistribution: { bond: number; share: number };
  }

  // Service classes
  export class PortfolioAnalyzer {
    constructor(
      targetDistribution: { bond: number; share: number },
      customSecurities?: CustomSecurity[]
    );
    analyzePortfolio(
      actions: PortfolioAction[],
      securitiesInfo: Record<string, SecurityInfo>
    ): PortfolioSummary;
    calculateRebalance(
      portfolio: PortfolioSummary,
      additionalInvestment: number
    ): RebalanceResult;
  }

  export class GoogleSheetsService {
    constructor(apiKey?: string);
    getPortfolioData(spreadsheetId: string, range?: string): Promise<PortfolioAction[]>;
    static extractSpreadsheetId(url: string): string;
    testConnection(spreadsheetId: string): Promise<{
      success: boolean;
      message: string;
      sheets?: string[];
    }>;
  }

  export class TaseApiService {
    constructor(baseUrl?: string);
    getSecurityInfo(securityId: string): Promise<SecurityInfo | null>;
  }

  // Configuration
  export const APP_CONFIG: {
    DEFAULT_TARGETS: {
      BOND_PERCENTAGE: number;
      SHARE_PERCENTAGE: number;
    };
    QUERY: {
      STALE_TIME: number;
      RETRY_COUNT: number;
    };
    TASE: {
      BASE_URL: string;
    };
    API: {
      TIMEOUT: number;
      BATCH_SIZE: number;
    };
    PORTFOLIO: {
      BOND_TYPE: string;
      SHARE_TYPE: string;
      PRECISION: number;
    };
    FORMATS: {
      LOCALE: string;
      CURRENCY: string;
      DATE_FORMAT_OPTIONS: {
        year: string;
        month: string;
        day: string;
      };
    };
  };

  // Utility functions
  export function formatCurrency(amount: number, currency?: string): string;
  export function formatPercentage(value: number, decimals?: number): string;
  export function formatDate(date: string | Date): string;
  export function formatAmount(amount: number): string;
} 