import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
  Autocomplete, IconButton, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { supabase, Purchase, Supplier, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PurchaseFormProps {
  purchase?: Purchase | null;
  onClose: () => void;
  onSave: () => void;
}

interface PurchaseFormData {
  supplier_id: string | null;
  invoice_number: string;
  purchase_date: string;
  payment_method: 'cash' | 'credit' | 'upi' | 'bank_transfer';
  payment_status: 'paid' | 'unpaid' | 'partial';
  notes?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  purchase_items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    batch_number?: string;
    expiry_date?: string;
    total_price: number;
  }[];
}

export function PurchaseForm({ purchase, onClose, onSave }: PurchaseFormProps) {
  const { merchant, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    defaultValues: purchase ? {
      supplier_id: purchase.supplier_id || null,
      invoice_number: purchase.invoice_number || '',
      purchase_date: (purchase.purchase_date || '').split('T')[0],
      payment_method: (['cash','credit','upi','bank_transfer'] as const).includes((purchase.payment_method as any))
        ? (purchase.payment_method as 'cash'|'credit'|'upi'|'bank_transfer')
        : 'cash',
      payment_status: (['paid','unpaid','partial'] as const).includes((purchase.payment_status as any))
        ? (purchase.payment_status as 'paid'|'unpaid'|'partial')
        : 'paid',
      notes: purchase.notes || '',
      subtotal: Number(purchase.subtotal || 0),
      tax_amount: Number(purchase.tax_amount || 0),
      discount_amount: Number(purchase.discount_amount || 0),
      total_amount: Number(purchase.total_amount || 0),
      purchase_items: (purchase.purchase_items || []).map((it: any) => ({
        product_id: it.product_id,
        quantity: Number(it.quantity || 0),
        unit_price: Number(it.unit_price || 0),
        batch_number: it.batch_number || '',
        expiry_date: it.expiry_date ? it.expiry_date.split('T')[0] : '',
        total_price: Number(it.total_price || 0),
      })),
    } : {
      purchase_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      payment_status: 'paid',
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      purchase_items: [],
      supplier_id: null,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchase_items',
  });

  const purchaseItems = watch('purchase_items');
  const discountAmount = watch('discount_amount');
  const taxAmount = watch('tax_amount');

  const calculateTotals = useCallback(() => {
    const subtotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unit_price || 0), 0);
    const total = subtotal + (Number(taxAmount) || 0) - (Number(discountAmount) || 0);
    setValue('subtotal', subtotal);
    setValue('total_amount', total);
  }, [purchaseItems, discountAmount, taxAmount, setValue]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  useEffect(() => {
    if (!merchant) return;
    
    const fetchInitialData = async () => {
      const [suppliersRes, productsRes] = await Promise.all([
        supabase.from('suppliers').select('*').eq('merchant_id', merchant.id).eq('is_active', true),
        supabase.from('products').select('*').eq('merchant_id', merchant.id).eq('status', 'active'),
      ]);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    };
    fetchInitialData();
  }, [merchant]);

  const onSubmit: SubmitHandler<PurchaseFormData> = async (data) => {
    if (!merchant || !profile) return;
    if (data.purchase_items.length === 0) {
      toast.error('Please add at least one product to the purchase.');
      return;
    }

    setLoading(true);
    try {
      const purchaseData = {
        merchant_id: merchant.id,
        supplier_id: data.supplier_id,
        invoice_number: data.invoice_number,
        purchase_date: data.purchase_date,
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        notes: data.notes,
        subtotal: data.subtotal,
        tax_amount: Number(data.tax_amount) || 0,
        discount_amount: Number(data.discount_amount) || 0,
        total_amount: data.total_amount,
        created_by: profile.id,
        updated_at: new Date().toISOString(),
      };

      if (purchase) {
        // Update flow for purchase
        // 1) Revert stock increases from existing purchase_items
        const { data: oldItems, error: oldErr } = await supabase
          .from('purchase_items')
          .select('product_id, quantity')
          .eq('purchase_id', purchase.id);
        if (oldErr) throw oldErr;

        for (const it of oldItems || []) {
          const { data: prod, error: prodErr } = await supabase
            .from('products')
            .select('current_stock')
            .eq('id', it.product_id)
            .single();
          if (prodErr) throw prodErr;
          const newStock = Math.max(0, Number((prod as any)?.current_stock || 0) - Number(it.quantity || 0));
          const { error: updErr } = await supabase
            .from('products')
            .update({ current_stock: newStock, updated_at: new Date().toISOString() })
            .eq('id', it.product_id);
          if (updErr) throw updErr;
        }

        // 2) Delete existing purchase_items
        const { error: delItemsErr } = await supabase
          .from('purchase_items')
          .delete()
          .eq('purchase_id', purchase.id);
        if (delItemsErr) throw delItemsErr;

        // 3) Update purchase header
        const { error: updHeaderErr } = await supabase
          .from('purchases')
          .update(purchaseData)
          .eq('id', purchase.id);
        if (updHeaderErr) throw updHeaderErr;

        // 4) Insert new items (DB triggers will add stock)
        const itemsToInsert = data.purchase_items.map(item => ({
          purchase_id: purchase.id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
          batch_number: item.batch_number,
          expiry_date: item.expiry_date || null,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;

        toast.success('Purchase updated successfully! Stock has been adjusted.');
        onSave();
      } else {
        // Create flow remains the same
        const { data: newPurchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({ ...purchaseData, created_at: new Date().toISOString() })
          .select()
          .single();
        
        if (purchaseError) throw purchaseError;

        const itemsToInsert = data.purchase_items.map(item => ({
          purchase_id: newPurchase.id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
          batch_number: item.batch_number,
          expiry_date: item.expiry_date || null,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast.success('Purchase created successfully! Stock has been updated.');
        onSave();
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to save purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>{purchase ? 'Edit Purchase' : 'Add New Purchase'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="supplier_id"
                control={control}
                rules={{ required: 'Supplier is required' }}
                render={({ field }) => (
                  <Autocomplete
                    options={suppliers}
                    getOptionLabel={(option) => option.name}
                    value={suppliers.find(s => s.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                    renderInput={(params) => <TextField {...params} label="Supplier" error={!!errors.supplier_id} helperText={errors.supplier_id?.message} />}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField {...register('invoice_number', { required: 'Invoice # is required' })} label="Invoice #" fullWidth error={!!errors.invoice_number} helperText={errors.invoice_number?.message} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField {...register('purchase_date', { required: true })} type="date" label="Purchase Date" fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 1, mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{width: '35%'}}>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Batch #</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`purchase_items.${index}.product_id`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.name}
                            value={products.find(p => p.id === value) || null}
                            onChange={(_, newValue) => {
                              onChange(newValue?.id || '');
                              setValue(`purchase_items.${index}.unit_price`, newValue?.cost_price || 0);
                            }}
                            renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Product" />}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell><TextField {...register(`purchase_items.${index}.quantity`, { required: true, valueAsNumber: true, min: 1 })} type="number" variant="standard" sx={{width: '80px'}} /></TableCell>
                    <TableCell><TextField {...register(`purchase_items.${index}.unit_price`, { required: true, valueAsNumber: true, min: 0 })} type="number" variant="standard" /></TableCell>
                    <TableCell><TextField {...register(`purchase_items.${index}.batch_number`)} type="text" variant="standard" /></TableCell>
                    <TableCell><TextField {...register(`purchase_items.${index}.expiry_date`)} type="date" variant="standard" InputLabelProps={{ shrink: true }} /></TableCell>
                    <TableCell>₹{(watch(`purchase_items.${index}.quantity`) * watch(`purchase_items.${index}.unit_price`) || 0).toFixed(2)}</TableCell>
                    <TableCell align="right"><IconButton onClick={() => remove(index)} color="error"><Delete /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Button startIcon={<Add />} onClick={() => append({ product_id: '', quantity: 1, unit_price: 0, total_price: 0, batch_number: '', expiry_date: '' })} sx={{ mt: 1 }}>
            Add Item
          </Button>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField {...register('payment_method')} select label="Payment Method" fullWidth SelectProps={{ native: true }}>
                    <option value="cash">Cash</option><option value="credit">Credit</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField {...register('payment_status')} select label="Payment Status" fullWidth SelectProps={{ native: true }}>
                    <option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="partial">Partial</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField {...register('notes')} label="Notes" multiline rows={3} fullWidth />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Box sx={{ width: '100%', maxWidth: 300 }}>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>Subtotal: <span>₹{watch('subtotal').toFixed(2)}</span></Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography>Discount:</Typography>
                    <TextField {...register('discount_amount', { valueAsNumber: true })} type="number" size="small" sx={{ width: 120 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography>Tax:</Typography>
                    <TextField {...register('tax_amount', { valueAsNumber: true })} type="number" size="small" sx={{ width: 120 }} />
                  </Box>
                  <Typography variant="h5" sx={{ display: 'flex', justifyContent: 'space-between', borderTop: 1, pt: 1, borderColor: 'divider' }}>
                    Total: <span>₹{watch('total_amount').toFixed(2)}</span>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
