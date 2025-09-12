import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
  Autocomplete, IconButton, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, Paper, MenuItem
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { supabase, Sale, Customer, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SaleFormProps {
  sale?: Sale | null;
  onClose: () => void;
  onSave: () => void;
}

interface SaleFormData {
  customer_id: string | null;
  invoice_number: string;
  sale_date: string;
  payment_method: 'cash' | 'credit' | 'upi' | 'bank_transfer';
  payment_status: 'paid' | 'unpaid' | 'partial';
  notes?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  sale_items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export function SaleForm({ sale, onClose, onSave }: SaleFormProps) {
  const { merchant, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discountType, setDiscountType] = useState<'amount'|'percent'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleFormData>({
    defaultValues: sale ? {
      customer_id: sale.customer_id || null,
      invoice_number: sale.invoice_number || '',
      sale_date: (sale.sale_date || '').split('T')[0],
      payment_method: (['cash','credit','upi','bank_transfer'] as const).includes((sale.payment_method as any))
        ? (sale.payment_method as 'cash'|'credit'|'upi'|'bank_transfer')
        : 'cash',
      payment_status: (['paid','unpaid','partial'] as const).includes((sale.payment_status as any))
        ? (sale.payment_status as 'paid'|'unpaid'|'partial')
        : 'paid',
      notes: sale.notes || '',
      subtotal: Number(sale.subtotal || 0),
      tax_amount: Number(sale.tax_amount || 0),
      discount_amount: Number(sale.discount_amount || 0),
      total_amount: Number(sale.total_amount || 0),
      sale_items: (sale.sale_items || []).map((si: any) => ({
        product_id: si.product_id,
        quantity: Number(si.quantity || 0),
        unit_price: Number(si.unit_price || 0),
        total_price: Number(si.total_price || 0),
      })),
    } : {
      sale_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      payment_status: 'paid',
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      sale_items: [],
      customer_id: null,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sale_items',
  });

  const saleItems = watch('sale_items');
  const discountAmount = watch('discount_amount');
  const taxAmount = watch('tax_amount');

  const calculateTotals = useCallback(() => {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity * item.unit_price || 0), 0);
    // derive discount from controls
    const computedDiscount = discountType === 'percent'
      ? Math.min(100, Math.max(0, Number(discountValue || 0))) / 100 * subtotal
      : Math.max(0, Math.min(subtotal, Number(discountValue || 0)));
    const roundedDiscount = Number(computedDiscount.toFixed(2));
    setValue('discount_amount', roundedDiscount);
    const total = subtotal + (Number(taxAmount) || 0) - roundedDiscount;
    setValue('subtotal', subtotal);
    setValue('total_amount', total);
  }, [saleItems, discountType, discountValue, taxAmount, setValue]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  useEffect(() => {
    if (!merchant) return;
    
    const fetchInitialData = async () => {
      const [customersRes, productsRes] = await Promise.all([
        supabase.from('customers').select('*').eq('merchant_id', merchant.id).eq('is_active', true),
        supabase.from('products').select('*').eq('merchant_id', merchant.id).eq('status', 'active'),
      ]);
      if (customersRes.data) setCustomers(customersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    };
    fetchInitialData();
  }, [merchant]);

  const onSubmit: SubmitHandler<SaleFormData> = async (data) => {
    if (!merchant || !profile) return;
    if (data.sale_items.length === 0) {
      toast.error('Please add at least one product to the sale.');
      return;
    }

    for (const item of data.sale_items) {
      const product = products.find(p => p.id === item.product_id);
      if (product && item.quantity > product.current_stock) {
        toast.error(`Not enough stock for ${product.name}. Available: ${product.current_stock}`);
        return;
      }
    }

    setLoading(true);
    try {
      const invoiceNo = data.invoice_number?.trim() || `INV-${Date.now()}`;
      const saleData = {
        merchant_id: merchant.id,
        customer_id: data.customer_id,
        invoice_number: invoiceNo,
        sale_date: new Date(data.sale_date).toISOString(),
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

      if (sale) {
        // Update flow:
        // 1) Revert stock for existing sale_items
        const { data: oldItems, error: oldErr } = await supabase
          .from('sale_items')
          .select('product_id, quantity')
          .eq('sale_id', sale.id);
        if (oldErr) throw oldErr;

        for (const it of oldItems || []) {
          const { data: prod, error: prodErr } = await supabase
            .from('products')
            .select('current_stock')
            .eq('id', it.product_id)
            .single();
          if (prodErr) throw prodErr;
          const newStock = Number((prod as any)?.current_stock || 0) + Number(it.quantity || 0);
          const { error: updErr } = await supabase
            .from('products')
            .update({ current_stock: newStock, updated_at: new Date().toISOString() })
            .eq('id', it.product_id);
          if (updErr) throw updErr;
        }

        // 2) Delete existing sale_items
        const { error: delItemsErr } = await supabase
          .from('sale_items')
          .delete()
          .eq('sale_id', sale.id);
        if (delItemsErr) throw delItemsErr;

        // 3) Update sale header
        const { error: updSaleErr } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', sale.id);
        if (updSaleErr) throw updSaleErr;

        // 4) Insert new items (DB triggers will decrement stock accordingly)
        const itemsToInsert = data.sale_items.map(item => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;

        toast.success('Sale updated successfully! Stock has been adjusted.');
        onSave();
      } else {
        // Create flow
        const { data: newSale, error: saleError } = await supabase
          .from('sales')
          .insert({ ...saleData, created_at: new Date().toISOString() })
          .select()
          .single();
        
        if (saleError) throw saleError;

        const itemsToInsert = data.sale_items.map(item => ({
          sale_id: newSale.id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // Stock adjustments are handled by DB triggers on sale_items insert via stock_movements

        toast.success('Sale created successfully! Stock has been updated.');
        onSave();
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to save sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => option.name}
                    value={customers.find(c => c.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                    renderInput={(params) => <TextField {...params} label="Customer" />}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField {...register('invoice_number', { required: 'Invoice # is required' })} label="Invoice #" fullWidth error={!!errors.invoice_number} helperText={errors.invoice_number?.message} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField {...register('sale_date', { required: true })} type="date" label="Sale Date" fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 1, mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{width: '40%'}}>Product</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const selectedProductId = watch(`sale_items.${index}.product_id`);
                  const selectedProduct = products.find(p => p.id === selectedProductId);
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Controller
                          name={`sale_items.${index}.product_id`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { onChange, value } }) => (
                            <Autocomplete
                              options={products}
                              getOptionLabel={(option) => option.name}
                              value={products.find(p => p.id === value) || null}
                              onChange={(_, newValue) => {
                                onChange(newValue?.id || '');
                                setValue(`sale_items.${index}.unit_price`, newValue?.sale_price || 0);
                              }}
                              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Product" />}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>{selectedProduct ? `${selectedProduct.current_stock} ${selectedProduct.unit}` : '-'}</TableCell>
                      <TableCell>
                        <Controller
                          name={`sale_items.${index}.quantity`}
                          control={control}
                          rules={{ required: true, min: 1, max: selectedProduct?.current_stock || undefined }}
                          render={({ field }) => <TextField {...field} type="number" variant="standard" sx={{width: '80px'}} />}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField {...register(`sale_items.${index}.unit_price`)} type="number" variant="standard" InputProps={{ readOnly: true }} />
                      </TableCell>
                      <TableCell>₹{(watch(`sale_items.${index}.quantity`) * watch(`sale_items.${index}.unit_price`) || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => remove(index)} color="error"><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
          <Button startIcon={<Add />} onClick={() => append({ product_id: '', quantity: 1, unit_price: 0, total_price: 0 })} sx={{ mt: 1 }}>
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
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    Subtotal: <span>₹{watch('subtotal').toFixed(2)}</span>
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                    <TextField select label="Disc. Type" size="small" value={discountType} onChange={(e)=> setDiscountType(e.target.value as any)}>
                      <MenuItem value="amount">Amount (₹)</MenuItem>
                      <MenuItem value="percent">Percent (%)</MenuItem>
                    </TextField>
                    <TextField label={discountType==='percent' ? 'Discount %' : 'Discount ₹'} type="number" size="small" value={discountValue} onChange={(e)=> setDiscountValue(Number(e.target.value))} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    Applied Discount: <span>₹{watch('discount_amount').toFixed(2)}</span>
                  </Typography>
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
            {loading ? 'Saving...' : sale ? 'Update Sale' : 'Create Sale'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
