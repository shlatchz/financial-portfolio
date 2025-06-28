# Portfolio Manager Theme System

This directory contains the comprehensive Material-UI theme configuration for the Portfolio Manager application.

## Overview

The theme system centralizes all colors, typography, spacing, and component styling to ensure consistency across the application and make it easy to maintain and update the visual design. The theme uses a constants-based approach to eliminate color duplication and improve maintainability.

## Files

- `index.ts` - Main theme configuration file with color constants and theme definition

## Theme Architecture

### Color Constants System

The theme uses a centralized constants-based approach:

#### `COLOR_VALUES` Constants
All base colors are defined as constants to ensure consistency:

```typescript
const COLOR_VALUES = {
  // Primary colors
  PRIMARY_BLUE: '#2563eb',
  PRIMARY_BLUE_LIGHT: '#3b82f6',
  PRIMARY_BLUE_DARK: '#1d4ed8',
  
  // Secondary colors (used for bonds)
  SECONDARY_PURPLE: '#7c3aed',
  SECONDARY_PURPLE_LIGHT: '#8b5cf6', 
  SECONDARY_PURPLE_DARK: '#5b21b6',
  
  // Success colors (used for profits)
  SUCCESS_GREEN: '#10b981',
  SUCCESS_GREEN_LIGHT: '#34d399',
  SUCCESS_GREEN_DARK: '#059669',
  
  // Error colors
  ERROR_RED: '#ef4444',
  ERROR_RED_LIGHT: '#f87171',
  ERROR_RED_DARK: '#dc2626',
  
  // Warning colors
  WARNING_ORANGE: '#f59e0b',
  WARNING_ORANGE_LIGHT: '#fbbf24',
  WARNING_ORANGE_DARK: '#d97706',
  
  // Info colors
  INFO_CYAN: '#06b6d4',
  INFO_CYAN_LIGHT: '#22d3ee',
  INFO_CYAN_DARK: '#0891b2',
  
  // Neutral colors
  NEUTRAL_GRAY: '#6b7280',
  NEUTRAL_GRAY_DARK: '#4b5563',
} as const;
```

#### `GRADIENTS` Constants
All gradients are built from the color constants:

```typescript
const GRADIENTS = {
  PRIMARY: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
  BOND: `linear-gradient(135deg, ${COLOR_VALUES.SECONDARY_PURPLE} 0%, ${COLOR_VALUES.SECONDARY_PURPLE_DARK} 100%)`,
  SHARE: `linear-gradient(135deg, ${COLOR_VALUES.PRIMARY_BLUE} 0%, ${COLOR_VALUES.PRIMARY_BLUE_DARK} 100%)`,
  PROFIT: `linear-gradient(135deg, ${COLOR_VALUES.SUCCESS_GREEN} 0%, ${COLOR_VALUES.SUCCESS_GREEN_DARK} 100%)`,
  LOSS: `linear-gradient(135deg, ${COLOR_VALUES.ERROR_RED} 0%, ${COLOR_VALUES.ERROR_RED_DARK} 100%)`,
  // ... more gradients
} as const;
```

## Color Scheme

### Standard MUI Colors
- **Primary**: Modern blue (`#2563eb`) - Used for primary actions and branding
- **Secondary**: Sophisticated purple (`#7c3aed`) - Used for bonds and secondary actions  
- **Success**: Modern green (`#10b981`) - Used for profits and positive values
- **Error**: Modern red (`#ef4444`) - Used for losses and negative values
- **Warning**: Modern orange (`#f59e0b`) - Used for warnings and alerts
- **Info**: Modern cyan (`#06b6d4`) - Used for informational content

### Portfolio-Specific Colors

#### Investment Types
- **Bonds**: Purple (`#7c3aed`) - Represents stability and sophistication
- **Shares**: Blue (`#2563eb`) - Represents growth and equity investments

#### Performance Indicators
- **Profit**: Green (`#10b981`) - Positive returns and gains
- **Loss**: Red (`#ef4444`) - Negative returns and losses
- **Cash**: Purple (`#7c3aed`) - Cash positions and liquidity
- **Neutral**: Gray (`#6b7280`) - Neutral states and inactive elements

#### Chart Colors
- **chart.bond**: `#7c3aed` - Bond segments in pie charts and visualizations
- **chart.share**: `#2563eb` - Share segments in pie charts and visualizations

### Color Gradients

All gradients are consistently built from the base color constants:
- **Bond Gradient**: Purple to dark purple (`#7c3aed` → `#5b21b6`)
- **Share Gradient**: Blue to dark blue (`#2563eb` → `#1d4ed8`)
- **Primary Gradient**: Blue to purple (`#667eea` → `#764ba2`)
- **Card Gradient**: White to light gray (`#ffffff` → `#f8fafc`)

## Typography

The theme defines consistent typography with:
- Font family: Inter (with fallbacks to Roboto, Helvetica, Arial)
- Modern font weights and sizes optimized for financial data
- Custom portfolio-specific variants:
  - `portfolioValue`: Bold, large text for monetary values (1.75rem, weight 700)
  - `portfolioLabel`: Medium weight text for labels (0.875rem, weight 500, uppercase)

## Usage

### Importing the Theme

```typescript
import { portfolioTheme } from './theme';
```

### Using Theme Colors in Components

```typescript
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      color: theme.portfolioColors.portfolio.bond,
      backgroundColor: theme.portfolioColors.chart.share,
      background: theme.portfolioColors.gradients.primary
    }}>
      Content
    </Box>
  );
};
```

### Using Standard MUI Color Props

```typescript
<Chip color="primary" /> // Uses theme.palette.primary (blue)
<Chip color="secondary" /> // Uses theme.palette.secondary (purple)
<Typography color="success.main" /> // Uses theme.palette.success (green)
```

## Color Mapping Reference

The theme uses consistent semantic color mapping:

| Element Type | Color | Hex Value | Usage |
|--------------|-------|-----------|-------|
| **Bonds** | Purple | `#7c3aed` | Bond funds, fixed income investments |
| **Shares** | Blue | `#2563eb` | Equity funds, stock investments |
| **Profits** | Green | `#10b981` | Positive returns, gains |
| **Losses** | Red | `#ef4444` | Negative returns, losses |
| **Cash** | Purple | `#7c3aed` | Cash positions, liquidity |
| **Primary Actions** | Blue | `#2563eb` | Primary buttons, links |
| **Neutral States** | Gray | `#6b7280` | Inactive, disabled elements |

## Benefits of Constants-Based Approach

### Maintainability
- **Single Source of Truth**: Each color is defined exactly once
- **Easy Updates**: Change a color constant to update it everywhere
- **No Duplication**: Eliminates duplicate color values throughout the theme

### Consistency
- **Automatic Consistency**: Related colors (base, light, dark) stay in sync
- **Gradient Consistency**: Gradients automatically use correct base colors
- **Type Safety**: TypeScript ensures correct color usage

### Developer Experience
- **IntelliSense Support**: Full autocomplete for custom colors
- **Semantic Names**: Clear, descriptive constant names
- **Easy Extension**: Simple to add new colors or modify existing ones

## Extending the Theme

To add new colors or modify existing ones:

1. **Add to `COLOR_VALUES`**: Define new color constants
2. **Update `GRADIENTS`**: Add corresponding gradients if needed
3. **Update `colors` object**: Use the constants in color definitions
4. **Add TypeScript types**: Update interfaces if adding new color categories
5. **Update this documentation**: Document the new colors

Example:
```typescript
// 1. Add to COLOR_VALUES
const COLOR_VALUES = {
  // ... existing colors
  NEW_COLOR: '#123456',
  NEW_COLOR_DARK: '#0f2040',
} as const;

// 2. Add gradient if needed
const GRADIENTS = {
  // ... existing gradients
  NEW_GRADIENT: `linear-gradient(135deg, ${COLOR_VALUES.NEW_COLOR} 0%, ${COLOR_VALUES.NEW_COLOR_DARK} 100%)`,
} as const;

// 3. Use in colors object
const colors = {
  // ... existing colors
  newCategory: {
    main: COLOR_VALUES.NEW_COLOR,
    gradient: GRADIENTS.NEW_GRADIENT,
  },
};
```

## Accessibility

The color scheme is designed with accessibility in mind:
- High contrast ratios for text readability
- Semantic color usage (green for positive, red for negative)
- Consistent color patterns throughout the application
- Support for future dark mode implementation 