import axios from 'axios';
import { SecurityInfo } from '../types/index';
import { APP_CONFIG } from '../config/constants';
import { NETLIFY_FUNCTIONS, API_HEADERS, API_PATHS } from '../config/api-constants';

/**
 * Service for fetching security data from Tel Aviv Stock Exchange Maya API
 */
export class TaseApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = NETLIFY_FUNCTIONS.PRODUCTION.MAYA_PROXY) {
    this.baseUrl = baseUrl;
  }

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
        'Accept': API_HEADERS.TASE.ACCEPT,
        'Accept-Language': API_HEADERS.TASE.ACCEPT_LANGUAGE
      };

      const url = `${this.baseUrl}${API_PATHS.TASE.MUTUAL_FUND(fundId)}`;
        
      const response = await axios.get(url, {
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
      // Silent failure - will try ETF next
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
        'Accept': API_HEADERS.COMMON.ACCEPT,
        'Content-Type': API_HEADERS.COMMON.CONTENT_TYPE
      };

      const url = `${this.baseUrl}${API_PATHS.TASE.ETF(fundId)}`;
        
      const response = await axios.get(url, {
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
      // Silent failure
    }
    return null;
  }

  /**
   * Determines fund type from Maya API data
   * @private
   */
  private determineFundTypeFromMayaData(data: Record<string, unknown>): string {
    const classification = data?.classification as Record<string, unknown> | undefined;
    if (classification) {
      const major = (classification.major as string) || '';
      const main = (classification.main as string) || '';
      
      if (major.includes('אג"ח') || main.includes('אג"ח') || 
          major.includes('bond') || main.includes('bond')) {
        return 'Bond';
      }
      if (major.includes('מניות') || main.includes('מניות') ||
          major.includes('share') || main.includes('equity')) {
        return 'Share';
      }
    }
    
    const fundType = data?.fundType as string | undefined;
    if (fundType) {
      const fundTypeLower = fundType.toLowerCase();
      if (fundTypeLower.includes('אג"ח') || fundTypeLower.includes('bond')) {
        return 'Bond';
      }
    }
    
    const name = (data?.name as string) || (data?.longName as string);
    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('אג"ח') || nameLower.includes('bond')) {
        return 'Bond';
      }
    }
    
    return 'Share';
  }

  /**
   * Determines security type from API data
   * @private
   */
  private determineSecurityType(securityData: Record<string, unknown>): string {
    const type = securityData?.type as string | undefined;
    if (type) {
      return type.toLowerCase().includes('bond') ? 'Bond' : 'Share';
    }
    
    const sector = securityData?.sector as string | undefined;
    if (sector) {
      return sector.toLowerCase().includes('bond') ? 'Bond' : 'Share';
    }
    
    const name = securityData?.name as string | undefined;
    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('bond') || nameLower.includes('אג"ח')) {
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
      const testSecurityId = '5113022';
      const securityInfo = await this.getSecurityInfo(testSecurityId);
      
      if (securityInfo) {
        return {
          success: true,
          message: `TASE API connection successful. Retrieved data for security ${testSecurityId}: ${securityInfo.name}`,
          endpoint: this.baseUrl,
          usingMockData: false
        };
      } else {
        return {
          success: false,
          message: 'TASE API connection failed - unable to retrieve test security data',
          endpoint: this.baseUrl,
          usingMockData: false
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `TASE API connection error: ${error instanceof Error ? error.message : String(error)}`,
        endpoint: this.baseUrl,
        usingMockData: false
      };
    }
  }
} 