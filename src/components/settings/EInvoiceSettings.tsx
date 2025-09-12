// E-Invoice Configuration Settings Component
// Allows merchants to configure IRP credentials and E-Invoice settings

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Grid,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Science as TestIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getEInvoiceConfig, saveEInvoiceConfig, createIRPService } from '../../lib/irpApiService';
import toast from 'react-hot-toast';

interface EInvoiceConfigForm {
  is_enabled: boolean;
  irp_username: string;
  irp_password: string;
  client_id: string;
  client_secret: string;
  gstin: string;
  annual_turnover: number;
  einvoice_threshold: number;
  auto_generate_einvoice: boolean;
  irp_base_url: string;
}

export default function EInvoiceSettings() {
  const { profile, merchant } = useAuth();
  const [config, setConfig] = useState<EInvoiceConfigForm>({
    is_enabled: false,
    irp_username: '',
    irp_password: '',
    client_id: '',
    client_secret: '',
    gstin: merchant?.gstin || '',
    annual_turnover: 0,
    einvoice_threshold: 500,
    auto_generate_einvoice: false,
    irp_base_url: 'https://api.einvoice.gov.in'
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    clientSecret: false
  });
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [merchant?.id]);

  const loadConfig = async () => {
    if (!merchant?.id) return;
    
    try {
      const existingConfig = await getEInvoiceConfig(merchant.id);
      if (existingConfig) {
        setConfig({
          is_enabled: existingConfig.is_enabled,
          irp_username: existingConfig.irp_username || '',
          irp_password: '', // Don't load encrypted password
          client_id: existingConfig.client_id || '',
          client_secret: '', // Don't load encrypted secret
          gstin: existingConfig.gstin,
          annual_turnover: existingConfig.annual_turnover || 0,
          einvoice_threshold: existingConfig.einvoice_threshold || 500,
          auto_generate_einvoice: existingConfig.auto_generate_einvoice,
          irp_base_url: existingConfig.irp_base_url || 'https://api.einvoice.gov.in'
        });
      }
    } catch (error) {
      console.error('Error loading E-Invoice config:', error);
    }
  };

  const handleInputChange = (field: keyof EInvoiceConfigForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.type === 'number'
      ? parseFloat(event.target.value) || 0
      : event.target.value;
    
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!merchant?.id) return;
    
    setLoading(true);
    try {
      // Validate required fields
      if (config.is_enabled) {
        if (!config.irp_username || !config.client_id || !config.gstin) {
          toast.error('Please fill in all required fields');
          return;
        }
        
        if (config.gstin !== merchant.gstin) {
          toast.error('GSTIN must match your merchant GSTIN');
          return;
        }
      }

      const success = await saveEInvoiceConfig(merchant.id, {
        ...config,
        irp_password_encrypted: config.irp_password,
        client_secret_encrypted: config.client_secret
      });

      if (success) {
        toast.success('E-Invoice configuration saved successfully');
        loadConfig(); // Reload to clear passwords
      } else {
        toast.error('Failed to save E-Invoice configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!merchant?.id) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      // First save the current config
      await saveEInvoiceConfig(merchant.id, {
        ...config,
        irp_password_encrypted: config.irp_password,
        client_secret_encrypted: config.client_secret
      });

      // Test the connection
      const irpService = await createIRPService(merchant.id);
      if (!irpService) {
        setTestResult({
          success: false,
          message: 'Failed to create IRP service. Please check your configuration.'
        });
        return;
      }

      // Try to authenticate
      try {
        await (irpService as any).authenticate();
        setTestResult({
          success: true,
          message: 'Connection successful! IRP authentication completed.'
        });
      } catch (authError: any) {
        setTestResult({
          success: false,
          message: `Authentication failed: ${authError.message}`
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${error.message}`
      });
    } finally {
      setTesting(false);
      setShowTestDialog(true);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'clientSecret') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        E-Invoice Configuration
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Configure your E-Invoice settings to generate government-compliant E-Invoices through the IRP (Invoice Registration Portal).
          E-Invoice is mandatory for B2B transactions above ₹500 for registered businesses.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Enable E-Invoice */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_enabled}
                    onChange={handleInputChange('is_enabled')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">Enable E-Invoice</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Turn on E-Invoice generation for your business
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {config.is_enabled && (
              <>
                <Grid item xs={12}>
                  <Divider>
                    <Chip label="IRP Credentials" />
                  </Divider>
                </Grid>

                {/* IRP Username */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IRP Username"
                    value={config.irp_username}
                    onChange={handleInputChange('irp_username')}
                    required
                    helperText="Your IRP portal username"
                  />
                </Grid>

                {/* IRP Password */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IRP Password"
                    type={showPasswords.password ? 'text' : 'password'}
                    value={config.irp_password}
                    onChange={handleInputChange('irp_password')}
                    required
                    helperText="Your IRP portal password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('password')}
                            edge="end"
                          >
                            {showPasswords.password ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Client ID */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    value={config.client_id}
                    onChange={handleInputChange('client_id')}
                    required
                    helperText="API Client ID from your GSP provider"
                  />
                </Grid>

                {/* Client Secret */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client Secret"
                    type={showPasswords.clientSecret ? 'text' : 'password'}
                    value={config.client_secret}
                    onChange={handleInputChange('client_secret')}
                    required
                    helperText="API Client Secret from your GSP provider"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('clientSecret')}
                            edge="end"
                          >
                            {showPasswords.clientSecret ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider>
                    <Chip label="Business Configuration" />
                  </Divider>
                </Grid>

                {/* GSTIN */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GSTIN"
                    value={config.gstin}
                    onChange={handleInputChange('gstin')}
                    required
                    helperText="Must match your merchant GSTIN"
                    inputProps={{ maxLength: 15 }}
                  />
                </Grid>

                {/* Annual Turnover */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Annual Turnover"
                    type="number"
                    value={config.annual_turnover}
                    onChange={handleInputChange('annual_turnover')}
                    helperText="Your business annual turnover in ₹"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                  />
                </Grid>

                {/* E-Invoice Threshold */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-Invoice Threshold"
                    type="number"
                    value={config.einvoice_threshold}
                    onChange={handleInputChange('einvoice_threshold')}
                    helperText="Minimum invoice amount for E-Invoice generation"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                  />
                </Grid>

                {/* IRP Base URL */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IRP Base URL"
                    value={config.irp_base_url}
                    onChange={handleInputChange('irp_base_url')}
                    helperText="IRP API endpoint (production/sandbox)"
                  />
                </Grid>

                {/* Auto Generate */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.auto_generate_einvoice}
                        onChange={handleInputChange('auto_generate_einvoice')}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Auto-generate E-Invoice</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Automatically generate E-Invoice for eligible sales
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<TestIcon />}
                      onClick={handleTestConnection}
                      disabled={loading || testing || !config.irp_username || !config.client_id}
                    >
                      {testing ? 'Testing...' : 'Test Connection'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Test Result Dialog */}
      <Dialog open={showTestDialog} onClose={() => setShowTestDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {testResult?.success ? (
              <CheckIcon color="success" />
            ) : (
              <ErrorIcon color="error" />
            )}
            Connection Test Result
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity={testResult?.success ? 'success' : 'error'}>
            {testResult?.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
