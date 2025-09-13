import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Box,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface ProductBatch {
  id: string;
  batch_number: string;
  expiry_date: string;
  current_stock: number;
  reserved_stock: number;
  manufacturing_date?: string;
  supplier?: {
    name: string;
  } | null;
}

interface BatchSelection {
  batch_id: string;
  quantity: number;
}

interface BatchSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  requestedQuantity: number;
  onConfirm: (selections: BatchSelection[]) => void;
}

export function BatchSelectionDialog({
  open,
  onClose,
  productId,
  productName,
  requestedQuantity,
  onConfirm,
}: BatchSelectionDialogProps) {
  const { merchant } = useAuth();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [selections, setSelections] = useState<BatchSelection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && productId && merchant) {
      fetchBatches();
    }
  }, [open, productId, merchant]);

  useEffect(() => {
    if (batches.length > 0) {
      autoAllocateBatches();
    }
  }, [batches, requestedQuantity]);

  const fetchBatches = async () => {
    if (!merchant || !productId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_batches')
        .select(`
          id,
          batch_number,
          expiry_date,
          current_stock,
          reserved_stock,
          manufacturing_date,
          suppliers!inner(name)
        `)
        .eq('merchant_id', merchant.id)
        .eq('product_id', productId)
        .eq('is_active', true)
        .gt('current_stock', 0)
        .order('expiry_date', { ascending: true }); // FEFO order

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((batch: any) => ({
        ...batch,
        supplier: batch.suppliers ? { name: batch.suppliers.name } : null
      }));
      
      setBatches(transformedData);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load product batches');
    } finally {
      setLoading(false);
    }
  };

  const autoAllocateBatches = () => {
    let remainingQuantity = requestedQuantity;
    const newSelections: BatchSelection[] = [];

    // Auto-allocate using FEFO (First Expired, First Out)
    for (const batch of batches) {
      if (remainingQuantity <= 0) break;
      
      const availableStock = batch.current_stock - batch.reserved_stock;
      if (availableStock <= 0) continue;

      const allocateQuantity = Math.min(remainingQuantity, availableStock);
      newSelections.push({
        batch_id: batch.id,
        quantity: allocateQuantity,
      });
      
      remainingQuantity -= allocateQuantity;
    }

    setSelections(newSelections);
  };

  const updateSelection = (batchId: string, quantity: number) => {
    setSelections(prev => {
      const existing = prev.find(s => s.batch_id === batchId);
      if (existing) {
        if (quantity <= 0) {
          return prev.filter(s => s.batch_id !== batchId);
        }
        return prev.map(s => 
          s.batch_id === batchId ? { ...s, quantity } : s
        );
      } else if (quantity > 0) {
        return [...prev, { batch_id: batchId, quantity }];
      }
      return prev;
    });
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysToExpiry = differenceInDays(expiry, today);

    if (daysToExpiry <= 0) {
      return { status: 'expired', color: 'error' as const, days: daysToExpiry };
    } else if (daysToExpiry <= 7) {
      return { status: 'critical', color: 'error' as const, days: daysToExpiry };
    } else if (daysToExpiry <= 30) {
      return { status: 'warning', color: 'warning' as const, days: daysToExpiry };
    } else {
      return { status: 'good', color: 'success' as const, days: daysToExpiry };
    }
  };

  const totalSelected = selections.reduce((sum, s) => sum + s.quantity, 0);
  const isValidSelection = totalSelected === requestedQuantity;

  const handleConfirm = () => {
    if (!isValidSelection) {
      toast.error(`Please select exactly ${requestedQuantity} units`);
      return;
    }
    onConfirm(selections);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack>
          <Typography variant="h6">Select Batches</Typography>
          <Typography variant="body2" color="text.secondary">
            {productName} - Requested: {requestedQuantity} units
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Selection Summary */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="body2">
              Selected: <strong>{totalSelected}</strong> / {requestedQuantity} units
            </Typography>
            {!isValidSelection && (
              <Typography variant="body2" color="error">
                {totalSelected < requestedQuantity 
                  ? `Need ${requestedQuantity - totalSelected} more units`
                  : `${totalSelected - requestedQuantity} units over requested amount`
                }
              </Typography>
            )}
          </Box>

          {/* Batches Table */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography>Loading batches...</Typography>
            </Box>
          ) : batches.length === 0 ? (
            <Alert severity="warning">
              No available batches found for this product
            </Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch Number</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Select Qty</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((batch) => {
                  const expiryStatus = getExpiryStatus(batch.expiry_date);
                  const availableStock = batch.current_stock - batch.reserved_stock;
                  const selectedQuantity = selections.find(s => s.batch_id === batch.id)?.quantity || 0;
                  
                  return (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {batch.batch_number}
                        </Typography>
                        {batch.supplier && (
                          <Typography variant="caption" color="text.secondary">
                            {batch.supplier.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">
                            {format(parseISO(batch.expiry_date), 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {expiryStatus.days > 0 
                              ? `${expiryStatus.days} days left` 
                              : `${Math.abs(expiryStatus.days)} days ago`
                            }
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {availableStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={selectedQuantity}
                          onChange={(e) => updateSelection(batch.id, parseInt(e.target.value) || 0)}
                          inputProps={{
                            min: 0,
                            max: availableStock,
                            style: { width: '80px', textAlign: 'right' }
                          }}
                          disabled={availableStock <= 0}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={expiryStatus.status}
                            color={expiryStatus.color}
                            variant={expiryStatus.status === 'good' ? 'outlined' : 'filled'}
                          />
                          {expiryStatus.status === 'expired' && <ErrorIcon color="error" fontSize="small" />}
                          {expiryStatus.status === 'critical' && <WarningIcon color="error" fontSize="small" />}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Warnings */}
          {selections.some(s => {
            const batch = batches.find(b => b.id === s.batch_id);
            return batch && getExpiryStatus(batch.expiry_date).status !== 'good';
          }) && (
            <Alert severity="warning" icon={<WarningIcon />}>
              Some selected batches are expiring soon or have expired. Please verify before proceeding.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={!isValidSelection || loading}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
}
