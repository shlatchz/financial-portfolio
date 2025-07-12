export interface CustomSecurity {
  id: string;
  bondPercentage: number;
  sharePercentage: number;
  value: number;
  date: string;
  
  // API-related fields for fetching current values
  apiUrl?: string;
  apiResponseParser?: string; // JavaScript function as string to parse API response
  apiHeaders?: Record<string, string>;
  currentValue?: number;
  currentValueDate?: string;
  // If apiUrl is provided, currentValue will be fetched from API
  // If apiUrl is not provided, currentValue defaults to value
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

export interface FundAnalysis {
  currentAmount: number;
  netBuyValue: number;
  currentMarketValue: number;
  totalCommissions: number;
  totalDeposits: number;
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

export interface PortfolioConfig {
  googleSheetsApiKey: string;
  spreadsheetId: string;
  targetDistribution: { bond: number; share: number };
  customSecurities: CustomSecurity[];
} 