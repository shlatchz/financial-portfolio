# 📊 Portfolio Manager

> **A modern React investment portfolio management system with real-time market data integration, advanced analytics, and intelligent rebalancing recommendations.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## ✨ Features

### 🎯 **Core Functionality**
- **Real-time Market Data** - Integration with Tel Aviv Stock Exchange (TASE) API
- **Portfolio Analysis** - Comprehensive profit/loss calculations and performance metrics
- **Smart Rebalancing** - AI-powered allocation recommendations with tax optimization
- **Multi-Asset Support** - Stocks, bonds, ETFs, and custom securities (pension funds, savings)

### 🎨 **Modern UI/UX**
- **Glass-morphism Design** - Beautiful, modern interface with smooth animations
- **Responsive Layout** - Optimized for desktop, tablet, and mobile devices
- **Interactive Charts** - Real-time data visualization with hover effects
- **RTL Support** - Hebrew and Arabic text handling for international markets

### 🔧 **Developer Experience**
- **TypeScript** - Full type safety and excellent developer experience
- **Modern React** - Hooks, concurrent features, and best practices
- **Performance Optimized** - Intelligent caching and background data updates
- **Production Ready** - Comprehensive error handling and validation

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 8+
- **Google Sheets API Key** (get one [here](https://console.cloud.google.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/portfolio-manager.git
cd portfolio-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Setup Your Portfolio

1. **Create a Google Sheets** spreadsheet with your portfolio data
2. **Get API Key** from Google Cloud Console and enable Google Sheets API
3. **Enter credentials** in the application form (no .env setup required!)
4. **Analyze your portfolio** and get instant insights

### Portfolio Data Format

| Date | Operation | Fund ID | Amount | Value | Commission |
|------|-----------|---------|---------|-------|------------|
| 2024-01-15 | BUY | 5113022 | 100 | 150.50 | 5.00 |
| 2024-01-20 | SELL | 5113022 | 50 | 155.20 | 3.00 |
| 2024-02-01 | DEPOSIT | | | 1000 | |

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React 18 + TypeScript | Modern, type-safe UI development |
| **UI Library** | Material-UI (MUI) | Professional components and theming |
| **State Management** | TanStack Query | Server state management and caching |
| **Charts** | MUI X Charts | Interactive data visualization |
| **Build Tool** | Vite | Lightning-fast development and builds |
| **Calculations** | Decimal.js | Precision financial mathematics |

## 📈 Key Components

### Portfolio Summary Cards
- **Buy Value** - Total invested amount with breakdown
- **Current Value** - Real-time portfolio valuation  
- **Total Income** - Profit/loss with visual indicators
- **Available Cash** - Remaining funds for investment
- **Last Transaction** - Most recent activity tracking

### Interactive Analytics
- **Asset Allocation Chart** - Visual portfolio distribution
- **Securities Table** - Detailed holdings with performance metrics
- **Rebalancing Calculator** - Smart investment recommendations
- **Custom Securities** - Support for non-tradeable assets

## 🎯 Advanced Features

### Smart Rebalancing
```typescript
// Calculate optimal portfolio allocation
const rebalancer = new PortfolioAnalyzer(config, customSecurities);
const recommendations = rebalancer.calculateRebalance(portfolio, newInvestment);
```

### Custom Securities Support
```typescript
// Include pension funds, savings accounts, etc.
const customSecurities = [
  {
    id: "Pension401k",
    bondPercentage: 0.6,
    sharePercentage: 0.4,
    value: 75000,
    date: "2024-01-15"
  }
];
```

### Real-time Data Integration
- **TASE API** - Live market prices and security information
- **Google Sheets** - Dynamic portfolio data synchronization
- **Intelligent Caching** - Optimized API usage with smart cache invalidation

## 🔧 Development

```bash
# Development commands
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Code linting
npm run type-check   # TypeScript validation
```

### Project Structure
```
src/
├── components/      # React components
├── services/        # API integrations
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
├── config/         # Configuration and constants
├── utils/          # Utility functions
└── theme/          # Material-UI theming
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Guide
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TASE (Tel Aviv Stock Exchange)** for providing market data API
- **Material-UI team** for the excellent component library
- **React and TypeScript communities** for the amazing ecosystem

---

<div align="center">

**[📊 View Demo](https://your-demo-url.com)** • **[🐛 Report Bug](https://github.com/your-username/portfolio-manager/issues)** • **[💡 Request Feature](https://github.com/your-username/portfolio-manager/issues)**

Made with ❤️ for investors and developers

</div> 