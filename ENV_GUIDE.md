# Environment Configuration Guide

This guide covers the environment setup for the Financial Portfolio Management monorepo.

## 🏛️ Monorepo Structure

The project consists of three packages:
- **`@portfolio/core`**: Shared business logic and types
- **`@portfolio/web`**: React web application  
- **`@portfolio/mcp`**: MCP server for AI assistants

## 🌐 Web Application Environment

### Required Environment Variables

Create a `.env` file in the `packages/web` directory:

```bash
# Google Sheets API Configuration (for auto-starting the app)
VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
VITE_DEFAULT_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID

# Development Configuration
VITE_ENVIRONMENT=development
```

### Getting Your Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**
4. Go to **Credentials** → **Create credentials** → **API key**
5. Copy the API key to your `.env` file

### Spreadsheet Setup

Your Google Sheets spreadsheet should have the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| A | Date | 2024-01-15 |
| B | Operation | BUY/SELL/DEPOSIT |
| C | Fund ID | 5131022 |  
| D | Amount | 100 |
| E | Value | 15050 (in agorot for securities, ILS for deposits) |
| F | Commission | 500 (in agorot) |

**Important Notes:**
- Make your spreadsheet **publicly viewable** or use service account authentication
- Values for securities are in agorot (1 ILS = 100 agorot)
- Values for deposits are in ILS (Israeli Shekel)

## 🤖 MCP Server Configuration

The MCP server is configured at runtime through its API. No environment variables needed.

### Configuration Parameters:
- **Google Sheets API Key**: Same key as used for web app
- **Spreadsheet ID**: Extract from your Google Sheets URL
- **Target Distribution**: Bond/Share allocation percentages
- **Custom Securities**: Pension funds, savings accounts, etc.
  - **Static Values**: Fixed values with timestamps
  - **API Integration**: Automatic value fetching from external APIs
  - **Response Parsing**: JavaScript functions to extract values from API responses

## 💼 Custom Securities Configuration

Custom securities allow you to track investments that are not available through the TASE API, such as pension funds, savings accounts, or other financial instruments.

### Basic Configuration

```bash
# Static custom securities in .env file
VITE_CUSTOM_SECURITIES='[
  {
    "id": "pension-fund-1",
    "bondPercentage": 0.3,
    "sharePercentage": 0.7,
    "value": 50000,
    "date": "2024-01-01"
  }
]'
```

### API Integration

For dynamic value fetching, you can configure API endpoints:

```bash
# API-integrated custom securities
VITE_CUSTOM_SECURITIES='[
  {
    "id": "pension-fund-1",
    "bondPercentage": 0.3,
    "sharePercentage": 0.7,
    "value": 50000,
    "date": "2024-01-01",
    "apiUrl": "https://api.pension-fund.com/balance",
    "apiHeaders": {
      "Authorization": "Bearer your-api-token",
      "Content-Type": "application/json"
    },
    "apiResponseParser": "(data) => data.currentBalance"
  }
]'
```

### API Response Parsing

The `apiResponseParser` field accepts a JavaScript function as a string that receives the API response and returns the current value:

**Examples:**
- Simple value extraction: `"(data) => data.value"`
- Nested object: `"(data) => data.portfolio.currentBalance"`
- Array processing: `"(data) => data.accounts.reduce((sum, acc) => sum + acc.balance, 0)"`
- Complex calculations: `"(data) => data.principal + data.accruedInterest"`

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the security |
| `bondPercentage` | number | Yes | Percentage allocated to bonds (0-1) |
| `sharePercentage` | number | Yes | Percentage allocated to shares (0-1) |
| `value` | number | Yes | Base/historical value |
| `date` | string | Yes | Date of the base value (YYYY-MM-DD) |
| `apiUrl` | string | No | API endpoint to fetch current value |
| `apiHeaders` | object | No | HTTP headers for API requests |
| `apiResponseParser` | string | No | JavaScript function to parse API response |
| `currentValue` | number | No | Current value (auto-populated from API) |
| `currentValueDate` | string | No | Date of current value (auto-populated) |

### Security Considerations

- **API Keys**: Store sensitive API keys in environment variables
- **CORS**: Ensure API endpoints support CORS or use proxy servers
- **Rate Limiting**: APIs are called periodically, consider rate limits
- **Error Handling**: System falls back to static values if API fails

## 🔧 Development Setup

### Prerequisites
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+) 
npm --version
```

### Installation
```bash
# Install all dependencies
npm install

# Build the core package
npm run build --workspace=packages/core

# Start web development server
npm run dev

# Start MCP server (in another terminal)
npm run dev:mcp
```

### Available Scripts

From the root directory:
```bash
# Development
npm run dev          # Start web app
npm run dev:mcp      # Start MCP server

# Production builds
npm run build        # Build all packages
npm run start        # Start web app production
npm run start:mcp    # Start MCP server production

# Workspace-specific commands
npm run build --workspace=packages/core
npm run dev --workspace=packages/web
npm run dev --workspace=packages/mcp
```

## 🌍 Deployment

### Web Application (Netlify)

The web application is configured for Netlify deployment:

1. Connect your repository to Netlify
2. Build settings are configured in `netlify.toml`
3. Add environment variables in Netlify dashboard:
   - `VITE_DEFAULT_GOOGLE_SHEETS_API_KEY`
   - `VITE_DEFAULT_SPREADSHEET_URL` (optional)

### MCP Server

The MCP server can be deployed anywhere Node.js is supported:

```bash
# Build for production
npm run build --workspace=packages/mcp

# Run in production
npm run start:mcp
```

Or use the built executable:
```bash
cd packages/mcp
node dist/index.js
```

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Make spreadsheets public** or use service account authentication
4. **Restrict API key access** in Google Cloud Console
5. **Regularly rotate API keys**

## 🆘 Troubleshooting

### Common Issues

**"Google Sheets API key not configured"**
- Check your `.env` file in `packages/web/`
- Ensure the variable name is `VITE_DEFAULT_GOOGLE_SHEETS_API_KEY`
- Restart the development server after adding environment variables

**"Unable to access spreadsheet"**
- Verify the spreadsheet is publicly viewable
- Check the spreadsheet ID is correct
- Ensure the Google Sheets API is enabled in your Google Cloud project

**"No inputs were found in config file"**
- Check that source files are in the correct directories (`src/`)
- Verify TypeScript configuration files are correct
- Run `npm run build` from the package directory

**Workspace dependency issues**
- Run `npm install` from the root directory
- Ensure the core package is built: `npm run build --workspace=packages/core`
- Check that package references use `file:../core` format

### Getting Help

1. Check the package-specific README files
2. Review the [main README](README.md) for architecture details
3. Look at [USAGE_EXAMPLES.md](packages/mcp/USAGE_EXAMPLES.md) for MCP examples
4. Open an issue on GitHub with detailed error information

---

**Note**: This is development configuration guidance. For production deployments, consult your deployment platform's documentation for environment variable management. 