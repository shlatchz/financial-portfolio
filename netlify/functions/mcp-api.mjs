// Import the full PortfolioMcpService implementation
import { PortfolioMcpService } from './PortfolioMcpService.mjs';

// Single instance
let portfolioService = new PortfolioMcpService();

export const handler = async (event, context) => {
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { tool, args } = body;

    if (!tool) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing tool parameter' }),
      };
    }

    let result;

    // Call the appropriate method
    switch (tool) {
      case 'configure_portfolio':
        const configResult = await portfolioService.configurePortfolio(args || {});
        result = portfolioService.extractTextContent(configResult);
        break;
      case 'get_portfolio_status':
        const statusResult = await portfolioService.getPortfolioStatus();
        result = portfolioService.extractTextContent(statusResult);
        break;
      case 'get_security_info':
        if (!args || !args.securityId) {
          throw new Error('securityId is required');
        }
        const securityResult = await portfolioService.getSecurityInfo(args);
        result = portfolioService.extractTextContent(securityResult);
        break;
      case 'get_financial_advice':
        const adviceResult = await portfolioService.getFinancialAdvice(args);
        result = portfolioService.extractTextContent(adviceResult);
        break;
      case 'analyze_portfolio_performance':
        const performanceResult = await portfolioService.analyzePortfolioPerformance();
        result = portfolioService.extractTextContent(performanceResult);
        break;
      case 'test_connections':
        const testResult = await portfolioService.testConnections();
        result = portfolioService.extractTextContent(testResult);
        break;
      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: `Unknown tool: ${tool}` }),
        };
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ result }),
    };

  } catch (error) {
    console.error('MCP API error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
}; 