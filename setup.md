# Quick Setup Guide - React Portfolio Manager

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the template environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

### 3. Set Up Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. **Choose your configuration method**:
   - **Option A**: Enter API key in the UI form (recommended)
   - **Option B**: Set default in `.env` file (optional):
     ```bash
     VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=your_actual_api_key_here
     ```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to: http://localhost:3000

## 🎯 Environment Variables

### Essential Configuration

```bash
# Optional - Default Portfolio Data Source  
VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=your_google_api_key_here

# Portfolio Settings
VITE_FUNDS_TYPE_DISTRIBUTION_BOND=0.2
VITE_FUNDS_TYPE_DISTRIBUTION_SHARE=0.8

# Custom Securities (Optional - JSON format)
VITE_CUSTOM_SECURITIES='[{"id":"Pension401k","bondPercentage":0.6,"sharePercentage":0.4,"value":50000,"date":"2024-01-15"}]'

# Demo Data
VITE_DEFAULT_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/1sjyWdmiAwubR-QaqBwpNnpo3cSeTK3sI5S_w64zcXDk/edit?usp=sharing
```

### Built-in Configuration

The following values are built into the application and don't require configuration:
- **TASE API**: `https://maya.tase.co.il` (Maya TASE API)
- **Tax Rates**: 9% for both buy and sell transactions  
- **Management Fee**: 15 ILS fixed fee

## 🎯 Features Available

✅ **React 18.3** - Modern React with improved performance  
✅ **TypeScript** - Type-safe development with camelCase naming  
✅ **Material-UI** - Beautiful, modern UI components  
✅ **TanStack Query** - Smart data fetching and caching  
✅ **MUI X Charts** - Interactive pie charts  
✅ **Custom Securities** - Include pension funds, savings, fixed investments  
✅ **Portfolio Rebalancing** - Smart recommendations considering all securities  
✅ **Responsive Design** - Works on all devices  
✅ **Real-time Analysis** - Live portfolio calculations  
✅ **Error Handling** - Robust error management  
✅ **Environment-based Configuration**  
✅ **Runtime Validation**  
✅ **Development Helper Messages**  
✅ **Production Error Handling**  
✅ **Configurable API Timeouts**  
✅ **Smart Caching Strategy**  
✅ **Responsive Error Messages**

## 🏦 Custom Securities Configuration

Add fixed investments (pension funds, savings accounts, etc.) that can't be traded but should be included in portfolio calculations:

### JSON Format
```bash
VITE_CUSTOM_SECURITIES='[
  {
    "id": "Pension401k",
    "bondPercentage": 0.6,
    "sharePercentage": 0.4,
    "value": 50000,
    "date": "2024-01-15"
  },
  {
    "id": "Savings",
    "bondPercentage": 0.8,
    "sharePercentage": 0.2,
    "value": 25000,
    "date": "2024-01-10"
  }
]'
```

### Key Features
- ✅ Included in total portfolio value and distribution calculations
- ✅ Considered in rebalancing recommendations for tradeable securities
- ✅ Cannot be traded (fixed values)
- ✅ Support mixed bond/share allocations
- ✅ Displayed separately in securities table
- ✅ JSON validation with helpful error messages  

## 📊 Demo Data

The application comes pre-configured with your Google Sheets URL. The environment variable `VITE_DEFAULT_SPREADSHEET_URL` is automatically loaded into the form.

Simply click "Analyze Portfolio" to see your real portfolio data!

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🎨 Architecture

```
src/
├── components/          # React components (camelCase)
│   ├── PortfolioForm.tsx
│   ├── PortfolioSummaryCards.tsx
│   ├── PortfolioChart.tsx
│   └── SecuritiesTable.tsx
├── hooks/              # Custom React hooks
│   └── usePortfolioData.ts
├── services/           # API services (camelCase)
│   ├── googleSheetsService.ts
│   ├── taseApiService.ts
│   └── portfolioAnalyzer.ts
├── config/             # Configuration management
│   ├── env.ts          # Environment variables

├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── vite-env.d.ts       # Environment types
```

## 🛠️ Troubleshooting

### Environment Configuration
```bash
# Check if .env file exists
ls -la .env

# Validate your configuration
npm run dev  # Check browser console for validation messages
```

**Common Issues:**
- ❌ Missing `.env` file → Copy from `.env.example`
- ❌ Invalid Google API key → Check Google Cloud Console
- ❌ Spreadsheet access denied → Make sheet publicly readable

### Development Issues
- **Node.js v18+** required
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- TypeScript errors: Check with `npm run lint`

### API Issues
- **Google Sheets**: Ensure API key has Sheets API enabled
- **TASE API**: Check internet connection and fund IDs
- **CORS**: Modern browsers may block some API calls

## 🔐 Security Configuration

### Production Deployment
```bash
# Set production environment variables
VITE_DEFAULT_GOOGLE_SHEETS_API_KEY=production_api_key
VITE_QUERY_STALE_TIME=600000  # 10 minutes for production
VITE_QUERY_RETRY_COUNT=3      # More retries in production
```

### Environment Validation
The app includes built-in validation:
- ✅ **Development**: Shows helpful info and warnings
- ⚠️ **Missing Config**: Clear error messages
- 🚫 **Production**: Throws errors for invalid setup

## 📈 Performance Tips

- **Caching**: TanStack Query caches data based on `VITE_QUERY_STALE_TIME`
- **Retries**: Configure retry behavior with `VITE_QUERY_RETRY_COUNT`
- **Optimization**: Vite automatically optimizes bundles
- **Tree Shaking**: MUI components are tree-shaken for smaller builds

Happy investing! 🚀📈 