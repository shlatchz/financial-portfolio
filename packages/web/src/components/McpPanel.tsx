import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Search as SearchIcon,
  NetworkCheck as NetworkCheckIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { McpApiService, McpResponse } from '../services/mcpApiService';
import { env } from '../config/env';

interface McpPanelProps {
  googleSheetsApiKey?: string;
  spreadsheetId?: string;
}

interface ToolResult {
  tool: string;
  loading: boolean;
  result?: McpResponse;
  error?: string;
}

const McpPanel: React.FC<McpPanelProps> = ({ googleSheetsApiKey, spreadsheetId }) => {
  const [mcpService] = useState(() => new McpApiService());
  const [isConfigured, setIsConfigured] = useState(false);
  const [toolResults, setToolResults] = useState<Record<string, ToolResult>>({});
  const [formData, setFormData] = useState({
    apiKey: googleSheetsApiKey || '',
    spreadsheet: spreadsheetId || '',
    targetBonds: env.fundsTypeDistributionBond,
    targetShares: env.fundsTypeDistributionShare,
    securityId: '5113022', // Default test security
    additionalInvestment: 0,
  });
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string>('');

  // Check MCP availability on mount
  useEffect(() => {
    checkMcpAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update form data when props change
  useEffect(() => {
    if (googleSheetsApiKey) setFormData(prev => ({ ...prev, apiKey: googleSheetsApiKey }));
    if (spreadsheetId) setFormData(prev => ({ ...prev, spreadsheet: spreadsheetId }));
  }, [googleSheetsApiKey, spreadsheetId]);

  const checkMcpAvailability = async () => {
    try {
      const available = await mcpService.isAvailable();
      setIsAvailable(available);
    } catch {
      setIsAvailable(false);
    }
  };

  const handleToolCall = async (toolName: string, toolFunction: () => Promise<McpResponse>) => {
    setToolResults(prev => ({
      ...prev,
      [toolName]: { tool: toolName, loading: true }
    }));

    try {
      const result = await toolFunction();
      setToolResults(prev => ({
        ...prev,
        [toolName]: { tool: toolName, loading: false, result }
      }));
      
      // Auto-expand the result accordion
      setExpandedAccordion(toolName);
    } catch (error) {
      setToolResults(prev => ({
        ...prev,
        [toolName]: { 
          tool: toolName, 
          loading: false, 
          error: error instanceof Error ? error.message : String(error) 
        }
      }));
      setExpandedAccordion(toolName);
    }
  };

  const configurePortfolio = async () => {
    await handleToolCall('configure_portfolio', () =>
      mcpService.configurePortfolio({
        googleSheetsApiKey: formData.apiKey,
        spreadsheetId: formData.spreadsheet,
        targetBondPercentage: formData.targetBonds,
        targetSharePercentage: formData.targetShares,
        customSecurities: env.customSecurities
      })
    );
    setIsConfigured(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const renderToolResult = (toolName: string) => {
    const result = toolResults[toolName];
    if (!result) return null;

    return (
      <Accordion 
        expanded={expandedAccordion === toolName}
        onChange={() => setExpandedAccordion(expandedAccordion === toolName ? '' : toolName)}
        sx={{ mt: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2">
              {toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Result
            </Typography>
            {result.loading && <CircularProgress size={16} />}
            {result.error && <Chip label="Error" color="error" size="small" />}
            {result.result && <Chip label="Success" color="success" size="small" />}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {result.loading && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          )}
          
          {result.error && (
            <Alert severity="error">
              <Typography variant="body2">{result.error}</Typography>
            </Alert>
          )}
          
          {result.result && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="success.main">
                  Response:
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => copyToClipboard(mcpService.extractTextContent(result.result!))}
                  title="Copy to clipboard"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50',
                  maxHeight: 300,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}
              >
                <Typography variant="body2">
                  {mcpService.extractTextContent(result.result)}
                </Typography>
              </Paper>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  if (isAvailable === null) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Checking MCP API availability...</Typography>
      </Paper>
    );
  }

  if (isAvailable === false) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>MCP API Not Available</Typography>
          <Typography variant="body2">
            The MCP API is not currently available. This could be because:
          </Typography>
          <ul style={{ marginTop: 8, marginBottom: 8 }}>
            <li>You're running locally and the Netlify dev server isn't started</li>
            <li>The deployed MCP functions are not responding</li>
            <li>There's a network connectivity issue</li>
          </ul>
          <Typography variant="body2">
            <strong>Local Development:</strong> Run <code>netlify dev</code> to start the local server.<br/>
            <strong>Production:</strong> Check that the Netlify deployment is successful.
          </Typography>
        </Alert>
        
        <Button 
          variant="outlined" 
          onClick={checkMcpAvailability}
          startIcon={<NetworkCheckIcon />}
        >
          Retry Connection
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PsychologyIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            MCP AI Tools
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interactive Model Context Protocol tools for portfolio analysis
          </Typography>
        </Box>
        <Chip 
          label={env.isDevelopment ? 'Development' : 'Production'} 
          color={env.isDevelopment ? 'warning' : 'success'} 
          size="small" 
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Configuration Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h6">Portfolio Configuration</Typography>
            {isConfigured && <Chip label="Configured" color="success" size="small" />}
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Google Sheets API Key"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Spreadsheet ID"
                value={formData.spreadsheet}
                onChange={(e) => setFormData(prev => ({ ...prev, spreadsheet: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Target Bonds %"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={formData.targetBonds}
                onChange={(e) => setFormData(prev => ({ ...prev, targetBonds: parseFloat(e.target.value) }))}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Target Shares %"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={formData.targetShares}
                onChange={(e) => setFormData(prev => ({ ...prev, targetShares: parseFloat(e.target.value) }))}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={configurePortfolio}
            disabled={!formData.apiKey || !formData.spreadsheet || toolResults.configure_portfolio?.loading}
            startIcon={toolResults.configure_portfolio?.loading ? <CircularProgress size={16} /> : <SettingsIcon />}
          >
            Configure Portfolio
          </Button>
        </CardActions>
      </Card>

      {/* MCP Tools Grid */}
      <Grid container spacing={2}>
        {/* Test Connections */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <NetworkCheckIcon color="action" />
                <Typography variant="h6">Test Connections</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Verify API connections to Google Sheets and TASE
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleToolCall('test_connections', () => mcpService.testConnections())}
                disabled={toolResults.test_connections?.loading}
                startIcon={toolResults.test_connections?.loading ? <CircularProgress size={16} /> : <NetworkCheckIcon />}
              >
                Test Connections
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Security Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SearchIcon color="action" />
                <Typography variant="h6">Security Lookup</Typography>
              </Box>
              <TextField
                fullWidth
                label="Security ID"
                value={formData.securityId}
                onChange={(e) => setFormData(prev => ({ ...prev, securityId: e.target.value }))}
                size="small"
                sx={{ mb: 2 }}
              />
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleToolCall('get_security_info', () => mcpService.getSecurityInfo(formData.securityId))}
                disabled={!formData.securityId || toolResults.get_security_info?.loading}
                startIcon={toolResults.get_security_info?.loading ? <CircularProgress size={16} /> : <SearchIcon />}
              >
                Get Security Info
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Portfolio Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AssessmentIcon color="action" />
                <Typography variant="h6">Portfolio Status</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get current portfolio status and holdings
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleToolCall('get_portfolio_status', () => mcpService.getPortfolioStatus())}
                disabled={!isConfigured || toolResults.get_portfolio_status?.loading}
                startIcon={toolResults.get_portfolio_status?.loading ? <CircularProgress size={16} /> : <AssessmentIcon />}
              >
                Get Status
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Financial Advice */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PsychologyIcon color="action" />
                <Typography variant="h6">Financial Advice</Typography>
              </Box>
              <TextField
                fullWidth
                label="Additional Investment"
                type="number"
                value={formData.additionalInvestment}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInvestment: parseFloat(e.target.value) || 0 }))}
                size="small"
                sx={{ mb: 2 }}
              />
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleToolCall('get_financial_advice', () => mcpService.getFinancialAdvice(formData.additionalInvestment))}
                disabled={!isConfigured || toolResults.get_financial_advice?.loading}
                startIcon={toolResults.get_financial_advice?.loading ? <CircularProgress size={16} /> : <PsychologyIcon />}
              >
                Get Advice
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Performance Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="action" />
                <Typography variant="h6">Portfolio Performance Analysis</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comprehensive analysis of portfolio performance and metrics
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => handleToolCall('analyze_portfolio_performance', () => mcpService.analyzePortfolioPerformance())}
                disabled={!isConfigured || toolResults.analyze_portfolio_performance?.loading}
                startIcon={toolResults.analyze_portfolio_performance?.loading ? <CircularProgress size={16} /> : <TrendingUpIcon />}
              >
                Analyze Performance
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Results Section */}
      {Object.keys(toolResults).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tool Results
          </Typography>
          {Object.keys(toolResults).map(toolName => renderToolResult(toolName))}
        </Box>
      )}
    </Paper>
  );
};

export default McpPanel; 