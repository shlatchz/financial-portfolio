import { env } from '../config/env';

export interface McpToolArgs {
  [key: string]: unknown;
}

export interface McpResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface McpRequest {
  tool: string;
  args: McpToolArgs;
}

/**
 * Service for calling MCP API endpoints from the web interface
 */
export class McpApiService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || env.mcpApiUrl;
  }

  /**
   * Generic method to call any MCP tool
   */
  async callTool(tool: string, args: McpToolArgs = {}): Promise<McpResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool,
          args
        } as McpRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      
      // Handle both direct response and wrapped response formats
      if (result.result) {
        return { content: [{ type: 'text', text: result.result }] };
      }
      
      return result as McpResponse;
    } catch (error) {
      console.error(`MCP API call failed for tool ${tool}:`, error);
      throw error;
    }
  }

  /**
   * Configure the portfolio with Google Sheets and target distribution
   */
  async configurePortfolio(args: {
    googleSheetsApiKey: string;
    spreadsheetId: string;
    targetBondPercentage: number;
    targetSharePercentage: number;
    customSecurities?: Array<{
      id: string;
      bondPercentage: number;
      sharePercentage: number;
      value: number;
      date: string;
    }>;
  }): Promise<McpResponse> {
    return this.callTool('configure_portfolio', args);
  }

  /**
   * Get current portfolio status
   */
  async getPortfolioStatus(): Promise<McpResponse> {
    return this.callTool('get_portfolio_status');
  }

  /**
   * Get security information by ID
   */
  async getSecurityInfo(securityId: string): Promise<McpResponse> {
    return this.callTool('get_security_info', { securityId });
  }

  /**
   * Get financial advice and rebalancing recommendations
   */
  async getFinancialAdvice(additionalInvestment?: number): Promise<McpResponse> {
    return this.callTool('get_financial_advice', { 
      additionalInvestment: additionalInvestment || 0 
    });
  }

  /**
   * Analyze portfolio performance
   */
  async analyzePortfolioPerformance(): Promise<McpResponse> {
    return this.callTool('analyze_portfolio_performance');
  }

  /**
   * Test API connections
   */
  async testConnections(): Promise<McpResponse> {
    return this.callTool('test_connections');
  }

  /**
   * Extract text content from MCP response
   */
  extractTextContent(response: McpResponse): string {
    return response.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }

  /**
   * Check if MCP API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.testConnections();
      return true;
    } catch {
      return false;
    }
  }
} 