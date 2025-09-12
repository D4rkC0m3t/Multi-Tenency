import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Button, Grid, MenuItem, IconButton, Typography, Paper, Autocomplete } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import type { PurchaseOrder, POItem } from './PurchaseOrdersPage';

interface Props { po: PurchaseOrder | null; onClose: () => void; onSaved: () => void; }

export function PurchaseOrderForm({ po, onClose, onSaved }: Props) {
  const { merchant, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [supplierId, setSupplierId] = useState<string>(po?.supplier_id || '');
  const [expectedDate, setExpectedDate] = useState<string>(po?.expected_date || '');
  const [notes, setNotes] = useState<string>(po?.notes || '');
  const [items, setItems] = useState<POItem[]>(() => (po?.purchase_order_items || []).map(i => ({ ...i, quantity: Number(i.quantity||0), unit_price: Number(i.unit_price||0), total_price: Number(i.total_price||0) })));
  const [suppliers, setSuppliers] = useState<{ id:string; name:string }[]>([]);
  const [products, setProducts] = useState<{ id:string; name:string; sku?:string|null; cost_price?:number|null }[]>([]);
  const isEdit = Boolean(po?.id);

  useEffect(() => { (async () => {
    if (!merchant) return;
    const { data: sup, error: sErr } = await supabase.from('suppliers').select('id,name').eq('merchant_id', merchant.id).order('name');
    if (!sErr) setSuppliers((sup as any)||[]);
    const { data: prods, error: pErr } = await supabase.from('products').select('id,name,sku,cost_price').eq('merchant_id', merchant.id).order('name');
    if (!pErr) setProducts((prods as any)||[]);
  })(); }, [merchant]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, x) => s + Number(x.quantity||0) * Number(x.unit_price||0), 0);
    const tax = 0; // extend later
    const discount = 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  }, [items]);

  const addRow = () => setItems(prev => [...prev, { product_id: '', description: '', quantity: 1, unit_price: 0 } as any]);
  const updateItem = (idx:number, patch:Partial<POItem>) => setItems(prev => prev.map((it,i)=> i===idx ? { ...it, ...patch } : it));
  const removeItem = (idx:number) => setItems(prev => prev.filter((_,i)=> i!==idx));

  const save = async () => {
    if (!merchant) return;
    if (!supplierId) { toast.error('Select a supplier'); return; }
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    try {
      setSaving(true);
      const poPayload:any = {
        merchant_id: merchant.id,
        supplier_id: supplierId,
        status: po?.status || 'draft',
        expected_date: expectedDate || null,
        notes: notes || null,
        subtotal: totals.subtotal,
        tax_amount: totals.tax,
        discount_amount: totals.discount,
        total_amount: totals.total,
        updated_at: new Date().toISOString(),
      };
      let poId = po?.id;
      if (isEdit) {
        const { error } = await supabase.from('purchase_orders').update(poPayload).eq('id', poId!);
        if (error) throw error;
        // simple strategy: delete & re-insert items
        await supabase.from('purchase_order_items').delete().eq('purchase_order_id', poId!);
      } else {
        poPayload.created_by = profile?.id || null;
        poPayload.created_at = new Date().toISOString();
        poPayload.po_number = `PO-${Date.now()}`;
        const { data, error } = await supabase.from('purchase_orders').insert([poPayload]).select('id').single();
        if (error) throw error;
        poId = (data as any).id;
      }
      const rows = items.map(it => ({
        merchant_id: merchant.id,
        purchase_order_id: poId,
        product_id: it.product_id,
        description: it.description || null,
        quantity: Number(it.quantity||0),
        unit_price: Number(it.unit_price||0),
        tax_rate: Number(it.tax_rate||0),
        total_price: Number(it.quantity||0) * Number(it.unit_price||0),
      }));
      if (rows.length) {
        const { error } = await supabase.from('purchase_order_items').insert(rows as any);
        if (error) throw error;
      }
      toast.success(isEdit ? 'PO updated' : 'PO created');
      onSaved();
    } catch (e:any) {
      toast.error(e.message || 'Failed to save PO');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onClose={()=>!saving && onClose()} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Supplier" value={supplierId} onChange={(e)=>setSupplierId(e.target.value)}>
                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth type="date" label="Expected Date" InputLabelProps={{shrink:true}} value={expectedDate} onChange={(e)=>setExpectedDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p:2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Items</Typography>
                <Button startIcon={<AddIcon />} onClick={addRow}>Add Item</Button>
              </Stack>
              {items.map((it, idx) => (
                <Grid container spacing={1} alignItems="center" key={idx}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(o)=> o ? `${o.name}${o.sku ? ` (${o.sku})` : ''}` : ''}
                      value={products.find(p=>p.id===it.product_id) || null}
                      onChange={(_, val)=> {
                        updateItem(idx,{ product_id: val?.id || '' });
                        if (val && (val.cost_price ?? null) !== null) {
                          updateItem(idx,{ unit_price: Number(val.cost_price||0) });
                        }
                      }}
                      renderInput={(params)=> <TextField {...params} label="Product" placeholder="Type to search" fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth label="Description" value={it.description||''} onChange={(e)=>updateItem(idx,{ description: e.target.value })} />
                  </Grid>
                  <Grid item xs={6} md={1.5}>
                    <TextField fullWidth type="number" label="Qty" value={it.quantity} onChange={(e)=>updateItem(idx,{ quantity: Number(e.target.value) })} />
                  </Grid>
                  <Grid item xs={6} md={1.5}>
                    <TextField fullWidth type="number" label="Unit Price" value={it.unit_price} onChange={(e)=>updateItem(idx,{ unit_price: Number(e.target.value) })} />
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    <TextField fullWidth type="number" label="Tax %" value={it.tax_rate||0} onChange={(e)=>updateItem(idx,{ tax_rate: Number(e.target.value) })} />
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    <TextField fullWidth label="Line Total" value={(Number(it.quantity||0)*Number(it.unit_price||0)).toFixed(2)} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton color="error" onClick={()=>removeItem(idx)}><DeleteIcon /></IconButton>
                  </Grid>
                </Grid>
              ))}
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Typography variant="caption">Subtotal: ₹{totals.subtotal.toFixed(2)}</Typography>
                <Typography variant="caption">Total: ₹{totals.total.toFixed(2)}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
