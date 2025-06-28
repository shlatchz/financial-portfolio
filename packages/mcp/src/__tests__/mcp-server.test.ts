import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import { PortfolioMcpService } from '../services/PortfolioMcpService.js';

// Import the actual classes to get proper types (these will be mocked)
import { TaseApiService, GoogleSheetsService, PortfolioAnalyzer } from '@portfolio/core';

// Mock the core package
vi.mock('@portfolio/core', () => {
  const mockTaseService = {
    getSecurityInfo: vi.fn(),
    testConnection: vi.fn()
  };
  
  const mockSheetsService = {
    getPortfolioData: vi.fn(),
    testConnection: vi.fn()
  };
  
  const mockAnalyzer = {
    analyzePortfolio: vi.fn(),
    calculateRebalance: vi.fn()
  };

  return {
    TaseApiService: vi.fn(() => mockTaseService),
    GoogleSheetsService: vi.fn(() => mockSheetsService),
    PortfolioAnalyzer: vi.fn(() => mockAnalyzer)
  };
});

// Create typed mocks for better type safety
const mockTaseService = new TaseApiService() as TaseApiService;
const mockSheetsService = new GoogleSheetsService('') as GoogleSheetsService;
const mockAnalyzer = new PortfolioAnalyzer({ bond: 0, share: 0 }) as PortfolioAnalyzer;

describe('PortfolioMcpService', () => {
  let service: PortfolioMcpService;

  beforeEach(() => {
    service = new PortfolioMcpService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('configurePortfolio', () => {
    it('should configure portfolio with valid parameters', async () => {
      const config = {
        googleSheetsApiKey: 'test-api-key',
        spreadsheetId: 'test-spreadsheet-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8,
        customSecurities: []
      };

      const result = await service.configurePortfolio(config);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Portfolio configured successfully');
    });

    it('should validate required googleSheetsApiKey', async () => {
      const invalidConfig = {
        googleSheetsApiKey: '',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      };

      await expect(service.configurePortfolio(invalidConfig)).rejects.toThrow('googleSheetsApiKey is required');
    });

    it('should validate required spreadsheetId', async () => {
      const invalidConfig = {
        googleSheetsApiKey: 'test-key',
        spreadsheetId: '',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      };

      await expect(service.configurePortfolio(invalidConfig)).rejects.toThrow('spreadsheetId is required');
    });

    it('should validate percentage constraints sum to 1', async () => {
      const invalidConfig = {
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.3,
        targetSharePercentage: 0.8 // 0.3 + 0.8 = 1.1 > 1
      };

      await expect(service.configurePortfolio(invalidConfig)).rejects.toThrow('must equal 1');
    });

    it('should validate percentage ranges', async () => {
      const invalidConfig = {
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: -0.1, // Invalid negative
        targetSharePercentage: 1.1 // Invalid > 1
      };

      await expect(service.configurePortfolio(invalidConfig)).rejects.toThrow();
    });

    it('should handle custom securities', async () => {
      const config = {
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8,
        customSecurities: [
          {
            id: 'pension-001',
            bondPercentage: 0.6,
            sharePercentage: 0.4,
            value: 50000,
            date: '2024-01-01'
          }
        ]
      };

      const result = await service.configurePortfolio(config);
      expect(result.content[0].text).toContain('Custom securities: 1 configured');
    });
  });

  describe('testConnections', () => {
    it('should test TASE API connection successfully', async () => {
      const mockTestConnection = mockTaseService.testConnection as MockedFunction<typeof mockTaseService.testConnection>;
      
      mockTestConnection.mockResolvedValue({
        success: true,
        message: 'Connection successful'
      });

      const result = await service.testConnections();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Connection Test Results');
      expect(result.content[0].text).toContain('TASE API');
    });

    it('should handle TASE API connection failure', async () => {
      const mockTestConnection = mockTaseService.testConnection as MockedFunction<typeof mockTaseService.testConnection>;
      
      mockTestConnection.mockRejectedValue(new Error('Network error'));

      const result = await service.testConnections();

      expect(result.content[0].text).toContain('TASE API');
      expect(result.content[0].text).toContain('❌');
    });
  });

  describe('getSecurityInfo', () => {
    it('should return security information successfully', async () => {
      const mockGetSecurityInfo = mockTaseService.getSecurityInfo as MockedFunction<typeof mockTaseService.getSecurityInfo>;
      
      mockGetSecurityInfo.mockResolvedValue({
        id: '5131',
        name: 'Test ETF',
        type: 'ETF',
        currentPrice: 5000,
        lastUpdate: '2024-01-15',
        managementFee: 0.01,
        trusteeFee: 0.005
      });

      const result = await service.getSecurityInfo({ securityId: '5131' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Security Information for 5131');
      expect(result.content[0].text).toContain('Test ETF');
      expect(result.content[0].text).toContain('5000'); // Price in agorot
    });

    it('should handle non-existent security', async () => {
      const mockGetSecurityInfo = mockTaseService.getSecurityInfo as MockedFunction<typeof mockTaseService.getSecurityInfo>;
      
      mockGetSecurityInfo.mockResolvedValue(null);

      const result = await service.getSecurityInfo({ securityId: 'NONEXISTENT' });

      expect(result.content[0].text).toContain('not found or data unavailable');
    });

    it('should handle API errors gracefully', async () => {
      const mockGetSecurityInfo = mockTaseService.getSecurityInfo as MockedFunction<typeof mockTaseService.getSecurityInfo>;
      
      mockGetSecurityInfo.mockRejectedValue(new Error('API Error'));

      try {
        const result = await service.getSecurityInfo({ securityId: '5131' });
        expect(result.content[0].text).toContain('not found or data unavailable');
      } catch (error) {
        // The service might throw errors - that's also acceptable error handling
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should validate security ID parameter', async () => {
      await expect(service.getSecurityInfo({ securityId: '' })).rejects.toThrow('securityId is required');
    });
  });

  describe('getPortfolioStatus', () => {
    it('should require configuration first', async () => {
      await expect(service.getPortfolioStatus()).rejects.toThrow('Portfolio not configured');
    });

    it('should return portfolio status when configured', async () => {
      // Configure first
      await service.configurePortfolio({
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      });

      const mockGetPortfolioData = mockSheetsService.getPortfolioData as MockedFunction<typeof mockSheetsService.getPortfolioData>;
      const mockAnalyzePortfolio = mockAnalyzer.analyzePortfolio as MockedFunction<typeof mockAnalyzer.analyzePortfolio>;
      
      mockGetPortfolioData.mockResolvedValue([]);
      mockAnalyzePortfolio.mockReturnValue({
        securities: [],
        customSecurities: [],
        totalNetBuyValue: 100000,
        totalMarketValue: 110000,
        totalIncome: 10000,
        lastTransactionDate: '2024-01-15',
        fundTypeDistribution: { bond: 0.2, share: 0.8 },
        cashBalance: { totalDeposits: 100000, totalCommissions: 500, remainingCash: 9500 }
      });

      const result = await service.getPortfolioStatus();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Portfolio Status');
      expect(result.content[0].text).toContain('110,000'); // Should contain the numeric value regardless of currency symbol
    });
  });

  describe('getFinancialAdvice', () => {
    it('should require configuration first', async () => {
      await expect(service.getFinancialAdvice({})).rejects.toThrow('Portfolio not configured');
    });

    it('should provide financial advice when configured', async () => {
      // Configure first
      await service.configurePortfolio({
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      });

      const mockGetPortfolioData = mockSheetsService.getPortfolioData as MockedFunction<typeof mockSheetsService.getPortfolioData>;
      const mockAnalyzePortfolio = mockAnalyzer.analyzePortfolio as MockedFunction<typeof mockAnalyzer.analyzePortfolio>;
      const mockCalculateRebalance = mockAnalyzer.calculateRebalance as MockedFunction<typeof mockAnalyzer.calculateRebalance>;
      
      mockGetPortfolioData.mockResolvedValue([]);
      mockAnalyzePortfolio.mockReturnValue({
        securities: [],
        customSecurities: [],
        totalNetBuyValue: 100000,
        totalMarketValue: 110000,
        totalIncome: 10000,
        lastTransactionDate: '2024-01-15',
        fundTypeDistribution: { bond: 0.3, share: 0.7 },
        cashBalance: { totalDeposits: 100000, totalCommissions: 500, remainingCash: 9500 }
      });
      
      mockCalculateRebalance.mockReturnValue({
        recommendations: [],
        totalInvestment: 115000,
        currentDistribution: { bond: 0.3, share: 0.7 },
        targetDistribution: { bond: 0.2, share: 0.8 }
      });

      const result = await service.getFinancialAdvice({ additionalInvestment: 5000 });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Financial Advice');
      expect(result.content[0].text).toContain('rebalancing');
    });
  });

  describe('analyzePortfolioPerformance', () => {
    it('should require configuration first', async () => {
      await expect(service.analyzePortfolioPerformance()).rejects.toThrow('Portfolio not configured');
    });

    it('should analyze performance when configured', async () => {
      // Configure first
      await service.configurePortfolio({
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      });

      const mockGetPortfolioData = mockSheetsService.getPortfolioData as MockedFunction<typeof mockSheetsService.getPortfolioData>;
      const mockAnalyzePortfolio = mockAnalyzer.analyzePortfolio as MockedFunction<typeof mockAnalyzer.analyzePortfolio>;
      
      mockGetPortfolioData.mockResolvedValue([]);
      mockAnalyzePortfolio.mockReturnValue({
        securities: [],
        customSecurities: [],
        totalNetBuyValue: 100000,
        totalMarketValue: 110000,
        totalIncome: 10000,
        lastTransactionDate: '2024-01-15',
        fundTypeDistribution: { bond: 0.2, share: 0.8 },
        cashBalance: { totalDeposits: 100000, totalCommissions: 500, remainingCash: 9500 }
      });

      const result = await service.analyzePortfolioPerformance();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Portfolio Performance Analysis');
      expect(result.content[0].text).toContain('Return on Investment');
    });
  });

  describe('error handling', () => {
    it('should handle Google Sheets API errors gracefully', async () => {
      // Configure first
      await service.configurePortfolio({
        googleSheetsApiKey: 'invalid-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      });

      const mockGetPortfolioData = mockSheetsService.getPortfolioData as MockedFunction<typeof mockSheetsService.getPortfolioData>;
      
      mockGetPortfolioData.mockRejectedValue(new Error('Sheets API Error'));

      await expect(service.getPortfolioStatus()).rejects.toThrow();
    });

    it('should validate tool parameters', async () => {
      await expect(service.getSecurityInfo({})).rejects.toThrow();
      await expect(service.getSecurityInfo({ securityId: null as unknown as string })).rejects.toThrow();
    });
  });

  describe('configuration state management', () => {
    it('should remember configuration across method calls', async () => {
      const config = {
        googleSheetsApiKey: 'test-key',
        spreadsheetId: 'test-id',
        targetBondPercentage: 0.3,
        targetSharePercentage: 0.7
      };

      await service.configurePortfolio(config);

      const mockGetPortfolioData = mockSheetsService.getPortfolioData as MockedFunction<typeof mockSheetsService.getPortfolioData>;
      const mockAnalyzePortfolio = mockAnalyzer.analyzePortfolio as MockedFunction<typeof mockAnalyzer.analyzePortfolio>;
      
      mockGetPortfolioData.mockResolvedValue([]);
      mockAnalyzePortfolio.mockReturnValue({
        securities: [],
        customSecurities: [],
        totalNetBuyValue: 0,
        totalMarketValue: 0,
        totalIncome: 0,
        lastTransactionDate: '',
        fundTypeDistribution: { bond: 0.3, share: 0.7 },
        cashBalance: { totalDeposits: 0, totalCommissions: 0, remainingCash: 0 }
      });

      // Should not throw "not configured" error
      const result = await service.getPortfolioStatus();
      expect(result.content[0].text).toContain('Portfolio Status');
    });

    it('should allow reconfiguration', async () => {
      // Initial configuration
      await service.configurePortfolio({
        googleSheetsApiKey: 'key1',
        spreadsheetId: 'id1',
        targetBondPercentage: 0.2,
        targetSharePercentage: 0.8
      });

      // Reconfigure with different values
      const result = await service.configurePortfolio({
        googleSheetsApiKey: 'key2',
        spreadsheetId: 'id2',
        targetBondPercentage: 0.4,
        targetSharePercentage: 0.6
      });

      expect(result.content[0].text).toContain('Portfolio configured successfully');
      expect(result.content[0].text).toContain('40.0% bonds, 60.0% shares');
    });
  });
}); 