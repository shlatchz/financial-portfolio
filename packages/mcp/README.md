# Financial Portfolio MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with tools for querying financial portfolio status, getting security information, and receiving investment advice.

![MCP](https://img.shields.io/badge/MCP-Compatible-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🎯 Overview

This MCP server enables AI assistants (Claude Desktop, Cursor, etc.) to:

- 📊 Query comprehensive portfolio status and holdings
- 🔍 Get detailed information about securities (ETFs, mutual funds)
- 💡 Provide financial advice and rebalancing recommendations
- 📈 Analyze portfolio performance including profit/loss metrics
- 🔗 Test connections to Google Sheets and TASE APIs
- ⚙️ Configure portfolio settings and target allocations

## 🏗️ Architecture

The MCP server supports **three deployment modes**:

### 1. Local Stdio Mode (Recommended for Desktop AI)
```bash
npm run dev:mcp
```
- Direct stdio communication with AI assistants
- Fastest performance and lowest latency
- Perfect for Claude Desktop, Cursor integration

### 2. HTTP API Mode (Cloud Deployment)
```bash
# Deployed as: https://your-site.netlify.app/api/mcp
```
- RESTful API accessible via HTTP
- Scalable serverless deployment
- CORS-enabled for web applications

### 3. Bridge Mode (Best of Both Worlds)
```bash
npm run build:bridge
```
- Local MCP protocol interface
- Forwards requests to remote HTTP API
- Use cloud deployment with local AI integration

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- Google Sheets API key
- Portfolio data in Google Sheets format

### Installation

```bash
# Install dependencies
npm install

# Build the MCP server
npm run build

# Start in development mode
npm run dev
```

### Configuration

#### For Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "financial-portfolio": {
      "command": "node",
      "args": ["/path/to/your/project/packages/mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "TASE_API_BASE_URL": "https://maya.tase.co.il/api/v1/funds"
      }
    }
  }
}
```

#### For Cursor
Add to your `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "financial-portfolio": {
      "command": "node",
      "args": ["/path/to/your/project/packages/mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Using Netlify Bridge
```json
{
  "mcpServers": {
    "financial-portfolio-bridge": {
      "command": "node",
      "args": ["/path/to/your/project/packages/mcp/dist/netlify-bridge.js"],
      "env": {
        "NETLIFY_MCP_URL": "https://your-site.netlify.app/api/mcp"
      }
    }
  }
}
```

## 🛠️ Available Tools

### 1. configure_portfolio
**Configure portfolio settings including API keys and target allocation.**

```json
{
  "tool": "configure_portfolio",
  "args": {
    "googleSheetsApiKey": "your_api_key",
    "spreadsheetId": "your_spreadsheet_id", 
    "targetBondPercentage": 0.2,
    "targetSharePercentage": 0.8,
    "customSecurities": [
      {
        "id": "pension-001",
        "bondPercentage": 0.3,
        "sharePercentage": 0.7,
        "value": 50000,
        "date": "2024-01-01"
      }
    ]
  }
}
```

### 2. get_portfolio_status
**Get comprehensive portfolio status including all holdings and market values.**

```json
{
  "tool": "get_portfolio_status"
}
```

**Returns:**
- Total investment and current market value
- Profit/loss and ROI calculations
- Fund-by-fund breakdown with current prices
- Asset allocation (bonds vs shares)
- Available cash balance

### 3. get_security_info
**Get detailed information about a specific security.**

```json
{
  "tool": "get_security_info",
  "args": {
    "securityId": "5131"
  }
}
```

**Returns:**
- Security name and type (ETF/Mutual Fund)
- Current price and last update time
- Management and trustee fees
- Historical performance data (if available)

### 4. get_financial_advice
**Get rebalancing recommendations based on target allocation.**

```json
{
  "tool": "get_financial_advice",
  "args": {
    "additionalInvestment": 10000
  }
}
```

**Returns:**
- Current vs target allocation analysis
- Specific buy/sell recommendations
- Commission-optimized rebalancing strategy
- Impact of additional investment

### 5. analyze_portfolio_performance
**Analyze comprehensive portfolio performance metrics.**

```json
{
  "tool": "analyze_portfolio_performance"
}
```

**Returns:**
- Total return and annualized performance
- Risk metrics and volatility analysis
- Asset allocation drift over time
- Performance attribution by fund

### 6. test_connections
**Test connections to Google Sheets and TASE APIs.**

```json
{
  "tool": "test_connections"
}
```

**Returns:**
- Google Sheets API connectivity status
- TASE Maya API connectivity status
- Configuration validation results

## 📊 Data Sources

### Google Sheets Format
Your spreadsheet should have these columns:

| Date | Operation | FundId | FundName | Amount | Units | PricePerUnit | TotalAmount | Commission |
|------|-----------|--------|----------|--------|-------|--------------|-------------|------------|
| 2024-01-01 | DEPOSIT | | Cash Deposit | 10000 | 0 | 0 | 10000 | 0 |
| 2024-01-02 | BUY | 5131 | Government Bonds | 5000 | 100 | 50 | 5000 | 25 |
| 2024-01-03 | BUY | 5136 | Stock Market ETF | 4000 | 80 | 50 | 4000 | 20 |
| 2024-01-04 | SELL | 5131 | Government Bonds | -2500 | -50 | 50 | -2500 | 15 |

### TASE Maya API
- **Source**: Official Tel Aviv Stock Exchange data
- **Coverage**: ETFs, mutual funds, government bonds
- **Update Frequency**: Real-time during market hours
- **Currency**: Israeli Shekel (ILS)

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Tests
```bash
# Test MCP server functionality
npm run test:integration

# Test with real TASE API
npm run test:mcp-server
```

### Manual Testing
```bash
# Test local MCP server
echo '{"tool": "test_connections"}' | node dist/index.js

# Test HTTP API
curl -X POST https://your-site.netlify.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "test_connections"}'
```

## 🚀 Deployment

### Local Development
```bash
# Start in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Netlify Functions
```bash
# Build for Netlify
npm run build:all

# The functions will be deployed to:
# https://your-site.netlify.app/api/mcp
```

### Docker
```bash
# Build Docker image
docker build -t portfolio-mcp .

# Run container
docker run -p 3000:3000 portfolio-mcp
```

## 🔧 Configuration

### Environment Variables

```bash
# TASE API Configuration
TASE_API_BASE_URL=https://maya.tase.co.il/api/v1/funds

# Netlify Bridge Configuration
NETLIFY_MCP_URL=https://your-site.netlify.app/api/mcp

# Development Settings
NODE_ENV=development
```

### Advanced Configuration

```typescript
// Custom TASE API endpoint
const service = new PortfolioMcpService('https://custom-api.example.com');

// Custom timeout settings
const service = new PortfolioMcpService(undefined, {
  timeout: 10000,
  retries: 3
});
```

## 📚 Examples

### Basic Portfolio Query
```javascript
// Ask the AI assistant:
// "What's my current portfolio status?"

// The MCP server will call:
// get_portfolio_status()

// And return formatted analysis including:
// - Total investment: $50,000
// - Current value: $55,000 
// - Profit: $5,000 (10% return)
// - Allocation: 60% bonds, 40% shares
```

### Rebalancing Advice
```javascript
// Ask the AI assistant:
// "I want to invest another $10,000. How should I rebalance to 20% bonds, 80% shares?"

// The MCP server will call:
// get_financial_advice({ additionalInvestment: 10000 })

// And return specific recommendations:
// - Sell $3,000 of bonds
// - Buy $13,000 of shares  
// - New allocation: 20% bonds, 80% shares
```

### Security Research
```javascript
// Ask the AI assistant:
// "Tell me about security 5131"

// The MCP server will call:
// get_security_info({ securityId: "5131" })

// And return detailed information:
// - Name: Government Bond ETF
// - Current price: ₪52.50
// - Management fee: 0.15%
// - Last update: 2024-01-15 16:30
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md).

### Development Setup
```bash
# Clone repository
git clone https://github.com/shlatchz/financial-portfolio.git
cd financial-portfolio/packages/mcp

# Install dependencies
npm install

# Start development
npm run dev
```

### Adding New Tools
1. Add tool definition to `setupTools()` in `index.ts`
2. Implement tool logic in `PortfolioMcpService.ts`
3. Add tests in `__tests__/`
4. Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - AI integration standard
- [TASE Maya API](https://maya.tase.co.il/) - Israeli stock exchange data
- [Anthropic Claude](https://claude.ai/) - AI assistant integration
- [Microsoft Cursor](https://cursor.com/) - AI code editor integration

---

**💡 Tip**: For the best experience, use the MCP server with AI assistants that support the Model Context Protocol. This enables natural language portfolio queries and automated investment analysis. 