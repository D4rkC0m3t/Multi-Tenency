import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface MovementRow {
  id: string;
  created_at: string;
  merchant_id: string;
  product_id: string;
  transaction_type: 'sale' | 'purchase' | 'adjustment';
  transaction_id: string;
  quantity_change: number;
  product?: { id: string; name: string; sku?: string | null; unit?: string | null };
}

export function StockMovementsPage() {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sku?: string | null }[]>([]);

  const [qType, setQType] = useState<'all' | 'sale' | 'purchase' | 'adjustment'>('all');
  const [qStart, setQStart] = useState<string>('');
  const [qEnd, setQEnd] = useState<string>('');
  const [qProduct, setQProduct] = useState<string>('');

  useEffect(() => {
    if (merchant) {
      fetchMovements();
      fetchProductsLite();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchMovements = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('id, created_at, merchant_id, product_id, transaction_type, transaction_id, quantity_change, product:products(id, name, sku, unit)')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      setRows((data as any) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...rows];
    if (qType !== 'all') list = list.filter(r => r.transaction_type === qType);
    if (qStart) list = list.filter(r => new Date(r.created_at) >= new Date(qStart));
    if (qEnd) list = list.filter(r => new Date(r.created_at) <= new Date(qEnd));
    if (qProduct.trim()) {
      const q = qProduct.toLowerCase();
      list = list.filter(r => (r.product?.name || '').toLowerCase().includes(q) || (r.product?.sku || '').toLowerCase().includes(q));
    }
    return list;
  }, [rows, qType, qStart, qEnd, qProduct]);

  const fetchProductsLite = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('merchant_id', merchant.id)
        .order('name');
      if (error) throw error;
      setProducts((data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Adjustment dialog state
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjProduct, setAdjProduct] = useState<string>('');
  const [adjQty, setAdjQty] = useState<string>('');

  const [savingAdj, setSavingAdj] = useState(false);

  const saveAdjustment = async () => {
    if (!merchant) return;
    if (!adjProduct) { toast.error('Select a product'); return; }
    const qty = Number(adjQty);
    if (!Number.isFinite(qty) || qty === 0) { toast.error('Enter a non-zero quantity (positive or negative)'); return; }
    try {
      setSavingAdj(true);
      const payload: any = {
        merchant_id: merchant.id,
        product_id: adjProduct,
        transaction_type: 'adjustment',
        transaction_id: crypto.randomUUID(), // Generate unique ID for manual adjustment
        quantity_change: qty,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('stock_movements').insert([payload]);
      if (error) throw error;
      toast.success('Adjustment recorded');
      setAdjOpen(false);
      setAdjProduct('');
      setAdjQty('');

      fetchMovements();
    } catch (e: any) {
      console.error('Adjustment save failed:', e);
      toast.error(e.message || 'Failed to save adjustment');
    } finally {
      setSavingAdj(false);
    }
  };

  const exportCsv = () => {
    const header = ['Date', 'Product', 'SKU', 'Type', 'Qty Change', 'Ref ID'];
    const lines = filtered.map(r => [
      new Date(r.created_at).toLocaleString(),
      r.product?.name || '',
      r.product?.sku || '',
      r.transaction_type,
      r.quantity_change,
      r.transaction_id || ''
    ]);
    const csv = [header, ...lines].map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock_movements.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Stock Movements</Typography>
          <Typography variant="body2" color="text.secondary">Track all inventory changes across sales, purchases, and adjustments</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={() => setAdjOpen(true)}>New Adjustment</Button>
          <IconButton onClick={exportCsv} color="primary" aria-label="Export CSV"><DownloadIcon /></IconButton>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select label="Type" size="small" fullWidth value={qType} onChange={(e)=>setQType(e.target.value as any)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="adjustment">Adjustment</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label="Start" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={qStart} onChange={(e)=>setQStart(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label="End" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={qEnd} onChange={(e)=>setQEnd(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Product / SKU" size="small" fullWidth value={qProduct} onChange={(e)=>setQProduct(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" onClick={fetchMovements}>Refresh</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Qty Change</TableCell>
              <TableCell>Reference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                <TableCell>{r.product?.name || r.product_id}</TableCell>
                <TableCell>{r.product?.sku || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.transaction_type} color={r.transaction_type === 'sale' ? 'error' : r.transaction_type === 'purchase' ? 'success' : 'default'} variant={r.transaction_type === 'adjustment' ? 'outlined' : 'filled'} />
                </TableCell>
                <TableCell align="right" style={{ color: r.quantity_change < 0 ? '#b91c1c' : '#15803d' }}>{r.quantity_change}</TableCell>
                <TableCell>{r.transaction_id || '—'}</TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No movements found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={adjOpen} onClose={() => !savingAdj && setAdjOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Inventory Adjustment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="adj-product-label">Product</InputLabel>
              <Select
                labelId="adj-product-label"
                label="Product"
                value={adjProduct}
                onChange={(e)=>setAdjProduct(e.target.value)}
              >
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quantity Change"
              type="number"
              helperText="Use positive to increase stock, negative to decrease"
              value={adjQty}
              onChange={(e)=>setAdjQty(e.target.value)}
              fullWidth
            />

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setAdjOpen(false)} disabled={savingAdj}>Cancel</Button>
          <Button variant="contained" onClick={saveAdjustment} disabled={savingAdj}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
