# Custom Securities Enhanced Features

## Overview

Enhanced the custom securities functionality to support dynamic value fetching from external APIs and response parsing, in addition to static value configuration.

## New Features

### 1. API Integration for Dynamic Value Fetching

- **API URL Configuration**: Custom securities can now specify an `apiUrl` to fetch current values
- **HTTP Headers Support**: Custom `apiHeaders` can be configured for authentication and content-type
- **Automatic Fallback**: If API calls fail, the system falls back to static values

### 2. API Response Parsing

- **Custom Parser Functions**: JavaScript functions as strings to parse API responses
- **Default Parsers**: Built-in parsers for common response formats (`data.value`, `data.price`, `data.amount`)
- **Parser Validation**: Validation method to ensure parser functions return valid numbers

### 3. Current Value Tracking

- **Current Value Field**: Stores the most recent value fetched from API
- **Current Value Date**: Tracks when the current value was last updated
- **Historical Value Preservation**: Original `value` and `date` fields are preserved

## Implementation Details

### Extended CustomSecurity Type

```typescript
export interface CustomSecurity {
  id: string;
  bondPercentage: number;
  sharePercentage: number;
  value: number;                    // Historical/base value
  date: string;                     // Date of base value
  
  // New API-related fields
  apiUrl?: string;                  // API endpoint for current value
  apiResponseParser?: string;       // JavaScript function as string
  apiHeaders?: Record<string, string>; // HTTP headers
  currentValue?: number;            // Auto-populated current value
  currentValueDate?: string;        // Auto-populated current date
}
```

### New Service: CustomSecuritiesService

- **fetchCurrentValues()**: Fetches current values for all securities with API configuration
- **validateParserFunction()**: Validates parser function syntax and return type
- **parseApiResponse()**: Executes parser functions safely
- **fetchSecurityCurrentValue()**: Fetches value for a single security

### Integration with Portfolio Analysis

- **Async Portfolio Analysis**: Updated `PortfolioAnalyzer.analyzePortfolio()` to be async
- **Current Value Usage**: Portfolio calculations now use `currentValue` when available
- **Distribution Calculations**: Fund type distribution considers current values

## UI Enhancements

### Environment Configuration

```bash
# Enhanced custom securities in .env
VITE_CUSTOM_SECURITIES='[
  {
    "id": "pension-fund-1",
    "bondPercentage": 0.3,
    "sharePercentage": 0.7,
    "value": 50000,
    "date": "2024-01-01",
    "apiUrl": "https://api.pension-fund.com/balance",
    "apiHeaders": {
      "Authorization": "Bearer your-token"
    },
    "apiResponseParser": "(data) => data.currentBalance"
  }
]'
```

### UI Form Enhancements

- **API Configuration Section**: New form fields for API URL, headers, and parser
- **Real-time Validation**: Parser function validation with helpful error messages
- **Current Value Display**: Shows current value and last update date when available
- **Progressive Disclosure**: API fields only show when API URL is provided

### Table Display Updates

- **Dual Value Display**: Shows both historical and current values when available
- **Update Timestamps**: Displays when current values were last fetched
- **Visual Indicators**: Clear indication when values are API-sourced vs static

## API Response Parser Examples

### Simple Value Extraction
```javascript
"(data) => data.value"
```

### Nested Object Access
```javascript
"(data) => data.portfolio.currentBalance"
```

### Array Processing
```javascript
"(data) => data.accounts.reduce((sum, acc) => sum + acc.balance, 0)"
```

### Complex Calculations
```javascript
"(data) => data.principal + data.accruedInterest - data.fees"
```

## Security Considerations

- **Safe Function Execution**: Parser functions execute in controlled environment
- **Error Handling**: Graceful fallback on API failures or parser errors
- **Input Validation**: Strict validation of parser function return types
- **Header Security**: API headers support for authentication

## Testing

- **Comprehensive Test Suite**: Tests for API fetching, parsing, and fallback scenarios
- **Mock API Responses**: Simulated API calls for reliable testing
- **Error Scenarios**: Tests for network failures and invalid responses
- **Parser Validation**: Tests for various parser function scenarios

## Backward Compatibility

- **Existing Functionality**: All existing custom securities continue to work unchanged
- **Optional Fields**: New API fields are optional and don't affect static configurations
- **Data Migration**: No data migration required for existing configurations

## Future Enhancements

- **Rate Limiting**: Configurable rate limits for API calls
- **Caching**: Response caching to reduce API calls
- **Bulk APIs**: Support for APIs that can fetch multiple securities at once
- **Webhooks**: Real-time updates via webhook notifications 