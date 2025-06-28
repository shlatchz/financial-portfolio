# Financial Portfolio Management Monorepo

A comprehensive financial portfolio management system built with TypeScript, featuring both a modern web interface and a Model Context Protocol (MCP) server for AI assistant integration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![CI/CD](https://github.com/shlatchz/financial-portfolio/workflows/CI%2FCD%20Pipeline/badge.svg)

## 🌟 Features

### 📊 Portfolio Management
- **Multi-source Data Integration**: Google Sheets transactions with real-time market data
- **Comprehensive Analysis**: Performance tracking, ROI calculations, and cash flow analysis
- **Israeli Market Focus**: TASE (Tel Aviv Stock Exchange) integration with Maya API
- **Custom Securities Support**: Pension funds, savings accounts, and other investments
- **Tax Optimization**: Considers Israeli tax implications for investment decisions

### 🤖 AI Integration
- **MCP Protocol Support**: Standard interface for AI assistant tools
- **Dual Deployment**: Both stdio (local) and HTTP (cloud) API modes
- **Natural Language Queries**: Ask questions about your portfolio in plain language
- **Investment Advice**: Personalized recommendations based on your goals
- **Real-time Analysis**: Live portfolio data and market prices

### 🎨 Modern Web Interface
- **Material-UI Design**: Responsive, accessible components
- **Interactive Charts**: Portfolio distribution and performance visualization
- **RTL Support**: Full Hebrew language support with proper text direction
- **Dark/Light Themes**: Automatic theme detection and switching
- **Real-time Updates**: Live portfolio data and market prices
- **🆕 Integrated MCP Tools Panel**: Access all AI-powered analysis tools directly from the web interface

## 🏗️ Architecture

This monorepo uses a **shared service architecture** that eliminates code duplication:

### Packages
- **`@portfolio/core`**: Shared business logic (Google Sheets, TASE API, Portfolio Analysis)
- **`@portfolio/web`**: React web interface for portfolio visualization
- **`@portfolio/mcp`**: MCP server with both stdio and HTTP API support

### MCP Server Deployment Modes

1. **Local stdio mode** (for Claude Desktop/Cursor):
   ```bash
   npm run dev:mcp
   ```

2. **HTTP API mode** (via Netlify Functions):
   ```bash
   # Deployed automatically to: https://your-site.netlify.app/api/mcp
   ```

3. **Bridge mode** (use remote deployment locally):
   ```bash
   # Uses Netlify deployment but provides local MCP protocol interface
   npm run build:bridge
   ```

**Key Benefit**: The same portfolio analysis tools are available via all deployment modes using shared `PortfolioMcpService` class - no code duplication!

### 🆕 Web Interface MCP Integration

The web application now includes a dedicated **MCP Tools Panel** that provides direct access to all AI-powered portfolio analysis tools:

#### Features:
- **Interactive Tool Interface**: Each MCP tool has a dedicated UI with input forms and real-time results
- **Environment Auto-Detection**: Automatically connects to local (`netlify dev`) or deployed API endpoints
- **Configuration Management**: Set up Google Sheets integration directly in the web interface
- **Real-time Results**: All tool responses displayed with syntax highlighting and copy functionality
- **Error Handling**: Clear error messages and connection status indicators

#### Available Tools:
- **Portfolio Configuration**: Set Google Sheets API key and target allocations
- **Portfolio Status**: View current holdings and market values
- **Security Lookup**: Get detailed information about specific securities
- **Financial Advice**: Receive personalized rebalancing recommendations
- **Performance Analysis**: Comprehensive portfolio performance metrics
- **Connection Testing**: Verify API connectivity

#### Usage:
1. Open the web interface (`http://localhost:5173` in dev or deployed URL)
2. Scroll to the "MCP AI Tools" panel
3. Configure your Google Sheets API key and spreadsheet ID
4. Use any of the available tools with real-time results

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- Google Sheets API key (for portfolio data)
- Google Spreadsheet with transaction history

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/shlatchz/financial-portfolio.git
cd financial-portfolio

# Install dependencies for all packages
npm install

# Build all packages
npm run build
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```bash
# Google Sheets Configuration (for auto-starting the app)
VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_DEFAULT_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID

# Portfolio Target Allocation
VITE_FUNDS_TYPE_DISTRIBUTION_BOND=0.2  # 20% bonds
VITE_FUNDS_TYPE_DISTRIBUTION_SHARE=0.8 # 80% shares

# Optional: Custom Securities
VITE_CUSTOM_SECURITIES='[{"id":"pension-001","bondPercentage":0.3,"sharePercentage":0.7,"value":50000,"date":"2024-01-01"}]'
```

### 3. Development

#### Web Application
```bash
# Start the web development server
npm run dev
# Access at: http://localhost:5173
```

#### MCP Server
```bash
# Start the MCP server in development mode
npm run dev:mcp

# Or build and run in production mode
npm run build
npm run start:mcp
```

### 4. Testing
```bash
# Run all tests
npm run test

# Run CI pipeline locally
npm run test:ci

# Test MCP API
npm run test:mcp
```

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Fork and Connect**:
   - Fork this repository to your GitHub account
   - Connect your Netlify account to GitHub
   - Create a new site from Git

2. **Environment Variables**:
   Set these in your Netlify dashboard (Site settings → Environment variables):
   ```bash
   VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=your_api_key_here
   VITE_DEFAULT_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID
   VITE_MCP_API_URL=/api/mcp
   ```

3. **Deploy**:
   ```bash
   # The netlify.toml is pre-configured
   # Push to main branch to trigger deployment
   git push origin main
   ```

4. **Access your portfolio**:
   - Web interface: `https://your-site.netlify.app`
   - MCP API endpoint: `https://your-site.netlify.app/api/mcp`

### Alternative Deployments

#### Docker
```bash
# Build Docker image
docker build -t financial-portfolio .

# Run container
docker run -p 3000:3000 -p 3001:3001 financial-portfolio
```

#### Manual Server Deployment
```bash
# Build for production
npm run build:netlify

# Copy dist files to your server
scp -r packages/web/dist/* your-server:/var/www/html/
scp -r netlify/functions/* your-server:/var/functions/
```

## 🔧 Configuration

### Google Sheets Setup

1. **Create Google Sheets API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google Sheets API
   - Create credentials (API Key)

2. **Prepare Your Spreadsheet**:
   ```
   Date        | Operation | FundId  | FundName           | Amount | Units | PricePerUnit | TotalAmount | Commission
   2024-01-01  | DEPOSIT   |         | Cash Deposit       | 10000  | 0     | 0           | 10000       | 0
   2024-01-02  | BUY       | 5131    | Government Bonds   | 5000   | 100   | 50          | 5000        | 25
   2024-01-03  | BUY       | 5136    | Stock Market ETF   | 4000   | 80    | 50          | 4000        | 20
   ```

### MCP Integration

#### For Claude Desktop
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

#### For Cursor (using bridge)
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

## 📊 Supported Markets

- **Primary**: Tel Aviv Stock Exchange (TASE) - Israeli market
- **Securities**: ETFs, mutual funds, government bonds, corporate bonds
- **Currency**: Israeli Shekel (ILS) with automatic agorot conversion
- **Data Source**: Maya API (official TASE data provider)
- **Extensible**: Architecture supports additional markets and currencies

## 🧪 Testing

### Test Suite
```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage

# Test MCP API
npm run test:mcp
```

### CI/CD Pipeline
- ✅ Automated testing on pull requests
- ✅ Linting and type checking
- ✅ Security vulnerability scanning
- ✅ Netlify preview deployments
- ✅ Production deployment on main branch

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test:ci`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Quality
- TypeScript strict mode
- ESLint with strict rules
- Vitest for testing
- Prettier for formatting
- Conventional commits

## 📁 Project Structure

```
financial-portfolio/
├── packages/
│   ├── core/                 # Shared business logic
│   │   ├── src/
│   │   │   ├── services/     # API services
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Utility functions
│   │   └── __tests__/        # Unit tests
│   │
│   ├── web/                  # React web application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── theme/        # Material-UI theme
│   │   │   └── config/       # Configuration
│   │   └── __tests__/        # Component tests
│   │
│   └── mcp/                  # MCP server
│       ├── src/
│       │   ├── services/     # MCP service implementations
│       │   ├── index.ts      # Stdio MCP server
│       │   └── netlify-bridge.ts # HTTP bridge
│       └── __tests__/        # Integration tests
│
├── netlify/
│   └── functions/            # Netlify serverless functions
│
├── .github/
│   └── workflows/            # CI/CD pipelines
│
└── docs/                     # Documentation
```

## 📚 Documentation

- [Setup Guide](setup.md) - Detailed setup instructions
- [Environment Guide](ENV_GUIDE.md) - Environment variable configuration
- [MCP Usage Examples](packages/mcp/USAGE_EXAMPLES.md) - MCP server usage
- [Netlify Deployment](NETLIFY_DEPLOYMENT.md) - Deployment guide
- [Contributing](CONTRIBUTING.md) - Contribution guidelines
- [Security](SECURITY.md) - Security policy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TASE Maya API](https://maya.tase.co.il/) - Israeli stock exchange data
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI integration standard
- [Material-UI](https://mui.com/) - React component library
- [Netlify](https://netlify.com/) - Hosting and serverless functions

## 📞 Support

- 🐛 [Report a Bug](https://github.com/shlatchz/financial-portfolio/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/shlatchz/financial-portfolio/issues/new?template=feature_request.md)
- 📖 [Documentation](https://github.com/shlatchz/financial-portfolio/wiki)
- 💬 [Discussions](https://github.com/shlatchz/financial-portfolio/discussions)

---

**⚠️ Disclaimer**: This is a portfolio tracking tool and should not be considered as financial advice. Always consult with qualified financial advisors before making investment decisions.