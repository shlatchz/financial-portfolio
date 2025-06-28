import '@testing-library/jest-dom';

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GOOGLE_SHEETS_API_KEY: 'test-api-key',
    VITE_SPREADSHEET_ID: 'test-spreadsheet-id',
    VITE_FUNDS_TYPE_DISTRIBUTION_BOND: '0.2',
    VITE_FUNDS_TYPE_DISTRIBUTION_SHARE: '0.8',
    VITE_CUSTOM_SECURITIES: '[]',
    VITE_DEFAULT_SPREADSHEET_URL: '',
    VITE_DEFAULT_GOOGLE_SHEETS_API_KEY: '',
    VITE_QUERY_STALE_TIME: '300000',
    VITE_QUERY_RETRY_COUNT: '3',
    DEV: true,
    PROD: false
  },
  writable: true
});

// Mock window.localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
}); 