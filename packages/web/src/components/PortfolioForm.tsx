import React, { useState } from 'react';
import {
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import { Cable } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { env } from '../config/env';
import { GoogleSheetsService, CustomSecurity } from '@portfolio/core';
import { APP_CONFIG, COMMON_STYLES } from '../config/constants';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

interface PortfolioFormProps {
  onAnalyze: (spreadsheetUrl: string, apiKey: string, bondPercentage: number, sharePercentage: number, customSecurities: CustomSecurity[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onAnalyze, isLoading = false, error }) => {
  const theme = useTheme();
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(env.defaultSpreadsheetUrl);
  const [apiKey, setApiKey] = useState(env.defaultGoogleSheetsApiKey);
  const [bondPercentage, setBondPercentage] = useState(env.fundsTypeDistributionBond * 100); // Convert to percentage for UI
  const [sharePercentage, setSharePercentage] = useState(env.fundsTypeDistributionShare * 100); // Convert to percentage for UI
  const [customSecurities, setCustomSecurities] = useState<CustomSecurity[]>(env.customSecurities);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sheets?: string[] } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (spreadsheetUrl.trim() && apiKey.trim()) {
      // Convert percentages back to decimals for the callback
      onAnalyze(spreadsheetUrl.trim(), apiKey.trim(), bondPercentage / 100, sharePercentage / 100, customSecurities);
    }
  };

  const handleTestConnection = async (): Promise<void> => {
    if (!spreadsheetUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a spreadsheet URL' });
      return;
    }

    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a Google Sheets API key' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(spreadsheetUrl);
      if (!spreadsheetId) {
        setTestResult({ success: false, message: 'Invalid Google Sheets URL format' });
        return;
      }

      const testService = new GoogleSheetsService(apiKey);
      const result = await testService.testConnection(spreadsheetId);
      setTestResult(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setTestResult({ success: false, message: errorMessage });
    } finally {
      setIsTesting(false);
    }
  };

  // Custom Securities Management Functions
  const addCustomSecurity = () => {
    const newSecurity: CustomSecurity = {
      id: `custom-${Date.now()}`,
      bondPercentage: 0,
      sharePercentage: 0,
      value: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setCustomSecurities([...customSecurities, newSecurity]);
  };

  const updateCustomSecurity = (index: number, field: keyof CustomSecurity, value: string | number) => {
    const updated = [...customSecurities];
    if (field === 'bondPercentage' || field === 'sharePercentage' || field === 'value') {
      updated[index] = { ...updated[index], [field]: Number(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setCustomSecurities(updated);
  };

  const removeCustomSecurity = (index: number) => {
    setCustomSecurities(customSecurities.filter((_, i) => i !== index));
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
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Google Spreadsheet URL"
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit"
            margin="normal"
            required
            disabled={isLoading}
            helperText="Paste the complete URL of your Google Sheets portfolio spreadsheet"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                background: 'rgba(255, 255, 255, 0.8)',
                transition: `all ${APP_CONFIG.ANIMATION.NORMAL}ms ease`,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  background: '#ffffff',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
          />
          
          <TextField
            fullWidth
            label="Google Sheets API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Google Sheets API key here"
            margin="normal"
            required
            disabled={isLoading}
            helperText="Get your API key from Google Cloud Console"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                background: 'rgba(255, 255, 255, 0.8)',
                transition: `all ${APP_CONFIG.ANIMATION.NORMAL}ms ease`,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  background: '#ffffff',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
          />

          {/* Target Allocation Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Target Portfolio Allocation
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Bonds (%)"
                type="number"
                value={bondPercentage}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                  setBondPercentage(value);
                  setSharePercentage(100 - value);
                }}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                disabled={isLoading}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                    background: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                helperText="Target percentage for bond investments"
              />
              <TextField
                label="Shares (%)"
                type="number"
                value={sharePercentage}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                  setSharePercentage(value);
                  setBondPercentage(100 - value);
                }}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                disabled={isLoading}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                    background: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                helperText="Target percentage for share investments"
              />
            </Stack>
            {Math.abs(bondPercentage + sharePercentage - 100) > 0.1 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                ⚠️ Percentages should total 100% (currently {(bondPercentage + sharePercentage).toFixed(1)}%)
              </Typography>
            )}
          </Box>

          {/* Custom Securities Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Custom Securities (Pension Funds, etc.)
            </Typography>
            
            {customSecurities.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  border: '2px dashed rgba(0, 0, 0, 0.12)',
                  borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No custom securities configured. Add pension funds or other non-market securities.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={addCustomSecurity}
                  disabled={isLoading}
                  sx={{
                    borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                    fontWeight: 600,
                  }}
                >
                  Add Custom Security
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {customSecurities.map((security, index) => (
                  <Paper
                    key={security.id}
                    sx={{
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Security ID"
                          value={security.id}
                          onChange={(e) => updateCustomSecurity(index, 'id', e.target.value)}
                          disabled={isLoading}
                          sx={{ flex: 2 }}
                          helperText="Unique identifier (e.g., pension-fund-1)"
                        />
                        <TextField
                          label="Value (₪)"
                          type="number"
                          value={security.value}
                          onChange={(e) => updateCustomSecurity(index, 'value', e.target.value)}
                          disabled={isLoading}
                          sx={{ flex: 1 }}
                          inputProps={{ min: 0, step: 100 }}
                          helperText="Current value in NIS"
                        />
                        <TextField
                          label="Date"
                          type="date"
                          value={security.date}
                          onChange={(e) => updateCustomSecurity(index, 'date', e.target.value)}
                          disabled={isLoading}
                          sx={{ flex: 1 }}
                          InputLabelProps={{ shrink: true }}
                          helperText="Valuation date"
                        />
                      </Stack>
                      
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="end">
                        <TextField
                          label="Bond Allocation (%)"
                          type="number"
                          value={security.bondPercentage * 100}
                          onChange={(e) => updateCustomSecurity(index, 'bondPercentage', Number(e.target.value) / 100)}
                          disabled={isLoading}
                          sx={{ flex: 1 }}
                          inputProps={{ min: 0, max: 100, step: 0.1 }}
                          helperText="% allocated to bonds"
                        />
                        <TextField
                          label="Share Allocation (%)"
                          type="number"
                          value={security.sharePercentage * 100}
                          onChange={(e) => updateCustomSecurity(index, 'sharePercentage', Number(e.target.value) / 100)}
                          disabled={isLoading}
                          sx={{ flex: 1 }}
                          inputProps={{ min: 0, max: 100, step: 0.1 }}
                          helperText="% allocated to shares"
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => removeCustomSecurity(index)}
                          disabled={isLoading}
                          sx={{
                            minWidth: 100,
                            borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                          }}
                        >
                          Remove
                        </Button>
                      </Stack>
                      
                      {Math.abs(security.bondPercentage + security.sharePercentage - 1) > 0.001 && (
                        <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                          ⚠️ Allocations should total 100% (currently {((security.bondPercentage + security.sharePercentage) * 100).toFixed(1)}%)
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={addCustomSecurity}
                  disabled={isLoading}
                  sx={{
                    borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                    fontWeight: 600,
                    alignSelf: 'flex-start',
                  }}
                >
                  Add Another Security
                </Button>
              </Stack>
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Cable />}
              onClick={handleTestConnection}
              disabled={isLoading || isTesting || !spreadsheetUrl.trim() || !apiKey.trim()}
              sx={{
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                borderWidth: 2,
                fontWeight: 600,
                '&:hover': {
                  borderWidth: 2,
                  transform: APP_CONFIG.UI.HOVER_TRANSFORM,
                },
              }}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !spreadsheetUrl.trim() || !apiKey.trim()}
              sx={{
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
                background: theme.portfolioColors.gradients.primary,
                fontWeight: 600,
                px: 4,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: theme.portfolioColors.gradients.primary,
                  transform: APP_CONFIG.UI.HOVER_TRANSFORM,
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Portfolio & Configure AI Tools'}
            </Button>
          </Stack>

          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'} 
              sx={{ 
                mb: 2,
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {testResult.message}
              </Typography>
              {testResult.success && testResult.sheets && testResult.sheets.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Available sheets:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {testResult.sheets.map((sheet, index) => (
                      <Chip
                        key={index}
                        label={sheet}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: APP_CONFIG.UI.BUTTON_BORDER_RADIUS,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Paper>
  );
};

export default PortfolioForm; 