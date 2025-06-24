# ⚙️ Environment Configuration Guide

Quick setup guide for configuring the Portfolio Management System.

## 🚀 Quick Setup

**No .env file required!** You can now configure everything through the UI. For automation or defaults, optionally set these environment variables:

```bash
# Optional: Copy example and customize
cp .env.example .env
```

## 📊 Data Source Configuration

### Google Sheets API Key
- **Variable**: `VITE_DEFAULT_GOOGLE_SHEETS_API_KEY` *(optional)*
- **Purpose**: Pre-fill API key in the UI form
- **Setup**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create/select project → Enable Google Sheets API
  3. Create API key → Restrict to Google Sheets API
- **Alternative**: Enter directly in the application form

### Default Spreadsheet
- **Variable**: `VITE_DEFAULT_SPREADSHEET_URL` *(optional)*
- **Purpose**: Auto-load a specific spreadsheet
- **Format**: Full Google Sheets URL
- **Example**: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

## 📈 Portfolio Configuration

### Fund Distribution
Configure default asset allocation for unknown securities:

```bash
VITE_FUNDS_TYPE_DISTRIBUTION_BOND=0.2    # 20% bonds
VITE_FUNDS_TYPE_DISTRIBUTION_SHARE=0.8   # 80% shares
```

**Requirements**: Must sum to exactly 1.0

### Custom Securities
Include non-tradeable assets (pension funds, savings accounts):

```bash
VITE_CUSTOM_SECURITIES='[
  {
    "id": "Pension401k",
    "bondPercentage": 0.6,
    "sharePercentage": 0.4,
    "value": 75000,
    "date": "2024-01-15"
  },
  {
    "id": "SavingsAccount", 
    "bondPercentage": 1.0,
    "sharePercentage": 0.0,
    "value": 25000,
    "date": "2024-01-20"
  }
]'
```

**Schema**:
- `id`: Unique identifier (string)
- `value`: Current value in ILS (positive number)
- `bondPercentage`: Bond allocation 0.0-1.0
- `sharePercentage`: Share allocation 0.0-1.0
- `date`: Date string (any format)

**Validation**: Bond + Share percentages must sum to 1.0

## ⚡ Performance Settings

### Cache Configuration
```bash
VITE_QUERY_STALE_TIME=300000    # 5 minutes (default)
VITE_QUERY_RETRY_COUNT=2        # API retry attempts
```

**Note**: Press "Analyze Portfolio" again to force fresh data regardless of cache settings.

## 🔧 Built-in Configuration

These values are hardcoded in the application:

| Setting | Value | Description |
|---------|-------|-------------|
| **TASE API** | `https://maya.tase.co.il` | Market data source |
| **Tax Rates** | 9% buy/sell | Israeli transaction tax |
| **Management Fee** | 15 ILS | Monthly portfolio fee |

## ✅ Validation

The app validates your configuration on startup:

### Errors (Block production startup)
- Fund distribution doesn't sum to 1.0
- Custom securities missing required fields
- Invalid percentage values

### Warnings (Development only)
- Missing optional environment variables
- Imprecise fund distribution sums

## 🛡️ Security Best Practices

1. **Never commit `.env` files** - use `.env.example` for templates
2. **Restrict API keys** - Limit to specific APIs and domains
3. **Use different keys** - Separate development/production credentials
4. **Monitor usage** - Check Google Cloud Console for unusual activity

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Set `VITE_DEFAULT_GOOGLE_SHEETS_API_KEY` or enter in UI |
| "Fund distribution should sum to 1.0" | Check bond + share percentages = 1.0 |
| "Custom security validation failed" | Verify JSON format and required fields |
| "Spreadsheet access denied" | Make sheet public or check API permissions |

### Debug Tips
- Check browser console for detailed errors
- Verify `.env` syntax (no spaces around `=`)
- Test API key in Google Cloud Console
- Ensure spreadsheet is accessible

## 📋 Example Configuration

Complete `.env.example` template:

```bash
# Google Sheets (Optional - can be set in UI)
VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=
VITE_DEFAULT_SPREADSHEET_URL=

# Fund Distribution (Required)
VITE_FUNDS_TYPE_DISTRIBUTION_BOND=0.2
VITE_FUNDS_TYPE_DISTRIBUTION_SHARE=0.8

# Custom Securities (Optional)
VITE_CUSTOM_SECURITIES=[]

# Performance (Optional)
VITE_QUERY_STALE_TIME=300000
VITE_QUERY_RETRY_COUNT=2
```

---

**Need help?** Check the [main README](README.md) or open an [issue](https://github.com/your-username/portfolio-manager/issues). 