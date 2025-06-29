// Application constants
export const APP_CONFIG = {
  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: 'xs',
    TABLET: 'sm', 
    DESKTOP: 'md',
    LARGE: 'lg',
    XLARGE: 'xl',
  },
  
  // Chart dimensions
  CHART: {
    PIE_SIZE: 250,
    PIE_INNER_RADIUS: 40,
    PIE_OUTER_RADIUS: 100,
    PIE_PADDING_ANGLE: 2,
    PIE_CORNER_RADIUS: 8,
  },
  
  // Portfolio constants
  PORTFOLIO: {
    BOND_TYPE: 'Bond',
    SHARE_TYPE: 'Share',
    PRECISION: 2,
    MANAGEMENT_FEE: 15,
  },
  
  // UI constants
  UI: {
    CARD_BORDER_RADIUS: 4,
    BUTTON_BORDER_RADIUS: 3,
    HOVER_TRANSFORM: 'translateY(-2px)',
    CARD_HOVER_TRANSFORM: 'translateX(4px)',
    MAX_CARD_WIDTH: 280,
  },
  
  // Query configuration
  QUERY: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    RETRY_COUNT: 2,
  },
  
  // Tooltip delays
  TOOLTIP: {
    ENTER_DELAY: 300,
    LEAVE_DELAY: 100,
  },

  API: {
    TIMEOUT: 10000,
    BATCH_SIZE: 10,
  },

  LINKS: {
    GITHUB_REPOSITORY: 'https://github.com/shlatchz/financial-portfolio',
  },

  FORMATS: {
    LOCALE: 'he-IL',
    CURRENCY: 'ILS',
    DATE_FORMAT_OPTIONS: {
      year: 'numeric' as const,
      month: '2-digit' as const,
      day: '2-digit' as const,
    },
  },
} as const;

// Operation types
export const OPERATIONS = {
  DEPOSIT: 'DEPOSIT',
  BUY: 'BUY',
  SELL: 'SELL',
} as const;

// Common styles that can be reused
export const COMMON_STYLES = {
  GLASS_MORPHISM: {
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  
  CARD_HOVER: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
    },
  },
  
  GRADIENT_TEXT: (gradient: string) => ({
    background: gradient,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }),

  LOADING_SPINNER: {
    size: 60,
    thickness: 4,
    color: 'primary.main',
    '& .MuiCircularProgress-circle': {
      strokeLinecap: 'round',
    },
  },
} as const; 