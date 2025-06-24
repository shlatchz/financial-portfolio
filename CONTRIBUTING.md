# 🤝 Contributing to Portfolio Manager

Thanks for your interest in contributing! This guide will help you get started quickly.

## 🚀 Quick Start

```bash
# Fork and clone
git clone https://github.com/your-username/portfolio-manager.git
cd portfolio-manager

# Install and setup
npm install
npm run dev
```

## 📋 Development Guidelines

### Code Standards
- **TypeScript** - Strict typing, no `any` types
- **React** - Functional components with hooks
- **ESLint** - Run `npm run lint:fix` before committing
- **Material-UI** - Use theme system consistently

### Commit Guidelines
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits focused and atomic
- Write clear, descriptive commit messages

## 🎯 Priority Areas

### 🔥 High Priority
- **Additional Market Data Sources** - Support for more exchanges
- **Performance Optimization** - Reduce bundle size, improve loading
- **Mobile Experience** - Enhanced mobile responsiveness
- **Advanced Analytics** - More sophisticated portfolio metrics

### 🌟 Medium Priority
- **Dark Mode** - Theme toggle implementation
- **Export Features** - PDF/Excel export functionality
- **Internationalization** - Multi-language support
- **Advanced Charts** - More visualization options

### 💡 Good First Issues
- **Documentation** - Improve inline code documentation
- **Accessibility** - ARIA labels and keyboard navigation
- **Unit Tests** - Add test coverage for utilities
- **UI Polish** - Minor UX improvements

## 🛠️ Development Workflow

### 1. Setup Environment
```bash
# Required: Node.js 18+, npm 8+
npm install
cp .env.example .env  # Optional - can configure in UI
```

### 2. Make Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Development commands
npm run dev          # Start dev server
npm run lint         # Check code style
npm run type-check   # Validate TypeScript
```

### 3. Testing
```bash
# Before submitting PR
npm run lint:fix     # Auto-fix linting issues
npm run build        # Ensure build works
npm run preview      # Test production build
```

### 4. Submit PR
- Reference related issues
- Provide clear description
- Include screenshots for UI changes
- Ensure CI passes

## 🏗️ Architecture Overview

```
src/
├── components/      # Reusable UI components
├── services/        # API integrations (TASE, Google Sheets)
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── config/         # App configuration and constants
├── utils/          # Helper functions and formatters
└── theme/          # Material-UI theming system
```

### Key Technologies
- **React 18** + **TypeScript** - Modern React with full type safety
- **Material-UI** - Professional UI components
- **TanStack Query** - Server state management
- **Vite** - Fast build tool and dev server
- **Decimal.js** - Precise financial calculations

## 🐛 Bug Reports

Include:
- **Environment** - OS, browser, Node.js version
- **Steps to reproduce** - Clear, numbered steps
- **Expected vs actual behavior**
- **Screenshots** - If UI-related
- **Console errors** - Check browser dev tools

## 💡 Feature Requests

Describe:
- **Problem** - What needs to be solved?
- **Solution** - How should it work?
- **Use case** - Real-world example
- **Alternatives** - Other approaches considered

## 🎨 Design Guidelines

### UI Patterns
- Use **glass-morphism** design system
- Follow **Material Design** principles
- Implement **responsive** layouts (mobile-first)
- Add **smooth animations** (300ms standard)

### Code Patterns
- **Custom hooks** for reusable logic
- **Constants** for magic numbers
- **Type-safe** API integrations
- **Error boundaries** for error handling

## 📚 Resources

- [Material-UI Documentation](https://mui.com/)
- [React Query Guide](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TASE API Documentation](https://maya.tase.co.il/)

## 🏆 Recognition

Contributors will be:
- Added to the README contributors section
- Mentioned in release notes for significant contributions
- Invited to join as maintainers for consistent high-quality contributions

---

**Questions?** Open a [Discussion](https://github.com/your-username/portfolio-manager/discussions) or reach out to the maintainers.

Happy coding! 🎉 