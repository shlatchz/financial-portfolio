/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Portfolio Data Source
  readonly VITE_DEFAULT_GOOGLE_SHEETS_API_KEY?: string;
  readonly VITE_DEFAULT_SPREADSHEET_URL?: string;
  
  // Fund Distribution
  readonly VITE_FUNDS_TYPE_DISTRIBUTION_BOND?: string;
  readonly VITE_FUNDS_TYPE_DISTRIBUTION_SHARE?: string;
  
  // Custom Securities
  readonly VITE_CUSTOM_SECURITIES?: string;
  
  // Query Configuration
  readonly VITE_QUERY_STALE_TIME?: string;
  readonly VITE_QUERY_RETRY_COUNT?: string;
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 