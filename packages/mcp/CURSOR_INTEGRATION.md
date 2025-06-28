# Using Financial Portfolio MCP with Cursor

This guide shows how to integrate and use the Financial Portfolio MCP server with Cursor, the AI-powered code editor.

## Prerequisites

1. **Cursor installed** - Download from [cursor.sh](https://cursor.sh)
2. **Node.js** (version 18 or higher)
3. **Google Sheets API key** - From [Google Cloud Console](https://console.cloud.google.com/)
4. **Portfolio spreadsheet** - Google Sheets with transaction data

## Setup Instructions

### 1. Build the MCP Server

Ensure your Financial Portfolio MCP is built and ready:

```bash
cd /path/to/financial-portfolio-mcp
npm install
npm run build
```

### 2. Configure Cursor for MCP ✅ (UPDATED)

Your `~/.cursor/mcp.json` file should already contain the working configuration:

```json
{
  "mcpServers": {
    "financial-portfolio": {
      "command": "node",
      "args": [
        "/Users/ronyf/Workspace/Playground/one/packages/mcp/dist/netlify-bridge.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "NETLIFY_MCP_URL": "https://financial-portfolio-shlatchz.netlify.app/api/mcp"
      }
    }
  }
}
```

**This uses the Netlify bridge for reliability and production-grade performance.**

### 3. Restart Cursor

After adding the MCP configuration, restart Cursor to load the new server.

## 🎯 Quick Test (Verify It's Working)

After restarting Cursor, test in a new chat:

```
@financial-portfolio test_connections
```

You should see: `✅ TASE API connection successful`

## Using the MCP in Cursor

### Initial Setup Workflow

1. **Open a new file or chat** in Cursor
2. **Configure your portfolio** first:

```
@financial-portfolio configure_portfolio with:
- googleSheetsApiKey: "your-api-key-here"
- spreadsheetId: "your-spreadsheet-id"
- targetBondPercentage: 0.6
- targetSharePercentage: 0.4
```

3. **Test the full workflow**:

```
@financial-portfolio get_portfolio_status
```

### Common Cursor Workflows

#### Portfolio Analysis Workflow

```
@financial-portfolio I want to analyze my investment portfolio. Can you:
1. Show me my current portfolio status
2. Analyze the performance 
3. Give me rebalancing advice
```

#### Security Research Workflow

```
@financial-portfolio I'm researching TASE security 5131. Can you:
1. Get detailed information about this security
2. Check how it fits with my current allocation
3. Advise if I should invest more in it
```

#### Investment Decision Workflow

```
@financial-portfolio I have $10,000 to invest. Please:
1. Show my current portfolio status
2. Calculate optimal allocation for this new investment
3. Provide specific buy recommendations
```

## Advanced Cursor Integration

### Code Generation with Portfolio Data

You can use the MCP data to generate code for portfolio analysis:

```
@financial-portfolio Get my portfolio status, then generate Python code to create visualizations of my asset allocation and performance metrics.
```

### Automated Reporting

```
@financial-portfolio Create a comprehensive portfolio report and then generate HTML/CSS code to display it as a dashboard.
```

### Spreadsheet Integration

```
@financial-portfolio Analyze my portfolio and generate Google Sheets formulas I can use to track my target vs actual allocation.
```

## Cursor-Specific Features

### 1. Inline MCP Usage

While coding, you can invoke the MCP inline:

```python
# Generate portfolio analysis code
# @financial-portfolio Get my current portfolio data and generate Python pandas code to analyze it

import pandas as pd
# MCP will help generate the actual analysis code based on your portfolio
```

### 2. Multi-Step Workflows

Cursor allows chaining MCP requests:

```
@financial-portfolio 
Step 1: Get my portfolio status
Step 2: If any security is underperforming, research alternatives
Step 3: Generate a rebalancing plan
Step 4: Create code to calculate the exact trade amounts needed
```

### 3. Code Documentation

```python
def rebalance_portfolio():
    """
    @financial-portfolio Help me document this function based on my actual portfolio rebalancing logic
    """
    pass
```

## Practical Examples

### Example 1: Portfolio Dashboard Creation

```
@financial-portfolio I want to create a web dashboard for my portfolio. Please:
1. Get my current portfolio status
2. Generate HTML structure for the dashboard
3. Create CSS styling for a professional look
4. Add JavaScript to update the data periodically
```

### Example 2: Risk Analysis Script

```
@financial-portfolio Help me create a Python script that:
1. Fetches my current portfolio data
2. Calculates risk metrics for each holding
3. Generates alerts if allocation drifts too far from targets
4. Exports results to CSV
```

### Example 3: Tax Optimization

```
@financial-portfolio Analyze my portfolio for tax optimization:
1. Show securities with losses for potential tax-loss harvesting
2. Identify holdings approaching long-term capital gains status
3. Generate a tax-efficient rebalancing strategy
```

## Troubleshooting in Cursor

### MCP Not Responding

1. **Check the server status**:
```bash
# In terminal within Cursor
ps aux | grep "financial-portfolio"
```

2. **Restart the MCP**:
   - Go to Cursor Settings
   - Disable and re-enable the MCP server
   - Restart Cursor

3. **Check logs**:
```bash
# View MCP server logs
tail -f ~/.cursor/logs/mcp-financial-portfolio.log
```

### Configuration Issues

**Problem**: "Portfolio not configured" error
**Solution**: 
```
@financial-portfolio Please reconfigure my portfolio with the correct settings.
```

**Problem**: "Google Sheets access denied"
**Solution**: Verify your API key and spreadsheet permissions:
```
@financial-portfolio Test the Google Sheets connection and help me troubleshoot any access issues.
```

### Performance Optimization

For better performance in Cursor:

1. **Cache responses** when possible
2. **Use specific queries** rather than broad requests
3. **Chain related requests** in single conversations

## Best Practices for Cursor Integration

### 1. Workspace Organization

Create a dedicated workspace for portfolio analysis:

```
portfolio-analysis/
├── data/
│   ├── portfolio_data.json
│   └── market_analysis.csv
├── scripts/
│   ├── rebalance_calculator.py
│   └── performance_tracker.js
├── reports/
│   └── monthly_report.html
└── config/
    └── portfolio_config.json
```

### 2. Code Templates

Create reusable templates:

```python
# Portfolio Analysis Template
# @financial-portfolio Get current data and help optimize this template

class PortfolioAnalyzer:
    def __init__(self):
        # MCP will help populate with actual portfolio data
        pass
    
    def get_current_status(self):
        # Implementation with MCP data
        pass
    
    def calculate_rebalance(self, additional_investment=0):
        # Rebalancing logic
        pass
```

### 3. Documentation Automation

```
@financial-portfolio Generate comprehensive documentation for my portfolio management workflow, including:
1. Setup instructions
2. Regular maintenance tasks  
3. Decision-making criteria
4. Risk management procedures
```

## Integration with Other Tools

### Git Integration

```
@financial-portfolio Generate a git commit message for my portfolio rebalancing changes and create a changelog entry.
```

### Database Integration

```python
# @financial-portfolio Help me design a database schema to store my portfolio history and generate the SQL DDL

CREATE TABLE portfolio_snapshots (
    # MCP will suggest optimal schema based on portfolio data
);
```

### API Development

```
@financial-portfolio Help me create a REST API endpoint that serves my portfolio data:
1. Design the API structure
2. Generate the implementation code
3. Add authentication and rate limiting
4. Create API documentation
```

## Monitoring and Alerts

### Automated Monitoring Script

```python
#!/usr/bin/env python3
"""
Portfolio monitoring script - runs daily via cron
@financial-portfolio Help optimize this monitoring logic
"""

import schedule
import time

def check_portfolio_balance():
    # @financial-portfolio Get status and check if rebalancing is needed
    pass

def send_alerts():
    # @financial-portfolio Generate alert conditions based on my risk tolerance
    pass

schedule.every().day.at("09:00").do(check_portfolio_balance)
```

## Security Considerations

When using the MCP in Cursor:

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Regularly rotate credentials**
4. **Monitor API usage** for unusual activity

```bash
# Create .env file (add to .gitignore)
GOOGLE_SHEETS_API_KEY=your_api_key_here
PORTFOLIO_SPREADSHEET_ID=your_spreadsheet_id
```

## Conclusion

The Financial Portfolio MCP integration with Cursor provides powerful capabilities for:

- **Real-time portfolio analysis** while coding
- **Automated report generation** with custom visualizations
- **Risk management** through continuous monitoring
- **Investment research** with data-driven insights
- **Code generation** for financial analysis tools

This integration transforms Cursor into a comprehensive financial analysis environment, combining the power of AI-assisted coding with real-time portfolio management capabilities. 