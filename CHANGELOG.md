# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-07-12

### ✨ Custom Securities API Integration & UI Improvements
- **Dynamic Value Fetching**: Custom securities now support API integration for fetching current values (with headers and custom response parsing).
- **Profit/Loss Calculation**: The profit/loss column for custom securities now uses the latest current value (if available) and is color-coded.
- **Flexible Configuration**: `.env` supports single-line JSON for custom securities, including API fields and parser functions.
- **Graceful Fallback**: If API fetching fails, static values are used.

## [2.1.0] - 2024-12-28

### 🚀 Performance & Reliability Improvements

#### ⚡ Fixed Function Timeouts
- **CRITICAL FIX**: Resolved 10-second timeout issues in deployed web application
- **Optimized API Calls**: Replaced sequential TASE API calls with parallel batch processing
- **Performance Boost**: 5-10x faster portfolio analysis for multiple securities
- **Batch Processing**: Implemented efficient `getMultipleSecurities()` with 5-fund batches and 100ms delays

#### 🔒 Complete Type Safety Enforcement
- **Zero `any` Types**: Eliminated all explicit `any` types from the entire codebase
- **ESLint Enforcement**: Changed `@typescript-eslint/no-explicit-any` from 'warn' to 'error'
- **CI Integration**: Type safety now enforced in all CI pipelines
- **Declaration Files**: Automated generation of complete TypeScript declarations

#### 🛠️ CI/CD Pipeline Fixes
- **Module Resolution**: Fixed "Could not resolve ./config/constants.js" errors in CI
- **Build Consistency**: Implemented automated build process for reliable CI environments
- **Extension Handling**: Proper ES module `.js` extensions for all imports
- **TypeScript Compilation**: Force clean builds with cache clearing for CI reliability

#### 📦 Build System Improvements
- **Automated Type Exports**: Added `build-ci.js` script to ensure types are exported in CI
- **Clean Builds**: Remove TypeScript cache before compilation for consistency
- **Package Lock Sync**: Updated dependencies to ensure `npm ci` compatibility
- **Monorepo Reliability**: Improved cross-package build orchestration

### 🔧 Code Quality & Maintainability

#### 📚 Documentation Updates
- **Comprehensive README**: Updated with latest features and deployment instructions
- **API Documentation**: Complete MCP tool documentation with examples
- **Troubleshooting Guide**: Added timeout resolution and CI debugging information
- **Environment Setup**: Improved configuration instructions

#### 🧹 Repository Cleanup
- **Temporary Files**: Automated cleanup of `.tsbuildinfo` and `.DS_Store` files
- **Build Artifacts**: Proper gitignore for build outputs and cache files
- **Code Consistency**: Unified formatting and style across all packages

### 🧪 Testing & Validation

#### ✅ Test Coverage
- **49 Total Tests**: All tests passing (17 core + 22 mcp + 10 web)
- **Type Checking**: Full TypeScript compilation validation in CI
- **ESLint Validation**: Zero warnings with strict rules enforcement
- **Integration Testing**: End-to-end MCP API validation

#### 🌐 Deployment Validation
- **Production Ready**: All functions optimized for Netlify 10-second limits
- **Error Handling**: Improved error messages and timeout handling
- **Performance Monitoring**: Better logging for timeout diagnosis

### 🔄 Migration & Compatibility

#### ⚙️ Breaking Changes
- **Node.js Requirement**: Minimum Node.js version 18.0.0 (no change)
- **TypeScript**: Strict type checking now enforced (may require fixes in custom implementations)

#### 🔙 Backward Compatibility
- **API Endpoints**: All existing MCP tools maintain same interface
- **Web Interface**: No changes to user experience
- **Configuration**: Environment variables remain the same

### 📊 Technical Metrics

#### Performance Improvements
- **Function Execution Time**: Reduced from 10+ seconds to 2-5 seconds
- **Build Time**: Consistent 2-3 minute CI builds
- **Bundle Size**: Optimized to 710KB minified + gzipped
- **Type Safety**: 100% TypeScript coverage with zero `any` types

#### Quality Metrics
- **ESLint Score**: 0 warnings/errors across all packages
- **Test Coverage**: 100% test pass rate
- **CI Reliability**: Stable builds in clean environments
- **Documentation**: Complete API and deployment guides

## [2.0.0] - 2024-01-XX

### 🚀 Major Changes
- **BREAKING**: Converted to monorepo architecture with three packages
- **NEW**: Added Model Context Protocol (MCP) server for AI assistant integration
- **NEW**: Created shared `@portfolio/core` package for business logic
- **RESTRUCTURED**: Moved web application to `@portfolio/web` package

### ✨ Added
- **MCP Server**: Full-featured MCP server for AI assistants (Claude, GPT, etc.)
  - Portfolio status querying via natural language
  - Investment advice and rebalancing recommendations
  - Real-time market data access through AI tools
  - Configuration management for portfolio settings
- **Core Package**: Shared TypeScript library
  - Consolidated services (TaseApiService, GoogleSheetsService, PortfolioAnalyzer)
  - Unified type definitions for all packages
  - Reusable formatting utilities and configuration
- **Workspace Configuration**: Full npm workspaces support
  - Centralized dependency management
  - Cross-package development workflows
  - Unified build and development scripts

### 🔧 Changed
- **Services**: Made TaseApiService and GoogleSheetsService more flexible and environment-agnostic
- **Dependencies**: Removed duplicated packages across projects
- **Documentation**: Comprehensive README updates for monorepo structure
- **Build System**: Updated to support workspace builds and development

### 📦 Package Structure
```
├── packages/
│   ├── core/          # @portfolio/core - Shared business logic
│   ├── web/           # @portfolio/web - React web application  
│   └── mcp/           # @portfolio/mcp - MCP server for AI integration
```

### 🔄 Migration Notes
- Web application functionality remains unchanged
- All existing features preserved in `@portfolio/web`
- New AI integration capabilities available via `@portfolio/mcp`
- Shared logic consolidated in `@portfolio/core`

### 🤖 AI Integration Features
- **Natural Language Queries**: "What's my current portfolio status?"
- **Investment Advice**: "Should I rebalance my portfolio with ₪10,000?"
- **Market Data**: "Get information about security 5131"
- **Performance Analysis**: "Analyze my portfolio performance"

## [1.2.0] - 2024-01-15

### Added
- Netlify Functions support for MCP server via HTTP API
- Shared `PortfolioMcpService` architecture for code reusability
- Web interface toggle for local vs cloud MCP usage
- Comprehensive API documentation for HTTP endpoints

### Changed
- Refactored MCP server to use shared service layer
- Eliminated code duplication between stdio and HTTP interfaces
- Improved build process to include MCP package in Netlify deployment

### Fixed
- TypeScript errors with undefined security fee properties
- Build configuration for proper package compilation order

## [1.1.0] - 2024-01-14

### ✨ Added
- Initial release of the portfolio management web application
- Real-time TASE (Tel Aviv Stock Exchange) API integration
- Google Sheets portfolio data import
- Intelligent portfolio rebalancing recommendations
- Interactive charts and analytics
- RTL support for Hebrew language
- Material-UI modern interface
- TypeScript full type safety
- Custom securities support (pension funds, savings)

### 🎯 Features
- Portfolio performance tracking and analysis
- Profit/loss calculations with tax considerations
- Asset allocation visualization
- Commission optimization
- Cash balance management
- Responsive design for all devices

### 🌍 Market Support
- Tel Aviv Stock Exchange (TASE)
- Israeli ETFs and mutual funds
- Government and corporate bonds
- Real-time price updates

### 🔧 Technical
- React 18 with modern hooks
- TypeScript for type safety
- Vite for fast development
- TanStack Query for state management
- Decimal.js for financial precision
- Comprehensive error handling 