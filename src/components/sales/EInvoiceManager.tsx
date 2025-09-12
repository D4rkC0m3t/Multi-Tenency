// E-Invoice Management Component
// Handles E-Invoice generation, verification, and cancellation for sales

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Sale, Customer, Merchant, SaleItem, Product } from '../../lib/supabase';
import { 
  createIRPService, 
  getEInvoiceMetadata, 
  isEInvoiceEligible,
  getEInvoiceConfig 
} from '../../lib/irpApiService';
import toast from 'react-hot-toast';

interface EInvoiceManagerProps {
  sale: Sale;
  customer: Customer;
  merchant: Merchant;
  saleItems: (SaleItem & { product: Product })[];
  onEInvoiceGenerated?: (metadata: any) => void;
}

interface EInvoiceMetadata {
  id: string;
  irn: string;
  ack_no: string;
  ack_date: string;
  signed_invoice: string;
  signed_qr_code: string;
  status: 'active' | 'cancelled';
  created_at: string;
  cancelled_at?: string;
  cancel_reason?: string;
}

export default function EInvoiceManager({
  sale,
  customer,
  merchant,
  saleItems,
  onEInvoiceGenerated
}: EInvoiceManagerProps) {
  const [metadata, setMetadata] = useState<EInvoiceMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [eligibilityCheck, setEligibilityCheck] = useState<{
    eligible: boolean;
    reasons: string[];
  } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    checkConfiguration();
    checkEligibility();
    loadMetadata();
  }, [sale.id, merchant.id]);

  const checkConfiguration = async () => {
    try {
      const config = await getEInvoiceConfig(merchant.id);
      setIsConfigured(config?.is_enabled || false);
    } catch (error) {
      console.error('Error checking E-Invoice config:', error);
      setIsConfigured(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const result = await isEInvoiceEligible(sale, customer, merchant);
      setEligibilityCheck(result);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityCheck({
        eligible: false,
        reasons: ['Error checking eligibility']
      });
    }
  };

  const loadMetadata = async () => {
    try {
      const existingMetadata = await getEInvoiceMetadata(sale.id);
      setMetadata(existingMetadata);
    } catch (error) {
      console.error('Error loading E-Invoice metadata:', error);
    }
  };

  const handleGenerateEInvoice = async () => {
    if (!eligibilityCheck?.eligible) {
      toast.error('Sale is not eligible for E-Invoice generation');
      return;
    }

    setLoading(true);
    try {
      const irpService = await createIRPService(merchant.id);
      if (!irpService) {
        toast.error('E-Invoice service not configured. Please check settings.');
        return;
      }

      const result = await (irpService as any).generateEInvoice(
        sale,
        saleItems,
        customer,
        merchant
      );

      if (result.success) {
        toast.success('E-Invoice generated successfully!');
        await loadMetadata();
        onEInvoiceGenerated?.(result.metadata);
      } else {
        toast.error(`E-Invoice generation failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error generating E-Invoice:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEInvoice = async () => {
    if (!metadata?.irn) return;

    setLoading(true);
    try {
      const irpService = await createIRPService(merchant.id);
      if (!irpService) {
        toast.error('E-Invoice service not configured');
        return;
      }

      const result = await (irpService as any).verifyEInvoice(metadata.irn);
      
      if (result.success) {
        toast.success('E-Invoice verified successfully');
        // Update local metadata if needed
        if (result.data.status !== metadata.status) {
          await loadMetadata();
        }
      } else {
        toast.error(`Verification failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error verifying E-Invoice:', error);
      toast.error(`Verification error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEInvoice = async () => {
    if (!metadata?.irn || !cancelReason.trim()) return;

    setLoading(true);
    try {
      const irpService = await createIRPService(merchant.id);
      if (!irpService) {
        toast.error('E-Invoice service not configured');
        return;
      }

      const result = await (irpService as any).cancelEInvoice(
        metadata.irn,
        cancelReason.trim()
      );

      if (result.success) {
        toast.success('E-Invoice cancelled successfully');
        await loadMetadata();
        setShowCancelDialog(false);
        setCancelReason('');
      } else {
        toast.error(`Cancellation failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error cancelling E-Invoice:', error);
      toast.error(`Cancellation error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!metadata) return;

    try {
      // Note: This is a placeholder - the actual PDF generation would need to be implemented
      // based on your existing PDF generation system
      toast('PDF generation feature will be implemented with your existing PDF system');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(`PDF generation error: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getEligibilityIcon = () => {
    if (!eligibilityCheck) return <InfoIcon color="info" />;
    return eligibilityCheck.eligible ? 
      <CheckIcon color="success" /> : 
      <ErrorIcon color="error" />;
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            <Typography variant="subtitle2">E-Invoice Not Configured</Typography>
            <Typography variant="body2">
              Please configure E-Invoice settings in the Settings page to enable E-Invoice generation.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        E-Invoice Management
      </Typography>

      {/* Eligibility Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {getEligibilityIcon()}
            <Typography variant="subtitle1">
              Eligibility Status
            </Typography>
          </Box>
          
          {eligibilityCheck && (
            <>
              <Chip
                label={eligibilityCheck.eligible ? 'Eligible' : 'Not Eligible'}
                color={eligibilityCheck.eligible ? 'success' : 'error'}
                sx={{ mb: 1 }}
              />
              
              {eligibilityCheck.reasons.length > 0 && (
                <List dense>
                  {eligibilityCheck.reasons.map((reason, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {eligibilityCheck.eligible ? 
                          <CheckIcon color="success" fontSize="small" /> :
                          <WarningIcon color="warning" fontSize="small" />
                        }
                      </ListItemIcon>
                      <ListItemText 
                        primary={reason}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* E-Invoice Status */}
      {metadata ? (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ReceiptIcon color="primary" />
              <Typography variant="subtitle1">E-Invoice Details</Typography>
              <Chip
                label={metadata.status.toUpperCase()}
                color={getStatusColor(metadata.status) as any}
                size="small"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">IRN</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {metadata.irn}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Ack No.</Typography>
                <Typography variant="body1">{metadata.ack_no}</Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Ack Date</Typography>
                <Typography variant="body1">
                  {new Date(metadata.ack_date).toLocaleDateString('en-IN')}
                </Typography>
              </Grid>

              {metadata.status === 'cancelled' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Cancelled Date</Typography>
                    <Typography variant="body1">
                      {metadata.cancelled_at ? 
                        new Date(metadata.cancelled_at).toLocaleDateString('en-IN') : 
                        'N/A'
                      }
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Cancel Reason</Typography>
                    <Typography variant="body1">{metadata.cancel_reason || 'N/A'}</Typography>
                  </Grid>
                </>
              )}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleVerifyEInvoice}
                disabled={loading}
                size="small"
              >
                Verify
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                disabled={loading}
                size="small"
              >
                Download PDF
              </Button>
              
              {metadata.status === 'active' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setShowCancelDialog(true)}
                  disabled={loading}
                  size="small"
                >
                  Cancel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ReceiptIcon color="disabled" />
              <Typography variant="subtitle1">No E-Invoice Generated</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This sale does not have an E-Invoice yet.
            </Typography>

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <ReceiptIcon />}
              onClick={handleGenerateEInvoice}
              disabled={loading || !eligibilityCheck?.eligible}
            >
              {loading ? 'Generating...' : 'Generate E-Invoice'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Cancel E-Invoice</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cancelling an E-Invoice is irreversible. Please provide a reason for cancellation.
          </Alert>
          
          <TextField
            fullWidth
            label="Cancellation Reason"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancelling this E-Invoice..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCancelEInvoice}
            color="error"
            disabled={loading || !cancelReason.trim()}
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
