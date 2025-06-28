# Financial Portfolio MCP - Usage Examples

This document provides examples of how to use the Financial Portfolio MCP tools once integrated with Claude Desktop or another MCP client.

## Setup Sequence

### 1. First Configure Your Portfolio

```
Please configure my portfolio with the following settings:
- Google Sheets API key: [your-api-key]
- Spreadsheet ID: [your-spreadsheet-id] 
- Target allocation: 60% bonds, 40% shares
- No custom securities for now
```

### 2. Test Connections

```
Please test the API connections to make sure everything is working.
```

## Common Usage Scenarios

### Portfolio Status Queries

**"What's my current portfolio status?"**
- Shows total market value and investment
- Displays profit/loss with percentages
- Current asset distribution
- Individual holdings with current prices
- Available cash balance

**"How is my portfolio performing?"**  
- Comprehensive performance analysis
- Return on investment calculations
- Asset allocation breakdown
- Historical transaction summary

### Security Research

**"Can you look up information about TASE security 5131?"**
- Security name and classification (Bond/Share)
- Current market price
- Management and trustee fees
- Last update timestamp

**"I'm considering investing in security 1234, what can you tell me about it?"**
- Detailed security information from TASE
- Fee structure analysis
- Fund type classification

### Financial Advice

**"Should I rebalance my portfolio?"**
- Current vs target distribution analysis
- Specific buy/sell recommendations  
- Target values and required actions
- Portfolio balance assessment

**"I have $10,000 to invest, how should I allocate it?"**
- Rebalancing with additional investment
- Optimized allocation recommendations
- Specific fund purchase suggestions

**"My portfolio seems unbalanced, what should I do?"**
- Portfolio analysis with actionable advice
- Risk assessment based on current allocation
- Step-by-step rebalancing plan

### Performance Analysis

**"What's my total return on investment?"**
- ROI calculations with percentages
- Profit/loss breakdown by security
- Total commissions and fees paid
- Available cash analysis

**"Show me a breakdown of my investment performance."**
- Detailed financial metrics
- Asset allocation analysis
- Performance vs benchmarks (if available)
- Transaction history impact

## Advanced Scenarios

### Custom Securities Integration

**Configure with pension funds:**
```
Please reconfigure my portfolio to include my pension fund:
- Pension Fund ABC: $50,000 value, 70% bonds, 30% shares
- Target allocation remains 60% bonds, 40% shares
```

### Portfolio Optimization

**"I want to optimize my portfolio for better returns."**
- Analysis of current allocation efficiency
- Rebalancing recommendations
- Fee impact assessment
- Risk-adjusted optimization suggestions

### Market Analysis

**"How do current market prices affect my portfolio?"**
- Real-time market value calculations
- Price movement impact analysis
- Market timing considerations
- Volatility assessment

## Data Requirements

### Google Sheets Format
Your spreadsheet should have columns:
- **Date**: Transaction date (YYYY-MM-DD)
- **Operation**: DEPOSIT, BUY, or SELL
- **Fund ID**: TASE security identifier
- **Amount**: Number of units
- **Value**: Transaction value in currency
- **Commission**: Transaction fees

### Example Spreadsheet Data:
```
Date       | Operation | Fund ID | Amount | Value  | Commission
2024-01-15 | DEPOSIT   |         |        | 10000  | 0
2024-01-16 | BUY       | 5131    | 100    | 5000   | 25
2024-01-20 | BUY       | 1234    | 50     | 4975   | 25
2024-02-15 | SELL      | 5131    | 20     | 1100   | 15
```

## Error Handling

### Common Error Messages and Solutions:

**"Portfolio not configured"**
- Run the configure_portfolio tool first
- Ensure all required parameters are provided

**"Google Sheets access denied"**
- Check spreadsheet is publicly viewable
- Verify API key has proper permissions
- Confirm spreadsheet ID is correct

**"Security not found"**
- Verify the security ID format (should be numeric)
- Check if security is traded on TASE
- Some securities may have limited API availability

**"Target percentages must sum to 1.0"**
- Ensure bond + share percentages = 100%
- Use decimal format (0.6 for 60%, not 60)

## Best Practices

1. **Regular Monitoring**: Check portfolio status weekly
2. **Rebalancing**: Review allocation monthly or quarterly  
3. **Data Accuracy**: Keep spreadsheet transaction history updated
4. **Fee Awareness**: Monitor total commission costs
5. **Diversification**: Maintain target allocation discipline
6. **Market Timing**: Use advice for strategic rebalancing, not day trading

## Integration Tips

- The MCP responds best to natural language queries
- You can chain requests: "Show my status, then give me advice"
- Complex analysis can be broken into multiple steps
- Always test connections when experiencing issues 