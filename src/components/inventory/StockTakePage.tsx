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
} from '@mui/material';
import { Refresh as RefreshIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface LiteProduct {
  id: string;
  name: string;
  sku?: string | null;
  unit?: string | null;
  current_stock: number;
}

export function StockTakePage() {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<LiteProduct[]>([]);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchProducts = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, unit, current_stock')
        .eq('merchant_id', merchant.id)
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      setProducts((data as any) || []);
      setCounts({});
    } catch (e) {
      console.error(e);
      toast.error('Failed to load products for stock take');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
  }, [products, query]);

  const withVariance = filtered.map(p => {
    const entered = counts[p.id] ?? '';
    const counted = entered === '' ? null : Number(entered);
    const delta = counted === null || !Number.isFinite(counted) ? 0 : counted - Number(p.current_stock || 0);
    return { ...p, counted, delta };
  });

  const exportCsv = () => {
    const header = ['Product', 'SKU', 'System Qty', 'Counted Qty', 'Delta'];
    const lines = withVariance.map(r => [r.name, r.sku || '', r.current_stock, r.counted ?? '', r.delta]);
    const csv = [header, ...lines].map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock_take.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const postAdjustments = async () => {
    if (!merchant) return;
    const deltas = withVariance.filter(r => Number(r.delta) !== 0);
    if (deltas.length === 0) {
      toast('Nothing to adjust');
      return;
    }
    try {
      setSaving(true);
      const rows = deltas.map(r => ({
        merchant_id: merchant.id,
        product_id: r.id,
        transaction_type: 'adjustment',
        transaction_id: null,
        quantity_change: r.delta,
        note: 'Stock take adjustment',
        created_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('stock_movements').insert(rows as any);
      if (error) throw error;
      toast.success('Stock take posted');
      setCounts({});
      fetchProducts();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to post adjustments');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Stock Take</Typography>
          <Typography variant="body2" color="text.secondary">Count inventory and reconcile differences</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={fetchProducts}><RefreshIcon /></IconButton>
          <IconButton onClick={exportCsv}><DownloadIcon /></IconButton>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Product / SKU"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
            <Button variant="contained" onClick={postAdjustments} disabled={saving || loading}>Post Adjustments</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">System Qty</TableCell>
              <TableCell align="right">Counted Qty</TableCell>
              <TableCell align="right">Delta</TableCell>
              <TableCell>Unit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withVariance.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.sku || '—'}</TableCell>
                <TableCell align="right">{Number(r.current_stock || 0)}</TableCell>
                <TableCell align="right" style={{ width: 160 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={counts[r.id] ?? ''}
                    onChange={(e)=> setCounts(prev => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Enter count"
                    fullWidth
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip size="small" label={r.delta} color={r.delta < 0 ? 'error' : r.delta > 0 ? 'success' : 'default'} variant={r.delta === 0 ? 'outlined' : 'filled'} />
                </TableCell>
                <TableCell>{r.unit || '—'}</TableCell>
              </TableRow>
            ))}
            {!loading && withVariance.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No products found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
