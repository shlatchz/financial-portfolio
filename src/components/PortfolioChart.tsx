import React from 'react';
import { CardContent, Typography, Box, Paper, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DonutLarge } from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { PortfolioSummary } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { APP_CONFIG, COMMON_STYLES } from '../config/constants';

interface PortfolioChartProps {
  summary: PortfolioSummary;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ summary }) => {
  const theme = useTheme();
  
  const bondValue = summary.totalMarketValue * summary.fundTypeDistribution.bond;
  const shareValue = summary.totalMarketValue * summary.fundTypeDistribution.share;
  
  const data = [
    {
      id: 0,
      value: summary.fundTypeDistribution.bond * 100,
      label: 'Bonds',
      color: theme.portfolioColors.chart.bond,
      amount: bondValue,
    },
    {
      id: 1,
      value: summary.fundTypeDistribution.share * 100,
      label: 'Shares', 
      color: theme.portfolioColors.chart.share,
      amount: shareValue,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        ...COMMON_STYLES.GLASS_MORPHISM,
        borderRadius: APP_CONFIG.UI.CARD_BORDER_RADIUS,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: theme.portfolioColors.gradients.primary,
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: theme.portfolioColors.gradients.primary,
              mr: 3,
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            }}
          >
            <DonutLarge sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 700,
                ...COMMON_STYLES.GRADIENT_TEXT(theme.portfolioColors.gradients.primary),
                mb: 0.5,
              }}
            >
              Fund Type Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Portfolio allocation across asset types
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 3, lg: 4 },
          width: '100%',
        }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: 350, lg: 400 },
            flexShrink: 0,
          }}>
            <PieChart
              series={[
                {
                  data: data.map(item => ({
                    ...item,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { 
                    innerRadius: 30, 
                    additionalRadius: -30, 
                    color: 'rgba(0,0,0,0.1)' 
                  },
                  innerRadius: 55,
                  outerRadius: 140,
                  paddingAngle: APP_CONFIG.CHART.PIE_PADDING_ANGLE,
                  cornerRadius: APP_CONFIG.CHART.PIE_CORNER_RADIUS,
                },
              ]}
              width={380}
              height={380}
              margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: { xs: '100%', lg: 'auto' },
            minWidth: { xs: '100%', lg: 240 },
            maxWidth: { xs: '100%', lg: 280 },
            flexShrink: 1,
          }}>
            {data.map((item, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2.5,
                  background: `linear-gradient(135deg, ${item.color}10 0%, ${item.color}05 100%)`,
                  border: `1px solid ${item.color}20`,
                  borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                  transition: `all ${APP_CONFIG.ANIMATION.NORMAL}ms ease`,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  '&:hover': {
                    transform: APP_CONFIG.UI.CARD_HOVER_TRANSFORM,
                    boxShadow: `0 4px 12px ${item.color}30`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                      mr: 2,
                      boxShadow: `0 2px 8px ${item.color}40`,
                      transition: `transform ${APP_CONFIG.ANIMATION.FAST}ms ease`,
                      flexShrink: 0,
                      '&:hover': {
                        transform: 'scale(1.2)',
                      },
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      flexShrink: 0,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
                <Box sx={{ ml: 2.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: item.color,
                      mb: 0.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    {formatPercentage(item.value)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.8rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default PortfolioChart; 