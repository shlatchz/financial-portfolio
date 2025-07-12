import { CustomSecurity } from '../types/index';
import { APP_CONFIG } from '../config/constants';

/**
 * Service for handling custom securities API fetching and response parsing
 */
export class CustomSecuritiesService {
  /**
   * Fetches current values for custom securities that have API configuration
   * @param customSecurities - Array of custom securities
   * @returns Array of custom securities with updated current values
   */
  async fetchCurrentValues(customSecurities: CustomSecurity[]): Promise<CustomSecurity[]> {
    const updatedSecurities = await Promise.all(
      customSecurities.map(async (security) => {
        // If no API URL is provided, use the static value as current value
        if (!security.apiUrl) {
          return {
            ...security,
            currentValue: security.value,
            currentValueDate: security.date
          };
        }

        try {
          const currentValue = await this.fetchSecurityCurrentValue(security);
          return {
            ...security,
            currentValue: currentValue ?? security.value,
            currentValueDate: new Date().toISOString().split('T')[0]
          };
        } catch (error) {
          console.warn(`Failed to fetch current value for custom security ${security.id}:`, error);
          // Fall back to static value
          return {
            ...security,
            currentValue: security.value,
            currentValueDate: security.date
          };
        }
      })
    );

    return updatedSecurities;
  }

  /**
   * Fetches current value for a single custom security
   * @param security - Custom security with API configuration
   * @returns Current value or null if failed
   */
  private async fetchSecurityCurrentValue(security: CustomSecurity): Promise<number | null> {
    if (!security.apiUrl) {
      return null;
    }

    try {
      const response = await fetch(security.apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...security.apiHeaders
        },
        signal: AbortSignal.timeout(APP_CONFIG.API.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the response using the provided parser function
      if (security.apiResponseParser) {
        return this.parseApiResponse(data, security.apiResponseParser);
      }

      // Default parsing - assume the response is a number or has a 'value' property
      if (typeof data === 'number') {
        return data;
      }

      if (data && typeof data === 'object' && 'value' in data) {
        return Number(data.value);
      }

      if (data && typeof data === 'object' && 'price' in data) {
        return Number(data.price);
      }

      if (data && typeof data === 'object' && 'amount' in data) {
        return Number(data.amount);
      }

      throw new Error('Unable to parse API response - no recognizable value field found');
    } catch (error) {
      console.error(`Failed to fetch current value for ${security.id}:`, error);
      return null;
    }
  }

  /**
   * Parses API response using a custom JavaScript function
   * @param data - API response data
   * @param parserFunction - JavaScript function as string
   * @returns Parsed value
   */
  private parseApiResponse(data: any, parserFunction: string): number {
    try {
      // Create a safe evaluation environment
      const parseFunction = new Function('data', `return (${parserFunction})(data);`);
      const result = parseFunction(data);
      
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Parser function must return a valid number');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to parse API response:', error);
      throw new Error(`API response parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates a parser function string
   * @param parserFunction - JavaScript function as string
   * @returns Validation result
   */
  validateParserFunction(parserFunction: string): { valid: boolean; error?: string } {
    try {
      // Test with dummy data
      const testData = { value: 100, price: 200, amount: 300 };
      const parseFunction = new Function('data', `return (${parserFunction})(data);`);
      const result = parseFunction(testData);
      
      if (typeof result !== 'number' || isNaN(result)) {
        return { valid: false, error: 'Parser function must return a valid number' };
      }
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid parser function' 
      };
    }
  }
} 