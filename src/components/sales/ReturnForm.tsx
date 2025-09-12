import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox } from '@mui/material';
import { supabase, Sale, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReturnFormProps {
  sale: Sale;
  onClose: () => void;
  onSave: () => void;
}

interface ReturnLine {
  product_id: string;
  product_name?: string;
  unit_price: number;
  original_qty: number;
  return_qty: number;
  selected: boolean;
}

export function ReturnForm({ sale, onClose, onSave }: ReturnFormProps) {
  const { merchant, profile } = useAuth();
  const [lines, setLines] = useState<ReturnLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [processing, setProcessing] = useState(false);
  const [refundMode, setRefundMode] = useState<'refund' | 'credit'>('refund');

  useEffect(() => {
    // Prepare lines from sale_items
    const prepared: ReturnLine[] = (sale.sale_items || []).map((si: any) => ({
      product_id: si.product_id,
      product_name: si.product?.name || si.product_name,
      unit_price: Number(si.unit_price || 0),
      original_qty: Math.abs(Number(si.quantity || 0)),
      return_qty: 0,
      selected: false,
    }));
    setLines(prepared);
  }, [sale]);

  useEffect(() => {
    if (!merchant) return;
    supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchant.id)
      .then(({ data }) => setProducts(data || []));
  }, [merchant]);

  const totalReturn = useMemo(() => {
    return lines
      .filter(l => l.selected && l.return_qty > 0)
      .reduce((s, l) => s + l.return_qty * l.unit_price, 0);
  }, [lines]);

  const updateLine = (idx: number, patch: Partial<ReturnLine>) => {
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const submitReturn = async () => {
    if (!merchant || !profile) return;
    const selected = lines.filter(l => l.selected && l.return_qty > 0);
    if (selected.length === 0) {
      toast.error('Select at least one item to return');
      return;
    }

    // Validate max qty
    for (const l of selected) {
      if (l.return_qty > l.original_qty) {
        toast.error(`Return qty cannot exceed original for ${l.product_name || l.product_id}`);
        return;
      }
    }

    setProcessing(true);
    try {
      const now = new Date();
      const subtotal = selected.reduce((s, l) => s + l.return_qty * l.unit_price, 0);

      // Create a negative sale entry to represent return
      const salePayload: any = {
        merchant_id: merchant.id,
        customer_id: (sale as any).customer_id || null,
        invoice_number: `${sale.invoice_number || 'INV'}-RET-${Date.now()}`,
        sale_date: now.toISOString(),
        payment_method: refundMode === 'refund' ? 'refund' : 'credit',
        payment_status: refundMode === 'refund' ? 'paid' : 'unpaid',
        notes: `RETURN_OF:${sale.invoice_number || sale.id}`,
        subtotal: -subtotal,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: -subtotal,
        created_by: profile.id,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      const { data: retSale, error: retErr } = await supabase
        .from('sales')
        .insert(salePayload)
        .select('id')
        .single();
      if (retErr) throw retErr;

      // Insert return items with negative quantities
      const itemsRows = selected.map(l => ({
        sale_id: retSale.id,
        product_id: l.product_id,
        quantity: -Number(l.return_qty),
        unit_price: Number(l.unit_price),
        total_price: -Number(l.return_qty) * Number(l.unit_price),
        created_at: now.toISOString(),
      }));
      const { error: itemsErr } = await supabase.from('sale_items').insert(itemsRows);
      if (itemsErr) throw itemsErr;

      // Increment stock for returned quantities
      for (const l of selected) {
        const prod = products.find(p => p.id === l.product_id);
        if (!prod) continue;
        const newStock = Number(prod.current_stock || 0) + Number(l.return_qty);
        const { error: updErr } = await supabase
          .from('products')
          .update({ current_stock: newStock, updated_at: now.toISOString() })
          .eq('id', l.product_id);
        if (updErr) throw updErr;
      }

      toast.success('Return recorded and stock updated');
      onSave();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create return');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>Create Return</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>Original Invoice: {sale.invoice_number} • Date: {new Date(sale.sale_date).toLocaleDateString()}</Typography>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Orig. Qty</TableCell>
                <TableCell align="right">Return Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((l, i) => (
                <TableRow key={l.product_id + i}>
                  <TableCell><Checkbox checked={l.selected} onChange={(e)=>updateLine(i,{selected:e.target.checked})} /></TableCell>
                  <TableCell>{l.product_name || l.product_id}</TableCell>
                  <TableCell align="right">{l.original_qty}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={l.return_qty}
                      onChange={(e)=>updateLine(i,{return_qty: Math.max(0, Math.min(Number(e.target.value||0), l.original_qty))})}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">₹{l.unit_price.toFixed(2)}</TableCell>
                  <TableCell align="right">₹{(l.return_qty * l.unit_price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Settlement"
              size="small"
              fullWidth
              value={refundMode}
              onChange={(e)=>setRefundMode(e.target.value as any)}
            >
              <option value="refund">Refund to customer</option>
              <option value="credit">Add to customer credit</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" textAlign="right">Refund Total: ₹{totalReturn.toFixed(2)}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submitReturn} variant="contained" disabled={processing}> {processing ? 'Processing…' : 'Create Return'} </Button>
      </DialogActions>
    </Dialog>
  );
}
