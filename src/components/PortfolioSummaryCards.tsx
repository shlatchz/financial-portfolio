import React from 'react';
import { Grid, Typography, Box, Avatar, Tooltip, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TrendingUp, AccountBalance, ShowChart, AccessTime, AccountBalanceWallet } from '@mui/icons-material';
import { PortfolioSummary } from '../types';
import { formatCurrency } from '../utils/formatters';
import { APP_CONFIG, COMMON_STYLES } from '../config/constants';

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary;
}

const PortfolioSummaryCards: React.FC<PortfolioSummaryCardsProps> = ({ summary }) => {
  const theme = useTheme();
  
  const customSecuritiesTotal = summary.customSecurities.reduce((sum, cs) => sum + cs.value, 0);
  const totalCurrentValue = summary.totalMarketValue + summary.cashBalance.remainingCash + customSecuritiesTotal;
  
  const tradeableBuyValue = summary.totalNetBuyValue;
  const totalBuyValue = tradeableBuyValue + customSecuritiesTotal;
  const totalIncome = totalCurrentValue - totalBuyValue;
  
  const cards = [
    {
      title: 'Buy Value',
      value: formatCurrency(totalBuyValue),
      icon: <TrendingUp />,
      gradient: theme.portfolioColors.info.gradient,
      color: theme.portfolioColors.info.main,
      tooltip: (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Buy Value Breakdown:
          </Typography>
          <Typography variant="body2">
            • Tradeable Securities: {formatCurrency(tradeableBuyValue)}
          </Typography>
          {customSecuritiesTotal > 0 && (
            <Typography variant="body2">
              • Custom Securities: {formatCurrency(customSecuritiesTotal)}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
            Total: {formatCurrency(totalBuyValue)}
          </Typography>
        </Box>
      )
    },
    {
      title: 'Current Value',
      value: formatCurrency(totalCurrentValue),
      icon: <ShowChart />,
      gradient: theme.portfolioColors.gradients.primary,
      color: theme.portfolioColors.primary.main,
      tooltip: (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Current Value Breakdown:
          </Typography>
          <Typography variant="body2">
            • Market Value (Tradeable): {formatCurrency(summary.totalMarketValue)}
          </Typography>
          <Typography variant="body2">
            • Remaining Cash: {formatCurrency(summary.cashBalance.remainingCash)}
          </Typography>
          {customSecuritiesTotal > 0 && (
            <Typography variant="body2">
              • Custom Securities: {formatCurrency(customSecuritiesTotal)} ({summary.customSecurities.length} items)
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
            Total: {formatCurrency(totalCurrentValue)}
          </Typography>
        </Box>
      )
    },
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: <AccountBalance />,
      gradient: totalIncome >= 0 ? theme.portfolioColors.portfolio.profitGradient : theme.portfolioColors.portfolio.lossGradient,
      color: totalIncome >= 0 ? theme.portfolioColors.success.main : theme.portfolioColors.error.main,
      tooltip: (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Income Calculation:
          </Typography>
          <Typography variant="body2">
            Current Value - Buy Value
          </Typography>
          <Typography variant="body2">
            {formatCurrency(totalCurrentValue)} - {formatCurrency(totalBuyValue)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
            = {formatCurrency(totalIncome)}
          </Typography>
          {totalIncome >= 0 ? (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              📈 Portfolio is profitable
            </Typography>
          ) : (
            <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
              📉 Portfolio has losses
            </Typography>
          )}
        </Box>
      )
    },
    {
      title: 'Available Cash',
      value: formatCurrency(summary.cashBalance.remainingCash),
      icon: <AccountBalanceWallet />,
      gradient: theme.portfolioColors.portfolio.cashGradient,
      color: theme.portfolioColors.portfolio.cash,
      tooltip: (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Cash Balance Breakdown:
          </Typography>
          <Typography variant="body2">
            • Total Deposits: {formatCurrency(summary.cashBalance.totalDeposits)}
          </Typography>
          <Typography variant="body2">
            • Total Commissions: {formatCurrency(summary.cashBalance.totalCommissions)}
          </Typography>
          <Typography variant="body2">
            • Securities Purchases: {formatCurrency(summary.totalNetBuyValue)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
            Remaining: {formatCurrency(summary.cashBalance.remainingCash)}
          </Typography>
          {summary.cashBalance.remainingCash > 0 ? (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              💰 Available for investment
            </Typography>
          ) : (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              ⚠️ No available cash
            </Typography>
          )}
        </Box>
      )
    },
    {
      title: 'Last Transaction',
      value: summary.lastTransactionDate || 'No transactions',
      icon: <AccessTime />,
      gradient: theme.portfolioColors.warning.gradient,
      color: theme.portfolioColors.warning.main,
      tooltip: summary.lastTransactionDate ? (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Transaction History:
          </Typography>
          <Typography variant="body2">
            Most recent transaction: {summary.lastTransactionDate}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            📅 Keep your portfolio updated regularly
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            No Transaction Data
          </Typography>
          <Typography variant="body2">
            No transactions found in the spreadsheet
          </Typography>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2 } }}>
      <Grid container spacing={3} justifyContent="center">
        {cards.map((card, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={2.4} 
            xl={2.4}
            key={index}
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Tooltip 
              title={card.tooltip}
              arrow
              placement="top"
              enterDelay={APP_CONFIG.TOOLTIP.ENTER_DELAY}
              leaveDelay={APP_CONFIG.TOOLTIP.LEAVE_DELAY}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    fontSize: '0.875rem',
                    borderRadius: 2,
                    maxWidth: 300,
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(0, 0, 0, 0.9)',
                    },
                  },
                },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  ...COMMON_STYLES.GLASS_MORPHISM,
                  borderRadius: APP_CONFIG.UI.CARD_BORDER_RADIUS,
                  p: 3,
                  width: '100%',
                  maxWidth: APP_CONFIG.UI.MAX_CARD_WIDTH,
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: `all ${APP_CONFIG.ANIMATION.NORMAL}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  '&:hover': {
                    transform: APP_CONFIG.UI.HOVER_TRANSFORM,
                    boxShadow: `0 12px 40px ${card.color}20`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: card.gradient,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: card.gradient,
                      mr: 2,
                      boxShadow: `0 4px 16px ${card.color}30`,
                      transition: `transform ${APP_CONFIG.ANIMATION.FAST}ms ease`,
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 24, color: 'white' } })}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.5,
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PortfolioSummaryCards; 