import React from 'react';
import {
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Divider,
  Paper,
  Avatar,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountBalance, TrendingUp } from '@mui/icons-material';
import { PortfolioSummary, PortfolioSecurity, formatCurrency, formatAmount, CustomSecurity } from '@portfolio/core';
import { getRTLTextStyles, getIsolatedRTLTextStyles } from '../utils/textDirection';
import { APP_CONFIG } from '../config/constants';

interface SecuritiesTableProps {
  summary: PortfolioSummary;
}

const SecuritiesTable: React.FC<SecuritiesTableProps> = ({ summary }) => {
  const theme = useTheme();

  const createTooltipContent = (security: PortfolioSecurity) => {
    const hasData = security.managementFee !== undefined || 
                    security.trusteeFee !== undefined || 
                    security.currentPrice !== undefined;
    
    if (!hasData) {
      return (
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No TASE API data available
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 1, minWidth: 200 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          TASE API Information
        </Typography>
        
        {security.managementFee !== undefined && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Management Fee:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {security.managementFee.toFixed(2)}%
            </Typography>
          </Box>
        )}
        
        {security.trusteeFee !== undefined && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Trustee Fee:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {security.trusteeFee.toFixed(2)}%
            </Typography>
          </Box>
        )}
        
        {security.currentPrice !== undefined && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Unit Price:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {formatCurrency(security.currentPrice)}
            </Typography>
          </Box>
        )}
        
        {security.lastUpdate && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" color="text.secondary">
              Last Updated: {new Date(security.lastUpdate).toLocaleDateString('he-IL')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: theme.portfolioColors.gradients.primary,
              mr: 2,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <AccountBalance sx={{ fontSize: 24, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 700,
                background: theme.portfolioColors.gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              Portfolio Securities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed breakdown of your investment holdings
            </Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Security Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Current Amount</TableCell>
                <TableCell align="right">Buy Value (₪)</TableCell>
                <TableCell align="right">Current Value (₪)</TableCell>
                <TableCell align="right">Profit/Loss (₪)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Regular Securities */}
              {summary.securities.map((security: PortfolioSecurity) => {
                const profitLoss = security.currentMarketValue - security.netBuyValue;
                return (
                  <Tooltip
                    key={security.id}
                    title={createTooltipContent(security)}
                    placement="top"
                    enterDelay={APP_CONFIG.TOOLTIP.ENTER_DELAY}
                    leaveDelay={APP_CONFIG.TOOLTIP.LEAVE_DELAY}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 2,
                          maxWidth: 'none',
                        }
                      }
                    }}
                  >
                    <TableRow 
                      sx={{ 
                        cursor: 'pointer',
                        transition: `all ${APP_CONFIG.ANIMATION.FAST}ms ease`,
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.05)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'medium',
                              ...getRTLTextStyles(security.name)
                            }}
                          >
                            <Box component="span" sx={getIsolatedRTLTextStyles(security.name)}>
                              {security.name}
                            </Box>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {security.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={security.type}
                          color={security.type === 'Bond' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatAmount(security.currentAmount)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(security.netBuyValue)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(security.currentMarketValue)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: profitLoss >= 0 ? theme.portfolioColors.success.main : theme.portfolioColors.error.main,
                          fontWeight: 'bold'
                        }}
                      >
                        {formatCurrency(profitLoss)}
                      </TableCell>
                    </TableRow>
                  </Tooltip>
                );
              })}
              
              {/* Custom Securities Section */}
              {summary.customSecurities.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Divider sx={{ my: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Custom Securities
                        </Typography>
                      </Divider>
                    </TableCell>
                  </TableRow>
                  {summary.customSecurities.map((customSecurity: CustomSecurity) => (
                    <TableRow 
                      key={`custom-${customSecurity.id}`} 
                      sx={{ backgroundColor: theme.palette.action.hover }}
                    >
                      <TableCell component="th" scope="row">
                        <Box>
                          <Typography 
                            variant="body1" 
                            component="div"
                            sx={{ 
                              fontWeight: 'medium',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexDirection: 'row',
                              ...getRTLTextStyles(customSecurity.id)
                            }}
                          >
                            <Box component="span" sx={getIsolatedRTLTextStyles(customSecurity.id)}>
                              {customSecurity.id}
                            </Box>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Date: {customSecurity.date}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip
                            label="Custom"
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                          {customSecurity.bondPercentage > 0 && (
                            <Chip
                              icon={<AccountBalance />}
                              label={`${(customSecurity.bondPercentage * 100).toFixed(0)}% Bond`}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {customSecurity.sharePercentage > 0 && (
                            <Chip
                              icon={<TrendingUp />}
                              label={`${(customSecurity.sharePercentage * 100).toFixed(0)}% Share`}
                              color="secondary"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          Fixed
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(customSecurity.value)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(customSecurity.value)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Paper>
  );
};

export default SecuritiesTable; 