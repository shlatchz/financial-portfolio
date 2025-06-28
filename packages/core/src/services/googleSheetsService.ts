import { PortfolioAction } from '../types/index';
import { APP_CONFIG } from '../config/constants';

const AGOROT_TO_ILS = 100;
const DEFAULT_RANGE = 'A:F';

/**
 * Service for fetching portfolio data from Google Sheets
 */
export class GoogleSheetsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  /**
   * Fetches portfolio data from a Google Sheets spreadsheet
   * @param spreadsheetId - The Google Sheets spreadsheet ID
   * @param range - Optional range specification (defaults to 'A:F')
   * @returns Array of portfolio actions
   */
  async getPortfolioData(spreadsheetId: string, range?: string): Promise<PortfolioAction[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_API_KEY') {
        throw new Error('Google Sheets API key not configured. Please set VITE_GOOGLE_SHEETS_API_KEY in your .env file.');
      }

      let finalRange = range;
      if (!finalRange) {
        const sheetNames = await this.getSheetNames(spreadsheetId);
        if (sheetNames.length === 0) {
          throw new Error('No sheets found in the spreadsheet.');
        }
        finalRange = `${sheetNames[0]}!${DEFAULT_RANGE}`;
      }

      const url = `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(finalRange)}?key=${this.apiKey}`;
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(APP_CONFIG.API.TIMEOUT)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Use the original error message if JSON parsing fails
        }

        throw new Error(`Failed to fetch data: ${errorMessage}`);
      }

      const data = await response.json() as { values?: string[][] };
      const rows = data.values;

      if (!rows || rows.length === 0) {
        return [];
      }

      const actions: PortfolioAction[] = this.parseRows(rows.slice(1));
      const validActions = actions.filter(action => action.date && action.operation);
      
      return validActions;
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private parseRows(rows: string[][]): PortfolioAction[] {
    return rows.map((row: string[]) => {
      try {
        const operation = (row[1] || '').toUpperCase() as 'DEPOSIT' | 'BUY' | 'SELL';
        const rawValue = this.parseNumber(row[4]) || 0;
        const value = operation === 'DEPOSIT' ? rawValue : rawValue / AGOROT_TO_ILS;
        
        return {
          date: this.parseDate(row[0]),
          operation,
          fundId: row[2] || '',
          amount: this.parseNumber(row[3]) || 0,
          value,
          commission: this.parseNumber(row[5]) || 0, 
        };
      } catch (error) {
        return {
          date: '',
          operation: 'BUY' as const,
          fundId: '',
          amount: 0,
          value: 0,
          commission: 0,
        };
      }
    });
  }

  async getSheetNames(spreadsheetId: string): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/${spreadsheetId}?key=${this.apiKey}&fields=sheets.properties.title`;
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(APP_CONFIG.API.TIMEOUT)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get sheet names (${response.status}): ${errorText}`);
      }

      const data = await response.json() as { sheets?: { properties: { title: string } }[] };
      return data.sheets?.map((sheet: { properties: { title: string } }) => sheet.properties.title) || [];
    } catch (error) {
      console.error('Error getting sheet names:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  static extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  }

  /**
   * Tests the connection to Google Sheets API
   * @param spreadsheetId - The spreadsheet ID to test with
   * @returns Test result with success status and message
   */
  async testConnection(spreadsheetId: string): Promise<{ success: boolean; message: string; sheets?: string[] }> {
    try {
      const sheetNames = await this.getSheetNames(spreadsheetId);
      if (sheetNames.length === 0) {
        return {
          success: false,
          message: 'Unable to access spreadsheet. Please check the URL and make sure the spreadsheet is publicly viewable.'
        };
      }

      const firstSheetRange = `${sheetNames[0]}!A1:F10`;
      const url = `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(firstSheetRange)}?key=${this.apiKey}`;
      
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(APP_CONFIG.API.TIMEOUT)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Unable to access spreadsheet data (${response.status})`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Use default error message if JSON parsing fails
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }

      const data = await response.json() as { values?: string[][] };
      const hasData = data.values && data.values.length > 1;
      
      return {
        success: true,
        message: hasData 
          ? `Connection successful! Found ${data.values!.length - 1} data rows.`
          : 'Connection successful, but no data found.',
        sheets: sheetNames
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Parses a number from various string formats
   * @private
   */
  private parseNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  /**
   * Parses dates from various formats commonly used in spreadsheets
   * @private
   */
  private parseDate(value: unknown): string {
    if (!value) return '';
    const dateStr = String(value).trim();
    
    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // Invalid date format
    }
    
    return '';
  }

  isConfigured(): boolean {
    return this.apiKey !== '' && this.apiKey !== 'YOUR_GOOGLE_API_KEY';
  }
} 