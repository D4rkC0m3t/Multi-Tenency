import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, differenceInDays, parseISO } from 'date-fns';

interface ProductBatch {
  id: string;
  product_id: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  purchase_price: number;
  current_stock: number;
  reserved_stock: number;
  supplier_id?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    unit?: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  requires_batch_tracking: boolean;
}

export function BatchManagementPage() {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Filters
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New batch dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    product_id: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    purchase_price: '',
    current_stock: '',
    supplier_id: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      fetchData();
    }
  }, [merchant]);

  const fetchData = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const [batchesRes, productsRes, suppliersRes] = await Promise.all([
        supabase
          .from('product_batches')
          .select(`
            *,
            product:products(id, name, sku, unit),
            supplier:suppliers(id, name)
          `)
          .eq('merchant_id', merchant.id)
          .order('expiry_date', { ascending: true }),
        
        supabase
          .from('products')
          .select('id, name, sku, requires_batch_tracking')
          .eq('merchant_id', merchant.id)
          .eq('requires_batch_tracking', true)
          .eq('status', 'active')
          .order('name'),
        
        supabase
          .from('suppliers')
          .select('id, name')
          .eq('merchant_id', merchant.id)
          .eq('is_active', true)
          .order('name')
      ]);

      if (batchesRes.error) throw batchesRes.error;
      if (productsRes.error) throw productsRes.error;
      if (suppliersRes.error) throw suppliersRes.error;

      setBatches(batchesRes.data || []);
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load batch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = useMemo(() => {
    let filtered = [...batches];

    // Filter by product
    if (filterProduct) {
      filtered = filtered.filter(batch => batch.product_id === filterProduct);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const today = new Date();
      filtered = filtered.filter(batch => {
        const expiryDate = parseISO(batch.expiry_date);
        const daysToExpiry = differenceInDays(expiryDate, today);
        
        switch (filterStatus) {
          case 'active':
            return batch.is_active && daysToExpiry > 30;
          case 'expiring':
            return batch.is_active && daysToExpiry <= 30 && daysToExpiry > 0;
          case 'expired':
            return daysToExpiry <= 0;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(batch =>
        batch.batch_number.toLowerCase().includes(query) ||
        batch.product?.name?.toLowerCase().includes(query) ||
        batch.product?.sku?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [batches, filterProduct, filterStatus, searchQuery]);

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

  const handleSaveBatch = async () => {
    if (!merchant) return;
    
    // Validation
    if (!newBatch.product_id || !newBatch.batch_number || !newBatch.expiry_date || !newBatch.current_stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const batchData = {
        merchant_id: merchant.id,
        product_id: newBatch.product_id,
        batch_number: newBatch.batch_number,
        manufacturing_date: newBatch.manufacturing_date || null,
        expiry_date: newBatch.expiry_date,
        purchase_price: parseFloat(newBatch.purchase_price) || 0,
        current_stock: parseFloat(newBatch.current_stock),
        supplier_id: newBatch.supplier_id || null,
        notes: newBatch.notes || null,
      };

      const { error } = await supabase
        .from('product_batches')
        .insert([batchData]);

      if (error) throw error;

      toast.success('Batch created successfully');
      setDialogOpen(false);
      setNewBatch({
        product_id: '',
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        purchase_price: '',
        current_stock: '',
        supplier_id: '',
        notes: '',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error saving batch:', error);
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const header = ['Batch Number', 'Product', 'SKU', 'Expiry Date', 'Days to Expiry', 'Current Stock', 'Reserved', 'Available', 'Status'];
    const lines = filteredBatches.map(batch => {
      const expiryStatus = getExpiryStatus(batch.expiry_date);
      return [
        batch.batch_number,
        batch.product?.name || '',
        batch.product?.sku || '',
        format(parseISO(batch.expiry_date), 'yyyy-MM-dd'),
        expiryStatus.days.toString(),
        batch.current_stock.toString(),
        batch.reserved_stock.toString(),
        (batch.current_stock - batch.reserved_stock).toString(),
        expiryStatus.status
      ];
    });
    
    const csv = [header, ...lines]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch_inventory.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const expiredCount = batches.filter(b => getExpiryStatus(b.expiry_date).status === 'expired').length;
  const expiringCount = batches.filter(b => ['critical', 'warning'].includes(getExpiryStatus(b.expiry_date).status)).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Batch Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Track fertilizer batches, expiry dates, and stock levels
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Batch
          </Button>
          <IconButton onClick={exportCsv} color="primary"><DownloadIcon /></IconButton>
          <IconButton onClick={fetchData} color="primary"><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {/* Alert Summary */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {expiredCount > 0 && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {expiredCount} batch{expiredCount > 1 ? 'es have' : ' has'} expired
            </Alert>
          )}
          {expiringCount > 0 && (
            <Alert severity="warning" icon={<WarningIcon />}>
              {expiringCount} batch{expiringCount > 1 ? 'es are' : ' is'} expiring soon (within 30 days)
            </Alert>
          )}
        </Stack>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Product</InputLabel>
              <Select
                value={filterProduct}
                label="Product"
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <MenuItem value="">All Products</MenuItem>
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} {product.sku && `(${product.sku})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <MenuItem value="all">All Batches</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expiring">Expiring Soon</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Batch Number / Product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Batches Table */}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Batch Number</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Reserved</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Supplier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBatches.map((batch) => {
              const expiryStatus = getExpiryStatus(batch.expiry_date);
              const availableStock = batch.current_stock - batch.reserved_stock;
              
              return (
                <TableRow key={batch.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {batch.batch_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2">{batch.product?.name}</Typography>
                      {batch.product?.sku && (
                        <Typography variant="caption" color="text.secondary">
                          {batch.product.sku}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2">
                        {format(parseISO(batch.expiry_date), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {expiryStatus.days > 0 ? `${expiryStatus.days} days left` : `${Math.abs(expiryStatus.days)} days ago`}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{batch.current_stock}</TableCell>
                  <TableCell align="right">{batch.reserved_stock}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color={availableStock <= 0 ? 'error.main' : 'inherit'}>
                      {availableStock}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={expiryStatus.status}
                      color={expiryStatus.color}
                      variant={expiryStatus.status === 'good' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell>{batch.supplier?.name || '—'}</TableCell>
                </TableRow>
              );
            })}
            {!loading && filteredBatches.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No batches found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* New Batch Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Batch</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Product</InputLabel>
                <Select
                  value={newBatch.product_id}
                  label="Product"
                  onChange={(e) => setNewBatch(prev => ({ ...prev, product_id: e.target.value }))}
                >
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} {product.sku && `(${product.sku})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Batch Number"
                value={newBatch.batch_number}
                onChange={(e) => setNewBatch(prev => ({ ...prev, batch_number: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Manufacturing Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newBatch.manufacturing_date}
                onChange={(e) => setNewBatch(prev => ({ ...prev, manufacturing_date: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Expiry Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newBatch.expiry_date}
                onChange={(e) => setNewBatch(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Current Stock"
                type="number"
                value={newBatch.current_stock}
                onChange={(e) => setNewBatch(prev => ({ ...prev, current_stock: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={newBatch.purchase_price}
                onChange={(e) => setNewBatch(prev => ({ ...prev, purchase_price: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={newBatch.supplier_id}
                  label="Supplier"
                  onChange={(e) => setNewBatch(prev => ({ ...prev, supplier_id: e.target.value }))}
                >
                  <MenuItem value="">None</MenuItem>
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={newBatch.notes}
                onChange={(e) => setNewBatch(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveBatch} disabled={saving}>
            Create Batch
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
