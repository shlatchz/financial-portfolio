import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, CircularProgress, Stack, Alert, Paper, Fade, Grow, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { TrendingUp, ExpandMore, CloudUpload, SmartToy } from '@mui/icons-material';
import { portfolioTheme } from './theme';
import PortfolioForm from './components/PortfolioForm';
import PortfolioSummaryCards from './components/PortfolioSummaryCards';
import PortfolioChart from './components/PortfolioChart';
import SecuritiesTable from './components/SecuritiesTable';
import PortfolioRebalancer from './components/PortfolioRebalancer';
import McpPanel from './components/McpPanel';
import { usePortfolioData } from './hooks/usePortfolioData';
import { env, validateEnv, getEnvInfo } from './config/env';
import { APP_CONFIG, COMMON_STYLES } from './config/constants';
import { McpApiService } from './services/mcpApiService';
import { GoogleSheetsService, CustomSecurity } from '@portfolio/core';

// Create a client with environment-based configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: env.queryRetryCount,
      staleTime: env.queryStaleTime,
    },
  },
});

const PortfolioApp: React.FC = () => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [bondPercentage, setBondPercentage] = useState(env.fundsTypeDistributionBond);
  const [sharePercentage, setSharePercentage] = useState(env.fundsTypeDistributionShare);
  const [customSecurities, setCustomSecurities] = useState(env.customSecurities);
  const [shouldAnalyze, setShouldAnalyze] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [envValid, setEnvValid] = useState(true);
  const [envInfo, setEnvInfo] = useState<ReturnType<typeof getEnvInfo> | null>(null);
  const [mcpConfigured, setMcpConfigured] = useState(false);
  const [mcpConfigError, setMcpConfigError] = useState<string | null>(null);
  const [portfolioFormExpanded, setPortfolioFormExpanded] = useState(false);
  const [mcpPanelExpanded, setMcpPanelExpanded] = useState(false);
  
  const queryClientInstance = useQueryClient();
  const mcpService = new McpApiService();

  // Helper function to configure MCP service
  const configureMcpService = async (url: string, key: string, bondPercentage: number, sharePercentage: number, customSecurities: CustomSecurity[]) => {
    try {
      setMcpConfigError(null);
      const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(url);
      if (spreadsheetId) {
        await mcpService.configurePortfolio({
          googleSheetsApiKey: key,
          spreadsheetId: spreadsheetId,
          targetBondPercentage: bondPercentage,
          targetSharePercentage: sharePercentage,
          customSecurities: customSecurities
        });
        setMcpConfigured(true);
      }
    } catch (error) {
      console.warn('MCP configuration failed (this is optional):', error);
      setMcpConfigError(error instanceof Error ? error.message : 'Failed to configure MCP service');
    }
  };

  useEffect(() => {
    const isValid = validateEnv();
    setEnvValid(isValid);
    const info = getEnvInfo();
    setEnvInfo(info);

    if (isValid && env.defaultGoogleSheetsApiKey && env.defaultSpreadsheetUrl) {
      setSpreadsheetUrl(env.defaultSpreadsheetUrl);
      setApiKey(env.defaultGoogleSheetsApiKey);
      setShouldAnalyze(true);
      
      // Also auto-configure MCP service with default distribution
      configureMcpService(env.defaultSpreadsheetUrl, env.defaultGoogleSheetsApiKey, env.fundsTypeDistributionBond, env.fundsTypeDistributionShare, env.customSecurities);
      
      // Expand Portfolio form to show the auto-configured settings
      setPortfolioFormExpanded(true);
      // Expand MCP panel when auto-start is enabled
      setMcpPanelExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: portfolioSummary, isLoading, error, refetch } = usePortfolioData({
    spreadsheetUrl,
    apiKey,
    bondPercentage,
    sharePercentage,
    customSecurities,
    enabled: shouldAnalyze && !!spreadsheetUrl && !!apiKey && envValid
  });

  const handleAnalyze = async (url: string, key: string, bondPercentage: number, sharePercentage: number, customSecuritiesParam: CustomSecurity[]) => {
    const isReAnalysis = url === spreadsheetUrl && key === apiKey && shouldAnalyze;
    
    if (isReAnalysis) {
      setIsReanalyzing(true);
      
      try {
        await queryClientInstance.invalidateQueries({
          queryKey: ['portfolio', url, key, bondPercentage, sharePercentage, customSecuritiesParam]
        });
        await refetch();
      } finally {
        setIsReanalyzing(false);
      }
    } else {
      setSpreadsheetUrl(url);
      setApiKey(key);
      setBondPercentage(bondPercentage);
      setSharePercentage(sharePercentage);
      setCustomSecurities(customSecuritiesParam);
      setShouldAnalyze(true);
    }
    
    // Also configure MCP service automatically with user-specified allocation and custom securities
    await configureMcpService(url, key, bondPercentage, sharePercentage, customSecuritiesParam);
    
    // Expand both panels after successful analysis
    setPortfolioFormExpanded(true);
    setMcpPanelExpanded(true);
  };

  const renderContent = () => {
    if (!envValid) {
      return (
        <Grow in timeout={APP_CONFIG.ANIMATION.NORMAL}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4,
              borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Configuration Required
            </Typography>
            <Typography>
              Please configure your environment variables. You can now provide your Google Sheets API key directly in the form below.
            </Typography>
          </Alert>
        </Grow>
      );
    }

    if (error) {
      return (
        <Grow in timeout={APP_CONFIG.ANIMATION.NORMAL}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Analysis Failed
            </Typography>
            <Typography>
              {error instanceof Error ? error.message : String(error)}
            </Typography>
          </Alert>
        </Grow>
      );
    }

    if (isLoading || isReanalyzing) {
      return (
         <Fade in timeout={APP_CONFIG.ANIMATION.FAST}>
            <Paper
              elevation={0}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', 
                py: 8,
                ...COMMON_STYLES.GLASS_MORPHISM,
                borderRadius: APP_CONFIG.UI.CARD_BORDER_RADIUS,
              }}
            >
              <Box sx={{ position: 'relative', mb: 3 }}>
                <CircularProgress 
                  size={60} 
                  thickness={4}
                  sx={{
                    color: portfolioTheme.portfolioColors.primary.main,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  ...COMMON_STYLES.GRADIENT_TEXT(portfolioTheme.portfolioColors.gradients.primary),
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Analyzing Portfolio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fetching data and calculating metrics...
              </Typography>
            </Paper>
          </Fade>
      );
    }

    if (portfolioSummary) {
      return (
        <Stack spacing={6}>
          {/* Summary Cards */}
          <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '200ms' }}>
            <Box>
              <PortfolioSummaryCards summary={portfolioSummary} />
            </Box>
          </Fade>

          {/* Portfolio Chart */}
          <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '300ms' }}>
            <Box>
              <PortfolioChart summary={portfolioSummary} />
            </Box>
          </Fade>
          
          {/* Securities Table */}
          <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '400ms' }}>
            <Box>
              <SecuritiesTable summary={portfolioSummary} />
            </Box>
          </Fade>

          {/* Portfolio Rebalancer */}
          <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '500ms' }}>
            <Box>
              <PortfolioRebalancer summary={portfolioSummary} />
            </Box>
          </Fade>
        </Stack>
      );
    }

    return null;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '300px',
        background: portfolioTheme.portfolioColors.gradients.header,
        opacity: 0.1,
        zIndex: 0,
      }
    }}>
      <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Modern Header */}
        <Fade in timeout={APP_CONFIG.ANIMATION.SLOW}>
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              mb: 6,
              p: 4,
              ...COMMON_STYLES.GLASS_MORPHISM,
              borderRadius: APP_CONFIG.UI.CARD_BORDER_RADIUS,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  background: portfolioTheme.portfolioColors.gradients.primary,
                  borderRadius: '50%',
                  p: 2,
                  mr: 2,
                  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                  transition: `transform ${APP_CONFIG.ANIMATION.NORMAL}ms ease`,
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                  },
                }}
              >
                <TrendingUp sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    ...COMMON_STYLES.GRADIENT_TEXT(portfolioTheme.portfolioColors.gradients.primary),
                    fontWeight: 800,
                    mb: 1,
                  }}
                >
                  Portfolio Manager
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 400,
                    opacity: 0.8,
                  }}
                >
                  Professional Investment Portfolio Analysis & Rebalancing
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Environment Configuration Warning */}
        {!envValid && (
          <Grow in timeout={APP_CONFIG.ANIMATION.NORMAL}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 4,
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                }
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Configuration Required
              </Typography>
              <Typography>
                Please configure your environment variables in the .env file:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Configuration is now handled in the UI form below</li>
              </Box>
            </Alert>
          </Grow>
        )}

        {/* Development Environment Info */}
        {env.isDevelopment && envInfo && (
          <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '200ms' }}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4,
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                <strong>Development Mode:</strong> Environment: {envInfo.environment} | 
                Default API Key: {envInfo.hasDefaultGoogleApiKey ? '✓' : '✗'} | 
                Query Cache: {envInfo.queryConfig.staleTime / 1000}s
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Auto-Start Notification */}
        {env.defaultGoogleSheetsApiKey && env.defaultSpreadsheetUrl && (
          <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '250ms' }}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4,
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Auto-Start Enabled
              </Typography>
              <Typography variant="body2">
                Portfolio analysis started automatically using default configuration from environment variables.
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Portfolio Form Accordion */}
        <Grow in timeout={APP_CONFIG.ANIMATION.NORMAL}>
          <Box sx={{ mb: 6 }}>
            <Accordion 
              expanded={portfolioFormExpanded} 
              onChange={(_, isExpanded) => setPortfolioFormExpanded(isExpanded)}
              elevation={0}
              sx={{
                ...COMMON_STYLES.GLASS_MORPHISM,
                borderRadius: APP_CONFIG.UI.CARD_BORDER_RADIUS,
                overflow: 'hidden',
                '&:before': {
                  display: 'none',
                },
                '& .MuiAccordionSummary-root': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: `${APP_CONFIG.UI.CARD_BORDER_RADIUS}px ${APP_CONFIG.UI.CARD_BORDER_RADIUS}px 0 0`,
                  minHeight: 72,
                  '&.Mui-expanded': {
                    minHeight: 72,
                  },
                },
                '& .MuiAccordionDetails-root': {
                  padding: 0,
                  background: 'transparent',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    margin: '16px 0',
                    '&.Mui-expanded': {
                      margin: '16px 0',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CloudUpload 
                    sx={{ 
                      fontSize: 28, 
                      mr: 2,
                      color: portfolioTheme.portfolioColors.primary.main 
                    }} 
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Portfolio Data Source
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure your Google Sheets portfolio and target allocation
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <PortfolioForm 
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading || isReanalyzing}
                  error={error instanceof Error ? error.message : null}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grow>

        {/* MCP AI Tools Accordion */}
        <Fade in timeout={APP_CONFIG.ANIMATION.NORMAL} style={{ transitionDelay: '350ms' }}>
          <Box sx={{ mb: 6 }}>
            <Accordion 
              expanded={mcpPanelExpanded} 
              onChange={(_, isExpanded) => setMcpPanelExpanded(isExpanded)}
              elevation={0}
              sx={{
                ...COMMON_STYLES.GLASS_MORPHISM,
                borderRadius: APP_CONFIG.UI.CARD_BORDER_RADIUS,
                overflow: 'hidden',
                '&:before': {
                  display: 'none',
                },
                '& .MuiAccordionSummary-root': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: `${APP_CONFIG.UI.CARD_BORDER_RADIUS}px ${APP_CONFIG.UI.CARD_BORDER_RADIUS}px 0 0`,
                  minHeight: 72,
                  '&.Mui-expanded': {
                    minHeight: 72,
                  },
                },
                '& .MuiAccordionDetails-root': {
                  padding: 0,
                  background: 'transparent',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    margin: '16px 0',
                    '&.Mui-expanded': {
                      margin: '16px 0',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SmartToy 
                    sx={{ 
                      fontSize: 28, 
                      mr: 2,
                      color: portfolioTheme.portfolioColors.secondary.main 
                    }} 
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      MCP AI Tools
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI-powered portfolio analysis and recommendations
                      {mcpConfigured && (
                        <Typography component="span" color="success.main" sx={{ ml: 1, fontWeight: 600 }}>
                          • Configured
                        </Typography>
                      )}
                      {mcpConfigError && (
                        <Typography component="span" color="error.main" sx={{ ml: 1, fontWeight: 600 }}>
                          • Configuration Error
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <McpPanel 
                  isAutoConfigured={mcpConfigured}
                  autoConfigError={mcpConfigError}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </Fade>

        {renderContent()}
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={portfolioTheme}>
        <CssBaseline />
        <PortfolioApp />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 