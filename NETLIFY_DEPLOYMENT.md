# Netlify Deployment Guide

This project is configured for seamless deployment on Netlify with both the web interface and MCP server API endpoints.

## 🚀 Features Deployed

- **Web Interface**: React app for portfolio visualization and rebalancing
- **MCP Server API**: Serverless functions providing portfolio analysis tools
- **TASE API Proxy**: Middleware for accessing Israeli stock exchange data
- **Automatic HTTPS**: SSL certificates and custom domain support
- **CI/CD Integration**: Automatic deployments from GitHub

## 📋 Quick Deployment

### 1. Fork and Connect Repository

1. **Fork this repository** to your GitHub account
2. **Connect Netlify to GitHub**:
   - Log in to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your forked repository

### 2. Configure Build Settings

The `netlify.toml` file is pre-configured with optimal settings:
```toml
[build]
  base = "."
  command = "npm run build:netlify"
  publish = "packages/web/dist"

[functions]
  directory = "netlify/functions"

# API redirects
[[redirects]]
  from = "/api/mcp"
  to = "/.netlify/functions/mcp-api"
  status = 200

[[redirects]]
  from = "/api/maya/*"
  to = "/.netlify/functions/maya-proxy/:splat"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Environment Variables

Set these in your Netlify dashboard (**Site settings → Environment variables**):

#### Environment Variables
```bash
# Google Sheets API Configuration (for auto-starting the app)
VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
VITE_DEFAULT_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/your_id/edit

# Portfolio Configuration  
VITE_FUNDS_TYPE_DISTRIBUTION_BOND=0.2
VITE_FUNDS_TYPE_DISTRIBUTION_SHARE=0.8

# MCP API Configuration
VITE_MCP_API_URL=/api/mcp

# Custom Securities (JSON format)
VITE_CUSTOM_SECURITIES='[{"id":"pension-001","bondPercentage":0.3,"sharePercentage":0.7,"value":50000,"date":"2024-01-01"}]'

# Query Configuration
VITE_QUERY_STALE_TIME=300000
VITE_QUERY_RETRY_COUNT=3
```

### 4. Deploy

```bash
# Push to trigger deployment
git push origin main
```

Your site will be available at:
- **Web Interface**: `https://your-site-name.netlify.app`
- **MCP API**: `https://your-site-name.netlify.app/api/mcp`
- **TASE Proxy**: `https://your-site-name.netlify.app/api/maya/*`

## 🔧 API Endpoints

### MCP Server API

**Endpoint**: `https://your-site.netlify.app/api/mcp`  
**Method**: POST  
**Content-Type**: application/json

#### Available Tools

1. **Configure Portfolio**
   ```json
   {
     "tool": "configure_portfolio",
     "args": {
       "googleSheetsApiKey": "your_api_key",
       "spreadsheetId": "your_spreadsheet_id",
       "targetBondPercentage": 0.2,
       "targetSharePercentage": 0.8,
       "customSecurities": []
     }
   }
   ```

2. **Get Portfolio Status**
   ```json
   {
     "tool": "get_portfolio_status"
   }
   ```

3. **Get Security Information**
   ```json
   {
     "tool": "get_security_info",
     "args": {
       "securityId": "5131"
     }
   }
   ```

4. **Get Financial Advice**
   ```json
   {
     "tool": "get_financial_advice",
     "args": {
       "additionalInvestment": 10000
     }
   }
   ```

5. **Analyze Portfolio Performance**
   ```json
   {
     "tool": "analyze_portfolio_performance"
   }
   ```

6. **Test Connections**
   ```json
   {
     "tool": "test_connections"
   }
   ```

### TASE API Proxy

**Endpoint**: `https://your-site.netlify.app/api/maya/*`  
**Purpose**: Proxies requests to Israeli TASE API to avoid CORS issues  
**Methods**: GET  

Examples:
- `GET /api/maya/mutual/5131` - Get mutual fund data
- `GET /api/maya/etf/5136` - Get ETF data

## 🔨 Build Process

The deployment process builds three packages in sequence:

1. **`@portfolio/core`** - Shared business logic and services
2. **`@portfolio/web`** - React web interface built with Vite
3. **`@portfolio/mcp`** - MCP server functions for Netlify

Build command: `npm run build:netlify`

### Build Output
```
packages/web/dist/          # Web interface static files
netlify/functions/          # Serverless functions
├── mcp-api.cjs            # MCP server API
└── maya-proxy.cjs         # TASE API proxy
```

## 🤖 Using the MCP API

### From AI Assistants (Claude Desktop)

Configure your MCP server to use the Netlify bridge:
```json
{
  "mcpServers": {
    "financial-portfolio": {
      "command": "node",
      "args": ["/path/to/netlify-bridge.js"],
      "env": {
        "NETLIFY_MCP_URL": "https://your-site.netlify.app/api/mcp"
      }
    }
  }
}
```

### From Web Applications

Use fetch API or axios to call the MCP endpoints:
```javascript
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'get_portfolio_status'
  })
});

const result = await response.json();
console.log(result.result);
```

### From Command Line

Test your deployment using curl:
```bash
# Test portfolio status
curl -X POST https://your-site.netlify.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_portfolio_status"}'

# Test security information
curl -X POST https://your-site.netlify.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_security_info", "args": {"securityId": "5131"}}'
```

## 🧪 Testing Your Deployment

### Automated Testing
```bash
# Test your deployed MCP API
npm run test:mcp
TEST_MCP_URL=https://your-site.netlify.app/api/mcp npm run test:mcp

# Verify full deployment
npm run verify:deployment
```

### Manual Testing

1. **Web Interface**:
   - Visit your site URL
   - Test portfolio form with your Google Sheets credentials
   - Verify charts and data display correctly

2. **MCP API**:
   - Use the test script: `node test-netlify-mcp.js https://your-site.netlify.app/api/mcp`
   - Test all 6 available tools
   - Verify error handling

3. **TASE API Proxy**:
   - Test fund lookup: `curl https://your-site.netlify.app/api/maya/etf/5131`
   - Verify CORS headers are present

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Netlify dashboard
   # Common causes:
   # - Missing environment variables
   # - Node version mismatch
   # - Dependency installation failures
   ```

2. **Function Errors**
   ```bash
   # Check function logs in Netlify dashboard
   # Common causes:
   # - API key issues
   # - CORS problems
   # - Timeout errors (10s limit)
   ```

3. **Environment Variable Issues**
   ```bash
   # Verify all required variables are set
   # Check for typos in variable names
   # Ensure values are properly formatted
   ```

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

### Performance Optimization

1. **Function Cold Starts**: Functions may take 2-3 seconds on first request
2. **Caching**: Enable browser caching for static assets
3. **CDN**: Netlify automatically provides global CDN
4. **Compression**: Gzip/Brotli compression enabled by default

## 💰 Cost Considerations

### Netlify Free Tier Limits
- **Bandwidth**: 100GB/month
- **Build Minutes**: 300 minutes/month  
- **Function Invocations**: 125,000/month
- **Function Runtime**: 125,000 seconds/month

### Typical Usage
- **Build Time**: ~2-3 minutes per deployment
- **Function Calls**: ~10-50 per portfolio analysis
- **Bandwidth**: ~5-10MB per user session

### Scaling to Pro Plan
When you exceed free tier limits:
- **Pro Plan**: $19/month
- **Unlimited builds** and higher limits
- **Advanced features**: Forms, analytics, edge functions

## 🔒 Security Considerations

1. **API Keys**: Store securely in environment variables
2. **CORS**: Properly configured for frontend access
3. **HTTPS**: Automatic SSL/TLS certificates
4. **Functions**: Isolated execution environment
5. **Dependencies**: Regular security audits in CI/CD

## 📈 Monitoring

1. **Netlify Analytics**: Built-in traffic and performance metrics
2. **Function Logs**: Real-time logging and error tracking
3. **Uptime Monitoring**: Use external services like UptimeRobot
4. **Performance**: Lighthouse CI integration available

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Modern web interface for portfolio management
- ✅ RESTful API for portfolio data and analysis  
- ✅ MCP server integration for AI assistants
- ✅ Automatic HTTPS and global CDN
- ✅ CI/CD pipeline for continuous deployment

Your financial portfolio management system is now live and ready to use! 