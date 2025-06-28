import { PortfolioAction, PortfolioSecurity, PortfolioSummary, SecurityInfo, FundAnalysis, RebalanceResult, RebalanceRecommendation, CustomSecurity } from '../types/index';
import { Decimal } from 'decimal.js';
import { APP_CONFIG } from '../config/constants';

/**
 * Portfolio analysis service for processing transactions and calculating metrics
 */
export class PortfolioAnalyzer {
  /**
   * Creates a new PortfolioAnalyzer instance.
   * 
   * @param targetDistribution - Target distribution of portfolio between bonds and shares
   * @param customSecurities - Array of custom securities (pension funds, savings, etc.)
   */
  constructor(
    private targetDistribution: { bond: number; share: number }, 
    private customSecurities: CustomSecurity[] = []
  ) {}

  /**
   * Analyzes portfolio based on transaction history and current market data
   */
  analyzePortfolio(actions: PortfolioAction[], securitiesInfo: Record<string, SecurityInfo>): PortfolioSummary {
    const fundActions = this.groupActionsByFund(actions);
    const securities: PortfolioSecurity[] = [];
    let totalNetBuyValue = new Decimal(0);
    let totalMarketValue = new Decimal(0);
    let totalDeposits = new Decimal(0);
    let totalCommissions = new Decimal(0);

    for (const [fundId, fundActionList] of Object.entries(fundActions)) {
      const isDeposit = fundId === '';
      const securityInfo = isDeposit ? null : securitiesInfo[fundId];
      
      if (!isDeposit && !securityInfo) continue;

      const analysis = this.analyzeFundActions(fundActionList, securityInfo);
      
      totalDeposits = totalDeposits.plus(analysis.totalDeposits);
      totalCommissions = totalCommissions.plus(analysis.totalCommissions);
      
      if (!isDeposit && analysis.currentAmount > 0 && securityInfo) {
        securities.push({
          id: fundId,
          name: securityInfo.name,
          type: securityInfo.type,
          netBuyValue: analysis.netBuyValue,
          currentMarketValue: analysis.currentMarketValue,
          currentAmount: analysis.currentAmount,
          currentPrice: securityInfo.currentPrice,
          isCustom: false,
          managementFee: securityInfo.managementFee,
          trusteeFee: securityInfo.trusteeFee,
          lastUpdate: securityInfo.lastUpdate
        });

        totalNetBuyValue = totalNetBuyValue.plus(analysis.netBuyValue);
        totalMarketValue = totalMarketValue.plus(analysis.currentMarketValue);
      }
    }

    const lastTransactionDate = this.getLastTransactionDate(actions);
    const fundTypeDistribution = this.calculateFundTypeDistribution(securities, this.customSecurities);
    const remainingCash = totalDeposits.minus(totalNetBuyValue).minus(totalCommissions);

    return {
      securities,
      customSecurities: this.customSecurities,
      totalNetBuyValue: totalNetBuyValue.toNumber(),
      totalMarketValue: totalMarketValue.toNumber(),
      totalIncome: totalMarketValue.minus(totalNetBuyValue).toNumber(),
      lastTransactionDate,
      fundTypeDistribution,
      cashBalance: {
        totalDeposits: totalDeposits.toNumber(),
        totalCommissions: totalCommissions.toNumber(),
        remainingCash: remainingCash.toNumber()
      }
    };
  }

  calculateRebalance(summary: PortfolioSummary, additionalInvestment: number): RebalanceResult {
    const customSecuritiesTotal = this.customSecurities.reduce((sum, cs) => sum + cs.value, 0);
    const currentTotalValue = new Decimal(summary.totalMarketValue).plus(customSecuritiesTotal);
    const newTotalValue = currentTotalValue.plus(additionalInvestment);
    
    const targetBondValue = newTotalValue.times(this.targetDistribution.bond);
    const targetShareValue = newTotalValue.times(this.targetDistribution.share);
    
    let currentBondValue = new Decimal(0);
    let currentShareValue = new Decimal(0);
    
    for (const security of summary.securities) {
      const securityValue = new Decimal(security.currentMarketValue);
      if (security.type === APP_CONFIG.PORTFOLIO.BOND_TYPE) {
        currentBondValue = currentBondValue.plus(securityValue);
      } else {
        currentShareValue = currentShareValue.plus(securityValue);
      }
    }
    
    for (const customSecurity of this.customSecurities) {
      const customValue = new Decimal(customSecurity.value);
      const bondPortion = customValue.times(customSecurity.bondPercentage);
      const sharePortion = customValue.times(customSecurity.sharePercentage);
      
      currentBondValue = currentBondValue.plus(bondPortion);
      currentShareValue = currentShareValue.plus(sharePortion);
    }
    
    const bondDifference = targetBondValue.minus(currentBondValue);
    const shareDifference = targetShareValue.minus(currentShareValue);
    
    const tradeableSecurities = summary.securities.filter(s => !s.isCustom);
    const bondSecurities = tradeableSecurities.filter(s => s.type === APP_CONFIG.PORTFOLIO.BOND_TYPE);
    const shareSecurities = tradeableSecurities.filter(s => s.type !== APP_CONFIG.PORTFOLIO.BOND_TYPE);
    
    const currentTradeableBondValue = bondSecurities.reduce((sum, s) => sum.plus(s.currentMarketValue), new Decimal(0));
    const currentTradeableShareValue = shareSecurities.reduce((sum, s) => sum.plus(s.currentMarketValue), new Decimal(0));
    
    const recommendations: RebalanceRecommendation[] = [];
    
    for (const security of bondSecurities) {
      const currentValue = security.currentMarketValue;
      let difference = 0;
      
      if (bondDifference.abs().greaterThan(0.01) && currentTradeableBondValue.greaterThan(0)) {
        const proportion = new Decimal(currentValue).dividedBy(currentTradeableBondValue);
        difference = bondDifference.times(proportion).toNumber();
      }
      
      const action: 'BUY' | 'SELL' | 'HOLD' = Math.abs(difference) > 0.01 
        ? (difference > 0 ? 'BUY' : 'SELL') 
        : 'HOLD';
      
      const amount = Math.abs(difference) > 0.01 
        ? Math.abs(difference) / (security.currentPrice / 100)
        : 0;
      
      recommendations.push({
        security,
        currentValue,
        targetValue: currentValue + difference,
        difference,
        action,
        amount
      });
    }
    
    for (const security of shareSecurities) {
      const currentValue = security.currentMarketValue;
      let difference = 0;
      
      if (shareDifference.abs().greaterThan(0.01) && currentTradeableShareValue.greaterThan(0)) {
        const proportion = new Decimal(currentValue).dividedBy(currentTradeableShareValue);
        difference = shareDifference.times(proportion).toNumber();
      }
      
      const action: 'BUY' | 'SELL' | 'HOLD' = Math.abs(difference) > 0.01 
        ? (difference > 0 ? 'BUY' : 'SELL') 
        : 'HOLD';
      
      const amount = Math.abs(difference) > 0.01 
        ? Math.abs(difference) / (security.currentPrice / 100)
        : 0;
      
      recommendations.push({
        security,
        currentValue,
        targetValue: currentValue + difference,
        difference,
        action,
        amount
      });
    }
    
    const currentDistribution = {
      bond: currentBondValue.dividedBy(currentTotalValue).toNumber(),
      share: currentShareValue.dividedBy(currentTotalValue).toNumber()
    };
    
    return {
      recommendations,
      totalInvestment: additionalInvestment,
      currentDistribution,
      targetDistribution: this.targetDistribution
    };
  }

  /**
   * Groups portfolio actions by fund ID for easier processing.
   * 
   * @param actions - Array of portfolio actions
   * @returns Record mapping fund IDs to their respective actions
   * @private
   */
  private groupActionsByFund(actions: PortfolioAction[]): Record<string, PortfolioAction[]> {
    const grouped: Record<string, PortfolioAction[]> = {};
    
    for (const action of actions) {
      const fundId = action.fundId;
      if (!grouped[fundId]) {
        grouped[fundId] = [];
      }
      grouped[fundId].push(action);
    }

    return grouped;
  }

  /**
   * Analyzes all actions for a specific fund to calculate current position and metrics.
   * 
   * This method processes buy, sell, and deposit transactions for a single fund,
   * calculating the current position, net investment, and market value.
   * 
   * @param actions - Array of actions for a specific fund
   * @param securityInfo - Current market information for the security (null for deposits)
   * @returns Analysis results including current amount, values, and totals
   * @private
   */
  private analyzeFundActions(actions: PortfolioAction[], securityInfo: SecurityInfo | null): FundAnalysis {
    let currentAmount = new Decimal(0);
    let totalBoughtValue = new Decimal(0);
    let totalSoldValue = new Decimal(0);
    let totalCommissions = new Decimal(0);
    let totalDeposits = new Decimal(0);

    const sortedActions = actions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const action of sortedActions) {
      const actionAmount = new Decimal(action.amount || 0);
      const actionValue = new Decimal(action.value || 0);
      const actionCommission = new Decimal(action.commission || 0);
      
      totalCommissions = totalCommissions.plus(actionCommission);

      switch (action.operation) {
        case 'BUY':
          currentAmount = currentAmount.plus(actionAmount);
          totalBoughtValue = totalBoughtValue.plus(actionAmount.times(actionValue));
          break;
          
        case 'SELL':
          currentAmount = currentAmount.minus(actionAmount);
          totalSoldValue = totalSoldValue.plus(actionAmount.times(actionValue));
          break;
          
        case 'DEPOSIT':
          totalDeposits = totalDeposits.plus(actionValue);
          break;
      }
    }

    const netBuyValue = totalBoughtValue.minus(totalSoldValue);
    const currentMarketValue = securityInfo 
      ? currentAmount.times(securityInfo.currentPrice / 100)
      : new Decimal(0);

    return {
      currentAmount: currentAmount.toNumber(),
      netBuyValue: netBuyValue.toNumber(),
      currentMarketValue: currentMarketValue.toNumber(),
      totalCommissions: totalCommissions.toNumber(),
      totalDeposits: totalDeposits.toNumber()
    };
  }

  /**
   * Finds the date of the most recent transaction in the portfolio.
   * 
   * @param actions - Array of portfolio actions
   * @returns ISO date string of the last transaction, or empty string if no actions
   * @private
   */
  private getLastTransactionDate(actions: PortfolioAction[]): string {
    if (actions.length === 0) return '';
    
    const sortedActions = actions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedActions[0].date;
  }

  /**
   * Calculates the distribution of portfolio between bonds and shares.
   * 
   * This method analyzes both regular securities and custom securities to determine
   * the overall allocation between bond-type and share-type investments.
   * 
   * @param securities - Array of regular portfolio securities
   * @param customSecurities - Array of custom securities with predefined allocations
   * @returns Object containing bond and share distribution percentages
   * @private
   */
  private calculateFundTypeDistribution(securities: PortfolioSecurity[], customSecurities: CustomSecurity[]): { bond: number; share: number } {
    let totalBondValue = new Decimal(0);
    let totalShareValue = new Decimal(0);
    
    for (const security of securities) {
      const value = new Decimal(security.currentMarketValue);
      if (security.type === APP_CONFIG.PORTFOLIO.BOND_TYPE) {
        totalBondValue = totalBondValue.plus(value);
      } else {
        totalShareValue = totalShareValue.plus(value);
      }
    }
    
    for (const customSecurity of customSecurities) {
      const value = new Decimal(customSecurity.value);
      const bondPortion = value.times(customSecurity.bondPercentage);
      const sharePortion = value.times(customSecurity.sharePercentage);
      
      totalBondValue = totalBondValue.plus(bondPortion);
      totalShareValue = totalShareValue.plus(sharePortion);
    }
    
    const totalValue = totalBondValue.plus(totalShareValue);
    
    if (totalValue.equals(0)) {
      return { bond: 0, share: 0 };
    }
    
    return {
      bond: totalBondValue.dividedBy(totalValue).toNumber(),
      share: totalShareValue.dividedBy(totalValue).toNumber()
    };
  }
} 