#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

/**
 * Netlify Bridge MCP Server
 * 
 * Acts as a local MCP server but forwards all requests to the Netlify HTTP API.
 * This allows Cursor to use the Netlify-deployed version while maintaining MCP protocol compatibility.
 * 
 * Configuration:
 * - Set NETLIFY_MCP_URL environment variable to your deployed Netlify function URL
 * - Default: https://your-site.netlify.app/api/mcp
 */
class NetlifyBridgeServer {
  private server: Server;
  private netlifyApiUrl: string;

  constructor() {
    this.server = new Server(
      {
        name: 'financial-portfolio-netlify-bridge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configure Netlify API URL from environment or use placeholder
    this.netlifyApiUrl = process.env.NETLIFY_MCP_URL || 'https://your-site.netlify.app/api/mcp';
    
    // Validate URL configuration
    if (this.netlifyApiUrl === 'https://your-site.netlify.app/api/mcp') {
      console.error('⚠️  Warning: Using placeholder URL. Set NETLIFY_MCP_URL environment variable to your deployed Netlify function URL');
    }

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: Error) => {
      console.error('[MCP Bridge Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async callNetlifyTool(toolName: string, args: Record<string, unknown> = {}): Promise<CallToolResult> {
    try {
      const response = await axios.post(this.netlifyApiUrl, {
        tool: toolName,
        args: args
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Convert plain text response back to MCP format
      return {
        content: [
          {
            type: 'text',
            text: String(response.data.result)
          }
        ],
        isError: false
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || error.message;
        throw new Error(`Netlify API Error: ${errorMsg}`);
      }
      throw error;
    }
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
                      date: { type: 'string' },
                      apiUrl: { type: 'string' },
                      apiResponseParser: { type: 'string' },
                      apiHeaders: { type: 'object' },
                      currentValue: { type: 'number' },
                      currentValueDate: { type: 'string' }
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
        return await this.callNetlifyTool(name, args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run(): Promise<void> {
    console.error('Financial Portfolio Netlify Bridge MCP server running on stdio');
    console.error(`Forwarding requests to: ${this.netlifyApiUrl}`);
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new NetlifyBridgeServer();
server.run().catch(console.error); 