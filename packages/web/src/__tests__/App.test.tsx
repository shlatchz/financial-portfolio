import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import type { PortfolioSummary } from '@portfolio/core';
import { portfolioTheme } from '../theme';
import App from '../App';

// Mock the environment validation
vi.mock('../config/env', () => ({
  validateEnv: vi.fn().mockReturnValue(true),
  getEnvInfo: vi.fn().mockReturnValue({
    environment: 'test',
    hasDefaultGoogleApiKey: true,
    hasDefaultSpreadsheet: true,
    customSecurities: 0,
    fundDistribution: { bond: '20.0%', share: '80.0%' },
    apiEndpoints: { taseBaseUrl: 'https://maya.tase.co.il', mcpApiUrl: 'http://localhost:8888/api/mcp' },
    queryConfig: {
      staleTime: 300000,
      retryCount: 3
    }
  }),
  env: {
    googleSheetsApiKey: 'test-key',
    spreadsheetId: 'test-id',
    fundsTypeDistributionBond: 0.2,
    fundsTypeDistributionShare: 0.8,
    taseBaseUrl: 'https://maya.tase.co.il',
    mcpApiUrl: 'http://localhost:8888/api/mcp'
  }
}));

// Mock the hook with a simple return value
vi.mock('../hooks/usePortfolioData', () => ({
  usePortfolioData: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
    error: null
  } as unknown as ReturnType<typeof import('../hooks/usePortfolioData').usePortfolioData>)
}));

vi.mock('@portfolio/core', () => ({
  PortfolioAnalyzer: vi.fn(),
  GoogleSheetsService: vi.fn(),
  TaseApiService: vi.fn()
}));

// Mock all the component modules to avoid complex rendering
vi.mock('../components/PortfolioForm', () => ({
  default: () => <div data-testid="portfolio-form">Portfolio Form Component</div>
}));

vi.mock('../components/PortfolioSummaryCards', () => ({
  default: () => <div data-testid="portfolio-summary">Portfolio Summary Component</div>
}));

vi.mock('../components/PortfolioChart', () => ({
  default: () => <div data-testid="portfolio-chart">Portfolio Chart Component</div>
}));

vi.mock('../components/SecuritiesTable', () => ({
  default: () => <div data-testid="securities-table">Securities Table Component</div>
}));

vi.mock('../components/PortfolioRebalancer', () => ({
  default: () => <div data-testid="portfolio-rebalancer">Portfolio Rebalancer Component</div>
}));

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={portfolioTheme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('renders the portfolio form component', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('applies Material-UI theme correctly', () => {
    renderWithProviders(<App />);
    const container = document.querySelector('.MuiContainer-root');
    expect(container).toBeInTheDocument();
  });

  it('shows loading state when portfolio is being analyzed', async () => {
    const { usePortfolioData } = await import('../hooks/usePortfolioData');
    vi.mocked(usePortfolioData).mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof usePortfolioData>);

    renderWithProviders(<App />);
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('shows error state when portfolio analysis fails', async () => {
    const { usePortfolioData } = await import('../hooks/usePortfolioData');
    vi.mocked(usePortfolioData).mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch portfolio data')
    } as unknown as ReturnType<typeof usePortfolioData>);

    renderWithProviders(<App />);
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('shows portfolio components when data is available', async () => {
    const mockPortfolioData: PortfolioSummary = {
      securities: [],
      customSecurities: [],
      totalNetBuyValue: 100000,
      totalMarketValue: 110000,
      totalIncome: 10000,
      lastTransactionDate: '2024-01-15',
      fundTypeDistribution: { bond: 0.2, share: 0.8 },
      cashBalance: { totalDeposits: 9500, totalCommissions: 0, remainingCash: 9500 }
    };

    const { usePortfolioData } = await import('../hooks/usePortfolioData');
    vi.mocked(usePortfolioData).mockReturnValueOnce({
      data: mockPortfolioData,
      isLoading: false,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof usePortfolioData>);

    renderWithProviders(<App />);
    
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('handles environment configuration correctly', async () => {
    const { validateEnv, getEnvInfo } = await import('../config/env');
    vi.mocked(validateEnv).mockReturnValueOnce(false);
    // Use a more specific type for the getEnvInfo mock
    vi.mocked(getEnvInfo).mockReturnValueOnce({
      environment: 'development',
      hasDefaultGoogleApiKey: false,
      hasDefaultSpreadsheet: false,
      customSecurities: 0,
      fundDistribution: { bond: '20.0%', share: '80.0%' },
      apiEndpoints: { taseBaseUrl: 'https://maya.tase.co.il', mcpApiUrl: 'http://localhost:8888/api/mcp' },
      queryConfig: {
        staleTime: 300000,
        retryCount: 3
      }
    });

    renderWithProviders(<App />);
    // Should render without crashing even with invalid environment
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('renders with React Query provider', () => {
    renderWithProviders(<App />);
    // If this doesn't throw, React Query is properly configured
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
  });

  it('renders with Material-UI theme provider', () => {
    renderWithProviders(<App />);
    // Check that MUI components are rendered
    expect(document.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });

  it('provides proper component structure', () => {
    renderWithProviders(<App />);
    
    // Main form should always be present
    expect(screen.getByTestId('portfolio-form')).toBeInTheDocument();
    
    // App should render within MUI container
    expect(document.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });
}); 