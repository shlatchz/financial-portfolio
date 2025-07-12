import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomSecuritiesService } from '../services/customSecuritiesService';
import { CustomSecurity } from '../types/index';

// Mock fetch globally
global.fetch = vi.fn();

describe('CustomSecuritiesService', () => {
  let service: CustomSecuritiesService;

  beforeEach(() => {
    service = new CustomSecuritiesService();
    vi.clearAllMocks();
  });

  describe('fetchCurrentValues', () => {
    it('should return static values when no API URL is provided', async () => {
      const securities: CustomSecurity[] = [
        {
          id: 'pension-1',
          bondPercentage: 0.3,
          sharePercentage: 0.7,
          value: 50000,
          date: '2024-01-01'
        }
      ];

      const result = await service.fetchCurrentValues(securities);

      expect(result).toHaveLength(1);
      expect(result[0].currentValue).toBe(50000);
      expect(result[0].currentValueDate).toBe('2024-01-01');
    });

    it('should fetch current values from API when URL is provided', async () => {
      const securities: CustomSecurity[] = [
        {
          id: 'pension-1',
          bondPercentage: 0.3,
          sharePercentage: 0.7,
          value: 50000,
          date: '2024-01-01',
          apiUrl: 'https://api.test.com/balance'
        }
      ];

      const mockResponse = { value: 55000 };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.fetchCurrentValues(securities);

      expect(result).toHaveLength(1);
      expect(result[0].currentValue).toBe(55000);
      expect(result[0].currentValueDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should use custom parser when provided', async () => {
      const securities: CustomSecurity[] = [
        {
          id: 'pension-1',
          bondPercentage: 0.3,
          sharePercentage: 0.7,
          value: 50000,
          date: '2024-01-01',
          apiUrl: 'https://api.test.com/balance',
          apiResponseParser: '(data) => data.portfolio.currentBalance'
        }
      ];

      const mockResponse = { portfolio: { currentBalance: 60000 } };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.fetchCurrentValues(securities);

      expect(result).toHaveLength(1);
      expect(result[0].currentValue).toBe(60000);
    });

    it('should fall back to static value when API fails', async () => {
      const securities: CustomSecurity[] = [
        {
          id: 'pension-1',
          bondPercentage: 0.3,
          sharePercentage: 0.7,
          value: 50000,
          date: '2024-01-01',
          apiUrl: 'https://api.test.com/balance'
        }
      ];

      (fetch as any).mockRejectedValueOnce(new Error('API Error'));

      const result = await service.fetchCurrentValues(securities);

      expect(result).toHaveLength(1);
      expect(result[0].currentValue).toBe(50000);
      expect(result[0].currentValueDate).toBe('2024-01-01');
    });
  });

  describe('validateParserFunction', () => {
    it('should validate correct parser function', () => {
      const result = service.validateParserFunction('(data) => data.value');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid parser function', () => {
      const result = service.validateParserFunction('invalid javascript');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject parser that returns non-number', () => {
      const result = service.validateParserFunction('(data) => "not a number"');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must return a valid number');
    });
  });
}); 