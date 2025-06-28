import { createTheme, ThemeOptions } from '@mui/material/styles';

// Color constants to avoid duplication
const COLOR_VALUES = {
  // Base colors
  PRIMARY_BLUE: '#2563eb',
  PRIMARY_BLUE_LIGHT: '#3b82f6',
  PRIMARY_BLUE_DARK: '#1d4ed8',
  
  SECONDARY_PURPLE: '#7c3aed',
  SECONDARY_PURPLE_LIGHT: '#8b5cf6',
  SECONDARY_PURPLE_DARK: '#5b21b6',
  
  SUCCESS_GREEN: '#10b981',
  SUCCESS_GREEN_LIGHT: '#34d399',
  SUCCESS_GREEN_DARK: '#059669',
  
  ERROR_RED: '#ef4444',
  ERROR_RED_LIGHT: '#f87171',
  ERROR_RED_DARK: '#dc2626',
  
  WARNING_ORANGE: '#f59e0b',
  WARNING_ORANGE_LIGHT: '#fbbf24',
  WARNING_ORANGE_DARK: '#d97706',
  
  INFO_CYAN: '#06b6d4',
  INFO_CYAN_LIGHT: '#22d3ee',
  INFO_CYAN_DARK: '#0891b2',
  
  NEUTRAL_GRAY: '#6b7280',
  NEUTRAL_GRAY_DARK: '#4b5563',
  
  // Gradient colors
  GRADIENT_BLUE_START: '#667eea',
  GRADIENT_PURPLE_END: '#764ba2',
  GRADIENT_PINK_START: '#f093fb',
  GRADIENT_PINK_END: '#f5576c',
  GRADIENT_CYAN_START: '#4facfe',
  GRADIENT_CYAN_END: '#00f2fe',
  GRADIENT_WHITE_START: '#ffffff',
  GRADIENT_WHITE_END: '#f8fafc',
} as const;

// Gradient constants
const GRADIENTS = {
  PRIMARY: `linear-gradient(135deg, ${COLOR_VALUES.GRADIENT_BLUE_START} 0%, ${COLOR_VALUES.GRADIENT_PURPLE_END} 100%)`,
  SECONDARY: `linear-gradient(135deg, ${COLOR_VALUES.GRADIENT_PINK_START} 0%, ${COLOR_VALUES.GRADIENT_PINK_END} 100%)`,
  SUCCESS: `linear-gradient(135deg, ${COLOR_VALUES.GRADIENT_CYAN_START} 0%, ${COLOR_VALUES.GRADIENT_CYAN_END} 100%)`,
  CARD: `linear-gradient(145deg, ${COLOR_VALUES.GRADIENT_WHITE_START} 0%, ${COLOR_VALUES.GRADIENT_WHITE_END} 100%)`,
  
  // Portfolio specific gradients
  BOND: `linear-gradient(135deg, ${COLOR_VALUES.SECONDARY_PURPLE} 0%, ${COLOR_VALUES.SECONDARY_PURPLE_DARK} 100%)`,
  SHARE: `linear-gradient(135deg, ${COLOR_VALUES.PRIMARY_BLUE} 0%, ${COLOR_VALUES.PRIMARY_BLUE_DARK} 100%)`,
  PROFIT: `linear-gradient(135deg, ${COLOR_VALUES.SUCCESS_GREEN} 0%, ${COLOR_VALUES.SUCCESS_GREEN_DARK} 100%)`,
  LOSS: `linear-gradient(135deg, ${COLOR_VALUES.ERROR_RED} 0%, ${COLOR_VALUES.ERROR_RED_DARK} 100%)`,
  CASH: `linear-gradient(135deg, ${COLOR_VALUES.SECONDARY_PURPLE} 0%, ${COLOR_VALUES.SECONDARY_PURPLE_DARK} 100%)`,
  NEUTRAL: `linear-gradient(135deg, ${COLOR_VALUES.NEUTRAL_GRAY} 0%, ${COLOR_VALUES.NEUTRAL_GRAY_DARK} 100%)`,
} as const;

// Define modern color palette inspired by professional financial dashboards
const colors = {
  // Primary colors (modern blues with gradients)
  primary: {
    main: COLOR_VALUES.PRIMARY_BLUE,
    light: COLOR_VALUES.PRIMARY_BLUE_LIGHT,
    dark: COLOR_VALUES.PRIMARY_BLUE_DARK,
    gradient: GRADIENTS.PRIMARY,
  },
  // Secondary colors (sophisticated purples)
  secondary: {
    main: COLOR_VALUES.SECONDARY_PURPLE,
    light: COLOR_VALUES.SECONDARY_PURPLE_LIGHT,
    dark: COLOR_VALUES.SECONDARY_PURPLE_DARK,
    gradient: GRADIENTS.PRIMARY,
  },
  // Success colors (modern greens)
  success: {
    main: COLOR_VALUES.SUCCESS_GREEN,
    light: COLOR_VALUES.SUCCESS_GREEN_LIGHT,
    dark: COLOR_VALUES.SUCCESS_GREEN_DARK,
    gradient: GRADIENTS.SHARE,
  },
  // Error colors (modern reds)
  error: {
    main: COLOR_VALUES.ERROR_RED,
    light: COLOR_VALUES.ERROR_RED_LIGHT,
    dark: COLOR_VALUES.ERROR_RED_DARK,
    gradient: GRADIENTS.LOSS,
  },
  // Warning colors (modern oranges)
  warning: {
    main: COLOR_VALUES.WARNING_ORANGE,
    light: COLOR_VALUES.WARNING_ORANGE_LIGHT,
    dark: COLOR_VALUES.WARNING_ORANGE_DARK,
    gradient: `linear-gradient(135deg, ${COLOR_VALUES.WARNING_ORANGE} 0%, ${COLOR_VALUES.WARNING_ORANGE_DARK} 100%)`,
  },
  // Info colors (modern cyans)
  info: {
    main: COLOR_VALUES.INFO_CYAN,
    light: COLOR_VALUES.INFO_CYAN_LIGHT,
    dark: COLOR_VALUES.INFO_CYAN_DARK,
    gradient: `linear-gradient(135deg, ${COLOR_VALUES.INFO_CYAN} 0%, ${COLOR_VALUES.INFO_CYAN_DARK} 100%)`,
  },
  // Portfolio specific colors with gradients
  portfolio: {
    bond: COLOR_VALUES.SECONDARY_PURPLE,
    bondGradient: GRADIENTS.BOND,
    share: COLOR_VALUES.PRIMARY_BLUE,
    shareGradient: GRADIENTS.SHARE,
    profit: COLOR_VALUES.SUCCESS_GREEN,
    profitGradient: GRADIENTS.PROFIT,
    loss: COLOR_VALUES.ERROR_RED,
    lossGradient: GRADIENTS.LOSS,
    cash: COLOR_VALUES.SECONDARY_PURPLE,
    cashGradient: GRADIENTS.CASH,
    neutral: COLOR_VALUES.NEUTRAL_GRAY,
    neutralGradient: GRADIENTS.NEUTRAL,
  },
  // Chart colors with gradients
  chart: {
    bond: COLOR_VALUES.SECONDARY_PURPLE,
    bondGradient: GRADIENTS.BOND,
    share: COLOR_VALUES.PRIMARY_BLUE,
    shareGradient: GRADIENTS.SHARE,
  },
  // Background gradients
  gradients: {
    primary: GRADIENTS.PRIMARY,
    secondary: GRADIENTS.SECONDARY,
    success: GRADIENTS.SUCCESS,
    card: GRADIENTS.CARD,
    header: GRADIENTS.PRIMARY,
  },
};

// Enhanced typography with modern font weights and sizes
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: '3rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.875rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  // Custom variants for portfolio
  portfolioValue: {
    fontWeight: 700,
    fontSize: '1.75rem',
    lineHeight: 1.2,
  },
  portfolioLabel: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
};

// Create the modern theme
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    action: {
      hover: 'rgba(99, 102, 241, 0.04)',
      selected: 'rgba(99, 102, 241, 0.08)',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography,
  spacing: (factor: number) => `${factor * 8}px`,
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
    '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
    '0px 24px 48px rgba(0, 0, 0, 0.35), 0px 19px 19px rgba(0, 0, 0, 0.22)',
    '0px 32px 64px rgba(0, 0, 0, 0.40), 0px 24px 24px rgba(0, 0, 0, 0.22)',
    '0px 40px 80px rgba(0, 0, 0, 0.45), 0px 32px 32px rgba(0, 0, 0, 0.22)',
    '0px 48px 96px rgba(0, 0, 0, 0.50), 0px 40px 40px rgba(0, 0, 0, 0.22)',
    '0px 56px 112px rgba(0, 0, 0, 0.55), 0px 48px 48px rgba(0, 0, 0, 0.22)',
    '0px 64px 128px rgba(0, 0, 0, 0.60), 0px 56px 56px rgba(0, 0, 0, 0.22)',
    '0px 72px 144px rgba(0, 0, 0, 0.65), 0px 64px 64px rgba(0, 0, 0, 0.22)',
    '0px 80px 160px rgba(0, 0, 0, 0.70), 0px 72px 72px rgba(0, 0, 0, 0.22)',
    '0px 88px 176px rgba(0, 0, 0, 0.75), 0px 80px 80px rgba(0, 0, 0, 0.22)',
    '0px 96px 192px rgba(0, 0, 0, 0.80), 0px 88px 88px rgba(0, 0, 0, 0.22)',
    '0px 104px 208px rgba(0, 0, 0, 0.85), 0px 96px 96px rgba(0, 0, 0, 0.22)',
    '0px 112px 224px rgba(0, 0, 0, 0.90), 0px 104px 104px rgba(0, 0, 0, 0.22)',
    '0px 120px 240px rgba(0, 0, 0, 0.95), 0px 112px 112px rgba(0, 0, 0, 0.22)',
    '0px 128px 256px rgba(0, 0, 0, 1.00), 0px 120px 120px rgba(0, 0, 0, 0.22)',
    '0px 136px 272px rgba(0, 0, 0, 1.00), 0px 128px 128px rgba(0, 0, 0, 0.22)',
    '0px 144px 288px rgba(0, 0, 0, 1.00), 0px 136px 136px rgba(0, 0, 0, 0.22)',
    '0px 152px 304px rgba(0, 0, 0, 1.00), 0px 144px 144px rgba(0, 0, 0, 0.22)',
    '0px 160px 320px rgba(0, 0, 0, 1.00), 0px 152px 152px rgba(0, 0, 0, 0.22)',
    '0px 168px 336px rgba(0, 0, 0, 1.00), 0px 160px 160px rgba(0, 0, 0, 0.22)',
  ],
  components: {
    // Global overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
        },
      },
    },
    // Card component with modern styling
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    // Enhanced button styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          padding: '12px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: colors.gradients.primary,
          color: '#ffffff',
          '&:hover': {
            background: colors.gradients.primary,
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: 'rgba(99, 102, 241, 0.3)',
          color: colors.primary.main,
          '&:hover': {
            borderColor: colors.primary.main,
            background: 'rgba(99, 102, 241, 0.04)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    // Modern chip styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8rem',
          height: 32,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        colorPrimary: {
          background: colors.portfolio.bondGradient,
          color: '#ffffff',
          border: 'none',
        },
        colorSecondary: {
          background: colors.portfolio.shareGradient,
          color: '#ffffff',
          border: 'none',
        },
        colorSuccess: {
          background: colors.portfolio.profitGradient,
          color: '#ffffff',
          border: 'none',
        },
        colorError: {
          background: colors.portfolio.lossGradient,
          color: '#ffffff',
          border: 'none',
        },
        colorInfo: {
          background: colors.info.gradient,
          color: '#ffffff',
          border: 'none',
        },
      },
    },
    // Enhanced TextField styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              background: '#ffffff',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
            },
          },
        },
      },
    },
    // Modern table styling
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '& .MuiTableCell-head': {
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(99, 102, 241, 0.02)',
          },
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
            transform: 'scale(1.01)',
            transition: 'all 0.2s ease',
          },
        },
      },
    },
    // Enhanced Alert styling
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: 'none',
          backdropFilter: 'blur(8px)',
        },
        standardSuccess: {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          color: colors.success.dark,
        },
        standardError: {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
          color: colors.error.dark,
        },
        standardWarning: {
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
          color: colors.warning.dark,
        },
        standardInfo: {
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
          color: colors.info.dark,
        },
      },
    },
    // Enhanced Tooltip styling
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          fontSize: '0.8rem',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        arrow: {
          color: 'rgba(31, 41, 55, 0.95)',
        },
      },
    },
    // Enhanced Avatar styling
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: colors.gradients.primary,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
        },
      },
    },
  },
};

// Create and export the theme
export const portfolioTheme = createTheme({
  ...themeOptions,
  portfolioColors: colors,
});

// Augment the theme interface
declare module '@mui/material/styles' {
  interface Theme {
    portfolioColors: typeof colors;
  }

  interface ThemeOptions {
    portfolioColors?: typeof colors;
  }

  interface TypographyVariants {
    portfolioValue: React.CSSProperties;
    portfolioLabel: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    portfolioValue?: React.CSSProperties;
    portfolioLabel?: React.CSSProperties;
  }
} 