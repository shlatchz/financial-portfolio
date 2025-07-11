import { useQuery } from '@tanstack/react-query';
import { PortfolioSummary, SecurityInfo, GoogleSheetsService, TaseApiService, PortfolioAnalyzer, PortfolioAction, CustomSecurity, URL_BUILDERS } from '@portfolio/core';
import { env } from '../config/env';

interface UsePortfolioDataProps {
  spreadsheetUrl: string;
  apiKey: string;
  bondPercentage: number;
  sharePercentage: number;
  customSecurities: CustomSecurity[];
  enabled?: boolean;
}

const extractSpreadsheetId = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export const usePortfolioData = ({ spreadsheetUrl, apiKey, bondPercentage, sharePercentage, customSecurities, enabled = true }: UsePortfolioDataProps) => {
  return useQuery<PortfolioSummary | null>({
    queryKey: ['portfolio', spreadsheetUrl, apiKey, bondPercentage, sharePercentage, customSecurities],
    queryFn: async () => {
      const logPrefix = '[PORTFOLIO-HOOK]';

      if (!spreadsheetUrl) {
        throw new Error('Spreadsheet URL is required');
      }

      if (!apiKey) {
        throw new Error('Google Sheets API key is required');
      }

      const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
      if (!spreadsheetId) {
        throw new Error('Invalid Google Sheets URL');
      }

      const sheetsService = new GoogleSheetsService(apiKey);
      // Use shared URL builder for environment-specific URLs
      const taseBaseUrl = URL_BUILDERS.getTaseApiUrl(import.meta.env.DEV);
      const taseService = new TaseApiService(taseBaseUrl);
      const targetDistribution = {
        bond: bondPercentage,
        share: sharePercentage
      };
      const analyzer = new PortfolioAnalyzer(targetDistribution, customSecurities);

      const portfolioActions = await sheetsService.getPortfolioData(spreadsheetId);

      if (portfolioActions.length === 0) {
        console.warn(`${logPrefix} No portfolio actions found in spreadsheet`);
        return null;
      }

      const fundIds = [...new Set(
        portfolioActions
          .filter((action: PortfolioAction) => action.operation !== 'DEPOSIT' && action.fundId)
          .map((action: PortfolioAction) => action.fundId)
      )];

      if (fundIds.length === 0) {
        console.warn(`${logPrefix} No fund IDs found in portfolio actions`);
        return null;
      }

      const securitiesInfo: Record<string, SecurityInfo> = {};

      for (const fundId of fundIds as string[]) {
        try {
          const info = await taseService.getSecurityInfo(fundId);
          if (info) {
            securitiesInfo[fundId] = info;
          } else {
            console.warn(`${logPrefix} No market data found for fund: ${fundId}`);
          }
        } catch (error) {
          console.warn(`${logPrefix} Failed to get market data for fund ${fundId}:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      const foundSecurities = Object.keys(securitiesInfo).length;
      const summary = await analyzer.analyzePortfolio(portfolioActions, securitiesInfo);

      console.log(`${logPrefix} Portfolio analysis completed:`, {
        totalActions: portfolioActions.length,
        uniqueFunds: fundIds.length,
        securitiesFound: foundSecurities,
        customSecurities: customSecurities.length,
        totalMarketValue: summary.totalMarketValue,
        totalIncome: summary.totalIncome
      });

      return summary;
    },
    enabled: enabled && !!spreadsheetUrl && !!apiKey,
    staleTime: env.queryStaleTime,
    retry: env.queryRetryCount,
  });
}; 