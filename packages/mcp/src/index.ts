#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { PortfolioMcpService } from './services/PortfolioMcpService.js';

/**
 * Financial Portfolio MCP Server
 * 
 * Provides tools for:
 * - Querying portfolio status and holdings
 * - Getting security information (ETFs, mutual funds)
 * - Receiving financial advice and rebalancing recommendations
 * - Analyzing portfolio performance
 */
class FinancialPortfolioServer {
  private server: Server;
  private portfolioService: PortfolioMcpService;

  constructor() {
    this.server = new Server(
      {
        name: 'financial-portfolio-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Use direct TASE API for development/local testing, Netlify function for production
    // Since MCP runs locally, always use direct TASE API unless explicitly configured otherwise
    const taseBaseUrl = process.env.TASE_API_BASE_URL || 'https://maya.tase.co.il/api/v1/funds';
    this.portfolioService = new PortfolioMcpService(taseBaseUrl);

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: Error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupTools(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'configure_portfolio',
            description: 'Configure the portfolio settings including Google Sheets API key, spreadsheet ID, target distribution, and custom securities',
            inputSchema: {
              type: 'object',
              properties: {
                googleSheetsApiKey: {
                  type: 'string',
                  description: 'Google Sheets API key for accessing portfolio data'
                },
                spreadsheetId: {
                  type: 'string',
                  description: 'Google Sheets spreadsheet ID containing transaction history'
                },
                targetBondPercentage: {
                  type: 'number',
                  description: 'Target percentage for bonds (0-1)',
                  minimum: 0,
                  maximum: 1
                },
                targetSharePercentage: {
                  type: 'number',
                  description: 'Target percentage for shares (0-1)',
                  minimum: 0,  
                  maximum: 1
                },
                customSecurities: {
                  type: 'array',
                  description: 'Custom securities like pension funds',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      bondPercentage: { type: 'number' },
                      sharePercentage: { type: 'number' },
                      value: { type: 'number' },
                      date: { type: 'string' }
                    }
                  }
                }
              },
              required: ['googleSheetsApiKey', 'spreadsheetId', 'targetBondPercentage', 'targetSharePercentage']
            }
          },
          {
            name: 'get_portfolio_status',
            description: 'Get comprehensive portfolio status including all holdings, market values, and performance metrics',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false
            }
          },
          {
            name: 'get_security_info',
            description: 'Get detailed information about a specific security (ETF or mutual fund)',
            inputSchema: {
              type: 'object',
              properties: {
                securityId: {
                  type: 'string',
                  description: 'The security/fund identifier (e.g., "5131" for a TASE ETF)'
                }
              },
              required: ['securityId']
            }
          },
          {
            name: 'get_financial_advice',
            description: 'Get rebalancing recommendations and financial advice based on target allocation',
            inputSchema: {
              type: 'object',
              properties: {
                additionalInvestment: {
                  type: 'number',
                  description: 'Additional investment amount to consider in rebalancing (optional)',
                  default: 0
                }
              }
            }
          },
          {
            name: 'analyze_portfolio_performance',
            description: 'Analyze portfolio performance including profit/loss, distribution, and cash balance',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false
            }
          },
          {
            name: 'test_connections',
            description: 'Test connections to Google Sheets and TASE APIs to verify configuration',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
      const { name, arguments: args } = request.params;

      // Check if tool exists first - return proper JSON-RPC error for unknown tools
      const validTools = [
        'configure_portfolio',
        'get_portfolio_status',
        'get_security_info',
        'get_financial_advice',
        'analyze_portfolio_performance',
        'test_connections'
      ];

      if (!validTools.includes(name)) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        switch (name) {
          case 'configure_portfolio':
            return await this.portfolioService.configurePortfolio(args);
          case 'get_portfolio_status':
            return await this.portfolioService.getPortfolioStatus();
          case 'get_security_info':
            return await this.portfolioService.getSecurityInfo(args);
          case 'get_financial_advice':
            return await this.portfolioService.getFinancialAdvice(args);
          case 'analyze_portfolio_performance':
            return await this.portfolioService.analyzePortfolioPerformance();
          case 'test_connections':
            return await this.portfolioService.testConnections();
          default:
            // This should never happen due to the check above, but kept for safety
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`
            }
          ]
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Financial Portfolio MCP server running on stdio');
  }
}

const server = new FinancialPortfolioServer();
server.run().catch(console.error); 