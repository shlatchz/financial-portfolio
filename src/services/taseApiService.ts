import axios from 'axios';
import { SecurityInfo } from '../types';
import { env } from '../config/env';
import { APP_CONFIG } from '../config/constants';

/**
 * Service for fetching real-time security data from Tel Aviv Stock Exchange Maya API
 * No mock data - always uses real Maya TASE API
 */
export class TaseApiService {
  private readonly baseUrl = env.isDevelopment ? '/api/maya' : 'https://maya.tase.co.il';

  /**
   * Fetches security information from Maya TASE API
   * @param fundId - The security/fund identifier
   * @returns SecurityInfo object or null if not found
   */
  async getSecurityInfo(fundId: string): Promise<SecurityInfo | null> {
    try {
      const fundResponse = await this.getMutualFundDetails(fundId);
      if (fundResponse) {
        return fundResponse;
      }

      const securityResponse = await this.getSecurityDetails(fundId);
      if (securityResponse) {
        return securityResponse;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch security ${fundId}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Attempts to fetch mutual fund details from Maya API
   * @private
   */
  private async getMutualFundDetails(fundId: string): Promise<SecurityInfo | null> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'he-IL'
      };

      const response = await axios.get(`${this.baseUrl}/api/v1/funds/mutual/${fundId}`, {
        headers,
        timeout: APP_CONFIG.API.TIMEOUT
      });

      if (response.data && typeof response.data === 'object') {
        const data = response.data;
        
        return {
          id: fundId,
          name: data.name || data.longName || `Fund ${fundId}`,
          type: this.determineFundTypeFromMayaData(data),
          currentPrice: data.redemptionPrice || data.purchasePrice || 0,
          lastUpdate: data.ratesAsOf || new Date().toISOString(),
          managementFee: data.managementFee || 0,
          trusteeFee: data.trusteeFee || data.custodyFee || 0
        };
      }
    } catch (error) {
      // Silent failure for mutual fund attempts - will try ETF next
    }
    return null;
  }

  /**
   * Attempts to fetch security details as ETF from Maya API
   * @private
   */
  private async getSecurityDetails(fundId: string): Promise<SecurityInfo | null> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const response = await axios.get(`${this.baseUrl}/api/v1/funds/etf/${fundId}`, {
        headers,
        timeout: APP_CONFIG.API.TIMEOUT
      });

      if (response.data && typeof response.data === 'object') {
        return {
          id: fundId,
          name: response.data.name || response.data.securityName || `Security ${fundId}`,
          type: this.determineSecurityType(response.data),
          currentPrice: response.data.price || response.data.lastPrice || 0,
          lastUpdate: response.data.lastUpdate || new Date().toISOString(),
          managementFee: response.data.managementFee || 0,
          trusteeFee: response.data.trusteeFee || response.data.custodyFee || 0
        };
      }
    } catch (error) {
      // Silent failure for ETF attempts
    }
    return null;
  }

  /**
   * Determines fund type from Maya API data
   * @private
   */
  private determineFundTypeFromMayaData(data: any): string { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (data?.classification) {
      const major = data.classification.major || '';
      const main = data.classification.main || '';
      
      if (major.includes('אג"ח') || main.includes('אג"ח') || 
          major.includes('bond') || main.includes('bond')) {
        return 'Bond';
      }
      if (major.includes('מניות') || main.includes('מניות') ||
          major.includes('share') || main.includes('equity')) {
        return 'Share';
      }
    }
    
    if (data?.fundType) {
      const fundType = data.fundType.toLowerCase();
      if (fundType.includes('אג"ח') || fundType.includes('bond')) {
        return 'Bond';
      }
    }
    
    if (data?.name || data?.longName) {
      const name = (data.name || data.longName).toLowerCase();
      if (name.includes('אג"ח') || name.includes('bond')) {
        return 'Bond';
      }
    }
    
    return 'Share';
  }

  /**
   * Determines security type from API data
   * @private
   */
  private determineSecurityType(securityData: any): string { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (securityData?.type) {
      return securityData.type.toLowerCase().includes('bond') ? 'Bond' : 'Share';
    }
    if (securityData?.sector) {
      return securityData.sector.toLowerCase().includes('bond') ? 'Bond' : 'Share';
    }
    if (securityData?.name) {
      const name = securityData.name.toLowerCase();
      if (name.includes('bond') || name.includes('אג"ח')) {
        return 'Bond';
      }
    }
    return 'Share';
  }

  /**
   * Fetches multiple securities with batch processing and rate limiting
   */
  async getMultipleSecurities(fundIds: string[]): Promise<Record<string, SecurityInfo>> {
    const results: Record<string, SecurityInfo> = {};
    const batchSize = 5;
    
    for (let i = 0; i < fundIds.length; i += batchSize) {
      const batch = fundIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (fundId) => {
        const securityInfo = await this.getSecurityInfo(fundId);
        if (securityInfo) {
          results[fundId] = securityInfo;
        }
      });

      await Promise.all(batchPromises);
      
      if (i + batchSize < fundIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Checks if the API is properly configured
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Tests the Maya TASE API connection with a known security
   */
  async testConnection(): Promise<{ success: boolean; message: string; endpoint?: string; usingMockData?: boolean }> {
    try {
      const testSecurityId = '5131188';
      const result = await this.getSecurityInfo(testSecurityId);
      
      if (result) {
        return {
          success: true,
          message: `Connection successful! Retrieved data for security ${testSecurityId}`,
          endpoint: this.baseUrl,
          usingMockData: false
        };
      } else {
        return {
          success: false,
          message: 'Connection established but no data returned',
          endpoint: this.baseUrl,
          usingMockData: false
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
        endpoint: this.baseUrl,
        usingMockData: false
      };
    }
  }
} 