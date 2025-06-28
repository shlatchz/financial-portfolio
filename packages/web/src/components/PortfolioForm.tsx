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
  Avatar,
} from '@mui/material';
import { CloudUpload, Cable } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { env } from '../config/env';
import { GoogleSheetsService } from '@portfolio/core';
import { APP_CONFIG, COMMON_STYLES } from '../config/constants';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

interface PortfolioFormProps {
  onAnalyze: (spreadsheetUrl: string, apiKey: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onAnalyze, isLoading = false, error }) => {
  const theme = useTheme();
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(env.defaultSpreadsheetUrl);
  const [apiKey, setApiKey] = useState(env.defaultGoogleSheetsApiKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sheets?: string[] } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (spreadsheetUrl.trim() && apiKey.trim()) {
      onAnalyze(spreadsheetUrl.trim(), apiKey.trim());
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
            <CloudUpload sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                ...COMMON_STYLES.GRADIENT_TEXT(theme.portfolioColors.gradients.primary),
                mb: 0.5,
              }}
            >
              Portfolio Data Source
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your Google Sheets portfolio for analysis and auto-configure AI tools
            </Typography>
          </Box>
        </Box>

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