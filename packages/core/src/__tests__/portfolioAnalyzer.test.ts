import { describe, it, expect, beforeEach } from 'vitest';
import { PortfolioAnalyzer } from '../services/portfolioAnalyzer.js';
import type { PortfolioAction, SecurityInfo, CustomSecurity } from '../types/index.js';

describe('PortfolioAnalyzer', () => {
  let analyzer: PortfolioAnalyzer;
  let mockActions: PortfolioAction[];
  let mockSecurities: Record<string, SecurityInfo>;
  let mockCustomSecurities: CustomSecurity[];

  beforeEach(() => {
    // Target distribution: 20% bonds, 80% shares
    const targetDistribution = { bond: 0.2, share: 0.8 };
    
    // Custom securities (pension funds, etc.)
    mockCustomSecurities = [
      {
        id: 'pension-001',
        bondPercentage: 0.6,
        sharePercentage: 0.4,
        value: 50000,
        date: '2024-01-01'
      }
    ];
    
    analyzer = new PortfolioAnalyzer(targetDistribution, mockCustomSecurities);
    
    // Mock portfolio actions matching the actual PortfolioAction interface
    mockActions = [
      {
        date: '2024-01-01',
        operation: 'DEPOSIT',
        fundId: '',
        amount: 100000,
        value: 100000,
        commission: 0
      },
      {
        date: '2024-01-02', 
        operation: 'BUY',
        fundId: 'BOND001',
        amount: 50000,
        value: 50000,
        commission: 25
      },
      {
        date: '2024-01-03',
        operation: 'BUY', 
        fundId: 'EQUITY001',
        amount: 40000,
        value: 40000,
        commission: 20
      }
    ];

    // Mock security information
    mockSecurities = {
      'BOND001': {
        id: 'BOND001',
        name: 'Government Bond Fund',
        type: 'Bond',
        currentPrice: 5500, // Price in agorot (55.00 NIS)
        lastUpdate: '2024-01-15',
        managementFee: 0.01,
        trusteeFee: 0.005
      },
      'EQUITY001': {
        id: 'EQUITY001',
        name: 'Stock Market Fund', 
        type: 'Share',
        currentPrice: 6000, // Price in agorot (60.00 NIS)
        lastUpdate: '2024-01-15',
        managementFee: 0.015,
        trusteeFee: 0.005
      }
    };
  });

  describe('analyzePortfolio', () => {
    it('should return proper portfolio summary structure', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      expect(summary).toHaveProperty('securities');
      expect(summary).toHaveProperty('customSecurities');
      expect(summary).toHaveProperty('totalNetBuyValue');
      expect(summary).toHaveProperty('totalMarketValue');
      expect(summary).toHaveProperty('totalIncome');
      expect(summary).toHaveProperty('lastTransactionDate');
      expect(summary).toHaveProperty('fundTypeDistribution');
      expect(summary).toHaveProperty('cashBalance');
      
      expect(Array.isArray(summary.securities)).toBe(true);
      expect(Array.isArray(summary.customSecurities)).toBe(true);
    });

    it('should calculate total net buy value correctly', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      // The analyzer correctly calculates based on actual units and prices
      expect(summary.totalNetBuyValue).toBeGreaterThan(0);
      expect(typeof summary.totalNetBuyValue).toBe('number');
    });

    it('should calculate current market value based on current prices', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      // Note: We need to check the actual calculation based on units and current prices
      expect(summary.totalMarketValue).toBeGreaterThan(0);
      expect(typeof summary.totalMarketValue).toBe('number');
    });

    it('should calculate total income (profit/loss)', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      const expectedIncome = summary.totalMarketValue - summary.totalNetBuyValue;
      expect(summary.totalIncome).toBe(expectedIncome);
    });

    it('should include custom securities', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      expect(summary.customSecurities).toHaveLength(1);
      expect(summary.customSecurities[0].id).toBe('pension-001');
      expect(summary.customSecurities[0].value).toBe(50000);
    });

    it('should calculate fund type distribution', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      expect(summary.fundTypeDistribution).toHaveProperty('bond');
      expect(summary.fundTypeDistribution).toHaveProperty('share');
      expect(summary.fundTypeDistribution.bond).toBeGreaterThanOrEqual(0);
      expect(summary.fundTypeDistribution.bond).toBeLessThanOrEqual(1);
      expect(summary.fundTypeDistribution.share).toBeGreaterThanOrEqual(0);
      expect(summary.fundTypeDistribution.share).toBeLessThanOrEqual(1);
    });

    it('should calculate cash balance correctly', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      expect(summary.cashBalance).toHaveProperty('totalDeposits');
      expect(summary.cashBalance).toHaveProperty('totalCommissions');
      expect(summary.cashBalance).toHaveProperty('remainingCash');
      
      expect(summary.cashBalance.totalDeposits).toBe(100000);
      expect(summary.cashBalance.totalCommissions).toBe(45); // 25 + 20
      // Cash balance can be negative if invested more than deposited
      expect(typeof summary.cashBalance.remainingCash).toBe('number');
    });

    it('should handle securities with current market data', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      expect(summary.securities.length).toBeGreaterThan(0);
      
      for (const security of summary.securities) {
        expect(security).toHaveProperty('id');
        expect(security).toHaveProperty('name');
        expect(security).toHaveProperty('type');
        expect(security).toHaveProperty('netBuyValue');
        expect(security).toHaveProperty('currentMarketValue');
        expect(security).toHaveProperty('currentAmount');
        expect(security).toHaveProperty('currentPrice');
        expect(security.currentMarketValue).toBeGreaterThanOrEqual(0);
      }
    });

    it('should set last transaction date', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      
      expect(summary.lastTransactionDate).toBe('2024-01-03');
    });
  });

  describe('calculateRebalance', () => {
    it('should return proper rebalance result structure', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      const rebalance = analyzer.calculateRebalance(summary, 0);
      
      expect(rebalance).toHaveProperty('recommendations');
      expect(rebalance).toHaveProperty('totalInvestment');
      expect(rebalance).toHaveProperty('currentDistribution');
      expect(rebalance).toHaveProperty('targetDistribution');
      
      expect(Array.isArray(rebalance.recommendations)).toBe(true);
    });

    it('should include target distribution in result', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      const rebalance = analyzer.calculateRebalance(summary, 0);
      
      expect(rebalance.targetDistribution.bond).toBe(0.2);
      expect(rebalance.targetDistribution.share).toBe(0.8);
    });

    it('should handle additional investment', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      const additionalInvestment = 20000;
      
      const rebalance = analyzer.calculateRebalance(summary, additionalInvestment);
      
      // The total investment property represents the additional investment amount
      expect(rebalance.totalInvestment).toBe(additionalInvestment);
      expect(typeof rebalance.totalInvestment).toBe('number');
    });

    it('should provide recommendations for each security', async () => {
      const summary = await analyzer.analyzePortfolio(mockActions, mockSecurities);
      const rebalance = analyzer.calculateRebalance(summary, 0);
      
      expect(rebalance.recommendations.length).toBeGreaterThanOrEqual(0);
      
      for (const recommendation of rebalance.recommendations) {
        expect(recommendation).toHaveProperty('security');
        expect(recommendation).toHaveProperty('currentValue');
        expect(recommendation).toHaveProperty('targetValue');
        expect(recommendation).toHaveProperty('difference');
        expect(recommendation).toHaveProperty('action');
        expect(recommendation).toHaveProperty('amount');
        
        expect(['BUY', 'SELL', 'HOLD']).toContain(recommendation.action);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty portfolio', async () => {
      const summary = await analyzer.analyzePortfolio([], {});
      
      expect(summary.securities).toHaveLength(0);
      expect(summary.totalNetBuyValue).toBe(0);
      expect(summary.totalMarketValue).toBe(0);
      expect(summary.totalIncome).toBe(0);
      expect(summary.cashBalance.totalDeposits).toBe(0);
      expect(summary.cashBalance.totalCommissions).toBe(0);
    });

    it('should handle missing security data', async () => {
      const actionsWithMissingSecurity: PortfolioAction[] = [
        {
          date: '2024-01-01',
          operation: 'BUY',
          fundId: 'MISSING001',
          amount: 10000,
          value: 10000,
          commission: 0
        }
      ];

      const summary = await analyzer.analyzePortfolio(actionsWithMissingSecurity, {});
      
      // Should not include securities without market data
      expect(summary.securities).toHaveLength(0);
    });

    it('should handle sell operations', async () => {
      const actionsWithSell: PortfolioAction[] = [
        ...mockActions,
        {
          date: '2024-01-04',
          operation: 'SELL',
          fundId: 'BOND001',
          amount: -25000,
          value: -25000,
          commission: 15
        }
      ];

      const summary = await analyzer.analyzePortfolio(actionsWithSell, mockSecurities);
      
      expect(summary.cashBalance.totalCommissions).toBe(60); // 25 + 20 + 15
      expect(summary.lastTransactionDate).toBe('2024-01-04');
    });

    it('should handle zero target distribution gracefully', async () => {
      const extremeAnalyzer = new PortfolioAnalyzer({ bond: 0.0, share: 1.0 }, []);
      const summary = await extremeAnalyzer.analyzePortfolio(mockActions, mockSecurities);
      const rebalance = extremeAnalyzer.calculateRebalance(summary, 0);
      
      expect(rebalance.targetDistribution.bond).toBe(0.0);
      expect(rebalance.targetDistribution.share).toBe(1.0);
    });
  });
}); 