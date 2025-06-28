import { TaseApiService, GoogleSheetsService, PortfolioAnalyzer, PortfolioConfig, SecurityInfo } from '@portfolio/core';

/**
 * Shared Portfolio MCP Service
 * Contains all the tool implementations that can be used by both
 * the stdio MCP server and the HTTP Netlify function
 */
export class PortfolioMcpService {
  private taseService: TaseApiService;
  private sheetsService: GoogleSheetsService | null = null;
  private analyzer: PortfolioAnalyzer | null = null;
  private config: PortfolioConfig | null = null;

  constructor(taseBaseUrl?: string) {
    // Use provided URL or default to direct TASE API
    const baseUrl = taseBaseUrl || 'https://maya.tase.co.il/api/v1/funds';
    this.taseService = new TaseApiService(baseUrl);
  }

  async configurePortfolio(args: Record<string, unknown> | undefined) {
    if (!args) {
      throw new Error('Missing required arguments for configurePortfolio');
    }

    const { googleSheetsApiKey, spreadsheetId, targetBondPercentage, targetSharePercentage, customSecurities = [] } = args;

    if (!googleSheetsApiKey || typeof googleSheetsApiKey !== 'string') {
      throw new Error('googleSheetsApiKey is required and must be a string');
    }

    if (!spreadsheetId || typeof spreadsheetId !== 'string') {
      throw new Error('spreadsheetId is required and must be a string');
    }

    if (typeof targetBondPercentage !== 'number' || targetBondPercentage < 0 || targetBondPercentage > 1) {
      throw new Error('targetBondPercentage must be a number between 0 and 1');
    }

    if (typeof targetSharePercentage !== 'number' || targetSharePercentage < 0 || targetSharePercentage > 1) {
      throw new Error('targetSharePercentage must be a number between 0 and 1');
    }

    if (Math.abs((targetBondPercentage + targetSharePercentage) - 1) > 0.001) {
      throw new Error('targetBondPercentage + targetSharePercentage must equal 1');
    }

    this.config = {
      googleSheetsApiKey,
      spreadsheetId,
      targetDistribution: {
        bond: targetBondPercentage,
        share: targetSharePercentage
      },
      customSecurities: Array.isArray(customSecurities) ? customSecurities : []
    };

    this.sheetsService = new GoogleSheetsService(googleSheetsApiKey);
    this.analyzer = new PortfolioAnalyzer(this.config.targetDistribution, this.config.customSecurities);

    return {
      content: [
        {
          type: 'text',
          text: `Portfolio configured successfully:
- Target allocation: ${(targetBondPercentage * 100).toFixed(1)}% bonds, ${(targetSharePercentage * 100).toFixed(1)}% shares
- Custom securities: ${this.config.customSecurities.length} configured
- Google Sheets: ${spreadsheetId}`
        }
      ]
    };
  }

  async getPortfolioStatus() {
    if (!this.config || !this.sheetsService || !this.analyzer) {
      throw new Error('Portfolio not configured. Please run configure_portfolio first.');
    }

    const portfolioActions = await this.sheetsService.getPortfolioData(this.config.spreadsheetId);
    const fundIds = [...new Set(
      portfolioActions
        .filter(action => action.operation !== 'DEPOSIT' && action.fundId)
        .map(action => action.fundId)
    )];

    const securitiesInfo: Record<string, SecurityInfo> = {};
    for (const fundId of fundIds) {
      try {
        const info = await this.taseService.getSecurityInfo(fundId);
        if (info) {
          securitiesInfo[fundId] = info;
        }
      } catch (error) {
        console.warn(`Failed to get market data for fund ${fundId}:`, error instanceof Error ? error.message : String(error));
      }
    }

    const summary = this.analyzer.analyzePortfolio(portfolioActions, securitiesInfo);
    
    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercentage = (decimal: number) => `${(decimal * 100).toFixed(1)}%`;

    return {
      content: [
        {
          type: 'text',
          text: `Portfolio Status as of ${new Date().toLocaleDateString()}:

💰 Total Market Value: ${formatCurrency(summary.totalMarketValue)}
📈 Total Net Investment: ${formatCurrency(summary.totalNetBuyValue)}
💹 Total Profit/Loss: ${formatCurrency(summary.totalIncome)} (${formatPercentage(summary.totalIncome / summary.totalNetBuyValue)})
💵 Available Cash: ${formatCurrency(summary.cashBalance.remainingCash)}

📊 Current Distribution:
- Bonds: ${formatPercentage(summary.fundTypeDistribution.bond)}
- Shares: ${formatPercentage(summary.fundTypeDistribution.share)}

🏦 Holdings (${summary.securities.length} securities):
${summary.securities.map(s => `- ${s.name} (${s.id}): ${s.currentAmount.toLocaleString()} units @ ${s.currentPrice} = ${formatCurrency(s.currentMarketValue)}`).join('\n')}

📅 Last Transaction: ${summary.lastTransactionDate}`
        }
      ]
    };
  }

  async getSecurityInfo(args: Record<string, unknown> | undefined) {
    if (!args || !args.securityId || typeof args.securityId !== 'string') {
      throw new Error('securityId is required and must be a string');
    }

    const securityInfo = await this.taseService.getSecurityInfo(args.securityId);
    
    if (!securityInfo) {
      return {
        content: [
          {
            type: 'text',
            text: `Security ${args.securityId} not found or data unavailable.`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Security Information for ${args.securityId}:

📛 Name: ${securityInfo.name}
📊 Type: ${securityInfo.type}
💰 Current Price: ${securityInfo.currentPrice}
🕐 Last Update: ${new Date(securityInfo.lastUpdate).toLocaleString()}
💼 Management Fee: ${((securityInfo.managementFee || 0) * 100).toFixed(2)}%
🏦 Trustee Fee: ${((securityInfo.trusteeFee || 0) * 100).toFixed(2)}%`
        }
      ]
    };
  }

  async getFinancialAdvice(args: Record<string, unknown> | undefined) {
    if (!this.config || !this.sheetsService || !this.analyzer) {
      throw new Error('Portfolio not configured. Please run configure_portfolio first.');
    }

    const additionalInvestment = (args?.additionalInvestment as number) || 0;

    const portfolioActions = await this.sheetsService.getPortfolioData(this.config.spreadsheetId);
    const fundIds = [...new Set(
      portfolioActions
        .filter(action => action.operation !== 'DEPOSIT' && action.fundId)
        .map(action => action.fundId)
    )];

    const securitiesInfo: Record<string, SecurityInfo> = {};
    for (const fundId of fundIds) {
      try {
        const info = await this.taseService.getSecurityInfo(fundId);
        if (info) {
          securitiesInfo[fundId] = info;
        }
      } catch (error) {
        console.warn(`Failed to get market data for fund ${fundId}:`, error instanceof Error ? error.message : String(error));
      }
    }

    const summary = this.analyzer.analyzePortfolio(portfolioActions, securitiesInfo);
    const rebalanceResult = this.analyzer.calculateRebalance(summary, additionalInvestment);

    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercentage = (decimal: number) => `${(decimal * 100).toFixed(1)}%`;

    let advice = `💡 Financial Advice & Rebalancing Recommendations:

🎯 Target Distribution: ${formatPercentage(this.config.targetDistribution.bond)} bonds, ${formatPercentage(this.config.targetDistribution.share)} shares
📊 Current Distribution: ${formatPercentage(rebalanceResult.currentDistribution.bond)} bonds, ${formatPercentage(rebalanceResult.currentDistribution.share)} shares

📋 Recommended Actions:
`;

    if (rebalanceResult.recommendations.length === 0 || rebalanceResult.recommendations.every(r => r.action === 'HOLD')) {
      advice += '\n✅ Your portfolio is well balanced! No rebalancing needed at this time.';
    } else {
      for (const rec of rebalanceResult.recommendations) {
        if (rec.action !== 'HOLD') {
          const icon = rec.action === 'BUY' ? '🟢' : '🔴';
          const actionText = rec.action === 'BUY' ? 'Buy' : 'Sell';
          
          advice += `\n${icon} ${actionText} ${rec.security.name} (${rec.security.id}):
   Current: ${formatCurrency(rec.currentValue)}
   Target: ${formatCurrency(rec.targetValue)}
   Difference: ${formatCurrency(rec.difference)}
   Amount to ${rec.action.toLowerCase()}: ${rec.amount.toLocaleString()} units
`;
        }
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: advice
        }
      ]
    };
  }

  async analyzePortfolioPerformance() {
    if (!this.config || !this.sheetsService || !this.analyzer) {
      throw new Error('Portfolio not configured. Please run configure_portfolio first.');
    }

    const portfolioActions = await this.sheetsService.getPortfolioData(this.config.spreadsheetId);
    const fundIds = [...new Set(
      portfolioActions
        .filter(action => action.operation !== 'DEPOSIT' && action.fundId)
        .map(action => action.fundId)
    )];

    const securitiesInfo: Record<string, SecurityInfo> = {};
    for (const fundId of fundIds) {
      try {
        const info = await this.taseService.getSecurityInfo(fundId);
        if (info) {
          securitiesInfo[fundId] = info;
        }
      } catch (error) {
        console.warn(`Failed to get market data for fund ${fundId}:`, error instanceof Error ? error.message : String(error));
      }
    }

    const summary = this.analyzer.analyzePortfolio(portfolioActions, securitiesInfo);
    
    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercentage = (decimal: number) => `${(decimal * 100).toFixed(2)}%`;

    return {
      content: [
        {
          type: 'text',
          text: `📊 Portfolio Performance Analysis:

💰 Investment Summary:
- Total Deposits: ${formatCurrency(summary.cashBalance.totalDeposits)}
- Total Invested: ${formatCurrency(summary.totalNetBuyValue)}
- Current Market Value: ${formatCurrency(summary.totalMarketValue)}
- Total Commissions: ${formatCurrency(summary.cashBalance.totalCommissions)}
- Available Cash: ${formatCurrency(summary.cashBalance.remainingCash)}

📈 Performance Metrics:
- Total Profit/Loss: ${formatCurrency(summary.totalIncome)}
- Return on Investment: ${formatPercentage(summary.totalIncome / summary.totalNetBuyValue)}

🥧 Asset Allocation:
- Bonds: ${formatPercentage(summary.fundTypeDistribution.bond)}
- Shares: ${formatPercentage(summary.fundTypeDistribution.share)}

📅 Last Transaction: ${summary.lastTransactionDate}
🔢 Total Securities: ${summary.securities.length}`
        }
      ]
    };
  }

  async testConnections() {
    let taseResult: string, sheetsResult: string;

    // Test TASE API
    try {
      const testResult = await this.taseService.testConnection();
      taseResult = testResult.success ? 
        `✅ ${testResult.message}` : 
        `❌ ${testResult.message}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      taseResult = `❌ TASE API error: ${errorMessage}`;
    }

    // Test Google Sheets
    try {
      if (this.config && this.sheetsService) {
        const testResult = await this.sheetsService.testConnection(this.config.spreadsheetId);
        if (testResult.success) {
          const dataInfo = testResult.sheets ? 
            `Found ${testResult.sheets.length} sheet(s).` : 
            testResult.message;
          sheetsResult = `✅ Connection successful! ${dataInfo}`;
        } else {
          sheetsResult = `❌ ${testResult.message}`;
        }
      } else {
        sheetsResult = '❌ Not configured';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      sheetsResult = `❌ Google Sheets error: ${errorMessage}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: `🔍 Connection Test Results:

📡 TASE API: ${taseResult}

📊 Google Sheets: ${sheetsResult}
`
        }
      ]
    };
  }

  // Helper method to convert MCP response format to plain text for HTTP API
  extractTextContent(response: { content: Array<{ type: string; text: string }> }): string {
    return response.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }
} 