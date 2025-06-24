import React, { useState } from 'react';
import {
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Alert,
  Grid,
  Divider,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Calculate, Info } from '@mui/icons-material';
import { PortfolioSummary, RebalanceRecommendation } from '../types';
import { PortfolioAnalyzer } from '../services/portfolioAnalyzer';
import { env } from '../config/env';
import { formatCurrency } from '../utils/formatters';
import { getRTLTextStyles, getIsolatedRTLTextStyles } from '../utils/textDirection';
import { APP_CONFIG, COMMON_STYLES } from '../config/constants';

interface PortfolioRebalancerProps {
  summary: PortfolioSummary;
}

const PortfolioRebalancer: React.FC<PortfolioRebalancerProps> = ({ summary }) => {
  const theme = useTheme();
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [recommendations, setRecommendations] = useState<RebalanceRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const targetDistribution = {
    bond: env.fundsTypeDistributionBond,
    share: env.fundsTypeDistributionShare
  };
  const analyzer = new PortfolioAnalyzer(targetDistribution, env.customSecurities);

  const calculateRebalance = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    const result = analyzer.calculateRebalance(summary, amount);
    setRecommendations(result.recommendations);
    setShowRecommendations(true);
  };

  const getActionIcon = (action: string): React.ReactElement | undefined => {
    switch (action) {
      case 'BUY':
        return <Info color="success" />;
      case 'SELL':
        return <Info color="error" />;
      default:
        return <Info color="disabled" />;
    }
  };

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
              width: 48,
              height: 48,
              background: theme.portfolioColors.gradients.primary,
              mr: 2,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Calculate sx={{ fontSize: 24, color: 'white' }} />
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
              Portfolio Rebalancer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optimize your portfolio allocation with smart rebalancing
            </Typography>
          </Box>
        </Box>

        {summary.customSecurities.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Custom securities ({summary.customSecurities.length} items, 
              {formatCurrency(summary.customSecurities.reduce((sum, cs) => sum + cs.value, 0))}) 
              are included in fund type distribution but excluded from rebalancing recommendations 
              as they represent fixed positions.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current Distribution
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={`Bonds: ${(summary.fundTypeDistribution.bond * 100).toFixed(1)}%`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Shares: ${(summary.fundTypeDistribution.share * 100).toFixed(1)}%`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Portfolio Value: {formatCurrency(summary.totalMarketValue + summary.cashBalance.remainingCash)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Target Distribution: {(targetDistribution.bond * 100).toFixed(0)}% Bonds, {(targetDistribution.share * 100).toFixed(0)}% Shares
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Investment Amount
              </Typography>
              <TextField
                label="Amount to invest (₪)"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                InputProps={{
                  inputProps: { min: 0, step: 100 }
                }}
                fullWidth
                margin="normal"
                helperText="Enter the amount you want to invest for rebalancing"
              />
              <Button
                variant="contained"
                startIcon={<Calculate />}
                onClick={calculateRebalance}
                disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
                fullWidth
                sx={{ mt: 2 }}
              >
                Calculate Rebalance
              </Button>
            </Box>
          </Grid>
        </Grid>

        {summary.customSecurities.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Custom Securities (Fixed Positions)
              </Typography>
            </Divider>
            <Alert severity="info" sx={{ '& .MuiAlert-message': { flexGrow: 1 } }}>
              <Typography variant="body2">
                The following custom securities are included in your portfolio analysis 
                but won't appear in rebalancing recommendations:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {summary.customSecurities.map((cs) => (
                  <Typography 
                    key={cs.id} 
                    variant="body2" 
                    sx={{ 
                      ml: 2,
                      ...getRTLTextStyles(cs.id)
                    }}
                  >
                    <Box component="span" sx={getIsolatedRTLTextStyles(cs.id)}>
                      • {cs.id}
                    </Box>
                    : {formatCurrency(cs.value)}{' '}
                    ({(cs.bondPercentage * 100).toFixed(0)}% Bond, {(cs.sharePercentage * 100).toFixed(0)}% Share)
                  </Typography>
                ))}
              </Box>
            </Alert>
          </Box>
        )}

        {showRecommendations && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Rebalancing Recommendations
            </Typography>
            {recommendations.length === 0 ? (
              <Alert severity="success">
                <Typography>No actions needed - portfolio is already balanced!</Typography>
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Security</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Current Value</TableCell>
                      <TableCell align="right">Target Value</TableCell>
                      <TableCell align="right">Difference</TableCell>
                      <TableCell align="center">Action</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.map((recommendation) => (
                      <TableRow key={recommendation.security.id}>
                        <TableCell>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'medium',
                                ...getRTLTextStyles(recommendation.security.name)
                              }}
                            >
                              <Box component="span" sx={getIsolatedRTLTextStyles(recommendation.security.name)}>
                                {recommendation.security.name}
                              </Box>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {recommendation.security.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={recommendation.security.type}
                            color={recommendation.security.type === 'Bond' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(recommendation.currentValue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(recommendation.targetValue)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: recommendation.difference >= 0 ? theme.portfolioColors.success.main : theme.portfolioColors.error.main,
                            fontWeight: 'medium'
                          }}
                        >
                          {formatCurrency(Math.abs(recommendation.difference))}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {getActionIcon(recommendation.action)}
                            <Chip
                              label={recommendation.action}
                              color={
                                recommendation.action === 'BUY' ? 'success' :
                                recommendation.action === 'SELL' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {recommendation.amount > 0 ? recommendation.amount.toFixed(2) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </CardContent>
    </Paper>
  );
};

export default PortfolioRebalancer; 