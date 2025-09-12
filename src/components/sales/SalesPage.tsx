import { useEffect, useMemo, useState } from 'react';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Undo as UndoIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { Box, Button, Typography, Paper, CircularProgress, IconButton, Grid, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Container, Stack, Tabs, Tab } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { supabase, Sale } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SaleForm } from './SaleForm';
import { ReturnForm } from './ReturnForm';
import EInvoiceManager from './EInvoiceManager';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function SalesPage() {
  const { merchant } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [returnSale, setReturnSale] = useState<Sale | null>(null);
  const [einvoiceSale, setEinvoiceSale] = useState<Sale | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [qInvoice, setQInvoice] = useState('');
  const [qCustomer, setQCustomer] = useState('');
  const [qStatus, setQStatus] = useState<string>('all');
  const [qStart, setQStart] = useState<string>('');
  const [qEnd, setQEnd] = useState<string>('');

  useEffect(() => {
    if (merchant) {
      fetchSales();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchSales = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(id, name),
          sale_items:sale_items(*)
        `)
        .eq('merchant_id', merchant.id)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    let list = [...sales];
    if (qInvoice.trim()) list = list.filter(s => (s.invoice_number || '').toLowerCase().includes(qInvoice.toLowerCase()));
    if (qCustomer.trim()) list = list.filter(s => (s as any).customer?.name?.toLowerCase().includes(qCustomer.toLowerCase()));
    if (qStatus !== 'all') list = list.filter(s => (s.payment_status || '').toLowerCase() === qStatus);
    if (qStart) list = list.filter(s => new Date(s.sale_date) >= new Date(qStart));
    if (qEnd) list = list.filter(s => new Date(s.sale_date) <= new Date(qEnd));
    return list;
  }, [sales, qInvoice, qCustomer, qStatus, qStart, qEnd]);

  const totals = useMemo(() => {
    const count = filteredSales.length;
    const subtotal = filteredSales.reduce((s, x) => s + Number((x as any).subtotal || 0), 0);
    const tax = filteredSales.reduce((s, x) => s + Number((x as any).tax_amount || 0), 0);
    const discount = filteredSales.reduce((s, x) => s + Number((x as any).discount_amount || 0), 0);
    const total = filteredSales.reduce((s, x) => s + Number((x as any).total_amount || 0), 0);
    const received = filteredSales.reduce((s, x) => s + Number((x as any).amount_received || 0), 0);
    const outstanding = total - received;
    return { count, subtotal, tax, discount, total, received, outstanding };
  }, [filteredSales]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sale? This will restore product stock and cannot be undone.')) return;

    try {
      // 1) Load sale items first so we can revert stock
      const { data: items, error: itemsErr } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', id);
      if (itemsErr) throw itemsErr;

      // 2) Revert stock for each item
      for (const it of items || []) {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', it.product_id)
          .single();
        if (prodErr) throw prodErr;
        const newStock = Number((prod as any)?.current_stock || 0) + Number(it.quantity || 0);
        const { error: updErr2 } = await supabase
          .from('products')
          .update({ current_stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', it.product_id);
        if (updErr2) throw updErr2;
      }

      // 3) Delete the sale (sale_items will cascade)
      const { error: delErr } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;

      setSales(prev => prev.filter(s => s.id !== id));
      toast.success('Sale deleted and stock restored.');
    } catch (error: any) {
      console.error('Delete sale error:', error);
      toast.error(error.message || 'Failed to delete sale');
    }
  };

  const handleOpenForm = (sale: Sale | null) => {
    console.log('Opening form for sale:', sale);
    setEditingSale(sale);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setEditingSale(null);
    setShowForm(false);
  };

  const columns: GridColDef<any>[] = [
    { field: 'invoice_number', headerName: 'Invoice #', flex: 1 },
    { field: 'customerName', headerName: 'Customer', flex: 1.5, valueGetter: (params: any) => params?.row?.customer?.name ?? 'N/A' },
    { field: 'sale_date', headerName: 'Date', flex: 1, valueFormatter: (params: any) => {
      const v = params?.value as any;
      if (!v) return '-';
      const d = new Date(v);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'dd MMM yyyy');
    } },
    { field: 'total_amount', headerName: 'Total', flex: 1, type: 'number', valueFormatter: (params: any) => `₹${Number((params?.value as any) ?? 0).toFixed(2)}` },
    { field: 'amount_received', headerName: 'Received', flex: 1, type: 'number', valueFormatter: (params: any) => `₹${Number((params?.value as any) ?? 0).toFixed(2)}` },
    { field: 'outstanding', headerName: 'Outstanding', flex: 1, type: 'number', valueGetter: (params: any) => {
      const total = Number((params?.row as any)?.total_amount || 0);
      const rec = Number((params?.row as any)?.amount_received || 0);
      return Math.max(0, total - rec);
    }, valueFormatter: (params: any) => `₹${Number((params?.value as any) ?? 0).toFixed(2)}` },
    { field: 'due_date', headerName: 'Due Date', flex: 1, valueFormatter: (params: any) => {
      const v = params?.value as any;
      if (!v) return '-';
      const d = new Date(v);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'dd MMM yyyy');
    } },
    { field: 'payment_status', headerName: 'Payment', flex: 1, renderCell: (params: any) => (
      <Typography 
        variant="caption" 
        sx={{ 
          px: 1, py: 0.5, borderRadius: 1, textTransform: 'capitalize',
          bgcolor: params.value === 'paid' ? 'success.light' : params.value === 'partial' ? 'warning.light' : 'error.light',
          color: params.value === 'paid' ? 'success.dark' : params.value === 'partial' ? 'warning.dark' : 'error.dark',
        }}
      >
        {params.value}
      </Typography>
    )},
    { field: 'itemsCount', headerName: 'Items', flex: 0.5, type: 'number', valueGetter: (params: any) => (params?.row?.sale_items?.length ?? 0) as number },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1.2,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => { setViewSale(params.row); setInvoiceOpen(true); }} color="default" size="small">
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => setEinvoiceSale(params.row)} color="info" size="small">
            <ReceiptIcon />
          </IconButton>
          <IconButton onClick={() => setReturnSale(params.row)} color="warning" size="small">
            <UndoIcon />
          </IconButton>
          <IconButton onClick={() => handleOpenForm(params.row)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Print styles for invoice dialog */}
      <style>{`
        @media print {
          @page { size: A4; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { width: 100%; }
          .copy { page-break-inside: avoid; font-size: 11px; }
          .copy + .copy { margin-top: 8mm; }
          .inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .inv-title { font-size: 14px; font-weight: 700; }
          .inv-brand { display: flex; align-items: center; gap: 8px; }
          .inv-brand img { height: 28px; width: auto; object-fit: contain; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; margin-top: 4px; }
          th, td { border: 1px solid #ddd; padding: 4px 6px; word-wrap: break-word; }
          th { background: #f3f4f6; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          .right { text-align: right; }
          .totals .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .totals .grand { font-weight: 700; font-size: 13px; }
          .MuiDialog-container, .MuiDrawer-root, nav, header, footer, .no-print { display: none !important; }
        }
      `}</style>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Sales / POS</Typography>
          <Typography variant="body2" color="text.secondary">Record and manage your customer sales</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm(null)}>Create Sale</Button>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}><TextField label="Invoice #" fullWidth size="small" value={qInvoice} onChange={(e)=>setQInvoice(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Customer" fullWidth size="small" value={qCustomer} onChange={(e)=>setQCustomer(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><TextField label="Start Date" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={qStart} onChange={(e)=>setQStart(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><TextField label="End Date" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={qEnd} onChange={(e)=>setQEnd(e.target.value)} /></Grid>
          <Grid item xs={12} md={2}>
            <TextField label="Payment" select size="small" fullWidth value={qStatus} onChange={(e)=>setQStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Count</Typography><Typography variant="subtitle2">{totals.count}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Subtotal</Typography><Typography variant="subtitle2">₹{totals.subtotal.toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">GST</Typography><Typography variant="subtitle2">₹{totals.tax.toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Grand Total</Typography><Typography variant="subtitle2">₹{totals.total.toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Received</Typography><Typography variant="subtitle2">₹{(totals.received||0).toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Outstanding</Typography><Typography variant="subtitle2">₹{(totals.outstanding||0).toFixed(2)}</Typography></Grid>
        </Grid>
      </Paper>

      {filteredSales.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No sales found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting filters or create a new sale.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm(null)}>Create Sale</Button>
        </Paper>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredSales}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </Paper>
      )}

      {showForm && (
        <SaleForm
          sale={editingSale}
          onClose={handleCloseForm}
          onSave={() => {
            fetchSales();
            handleCloseForm();
          }}
        />
      )}

      {returnSale && (
        <ReturnForm
          sale={returnSale}
          onClose={() => setReturnSale(null)}
          onSave={() => {
            fetchSales();
            setReturnSale(null);
          }}
        />
      )}

      {/* E-Invoice Management Dialog */}
      {einvoiceSale && (
        <Dialog open={!!einvoiceSale} onClose={() => setEinvoiceSale(null)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              E-Invoice Management - {einvoiceSale.invoice_number}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="E-Invoice" />
              <Tab label="Invoice Preview" />
            </Tabs>
            
            {tabValue === 0 && merchant && (
              <Box sx={{ mt: 2 }}>
                <EInvoiceManager
                  sale={einvoiceSale}
                  customer={(einvoiceSale as any).customer || { name: 'Walk-in Customer' }}
                  merchant={merchant}
                  saleItems={(einvoiceSale as any).sale_items || []}
                  onEInvoiceGenerated={() => {
                    fetchSales();
                  }}
                />
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                {/* Invoice preview content - reuse existing preview */}
                <Box className="print-container">
                  {['Customer Copy','Office Copy'].map((label, idx) => (
                    <Box key={idx} className="copy" sx={{ mb: idx===0?2:0 }}>
                      <div className="inv-header">
                        <div className="inv-brand">
                          {merchant && (merchant.settings as any)?.logo_url && (
                            <img src={(merchant.settings as any).logo_url} alt="logo" />
                          )}
                          <div className="inv-title">{merchant?.name || 'Invoice'}</div>
                        </div>
                        <div className="small">{label}</div>
                      </div>
                      {(merchant?.address || merchant?.gstin) && (
                        <div className="small" style={{ marginBottom: 4 }}>
                          {merchant?.address && <div>{merchant.address}</div>}
                          {merchant?.gstin && <div>GST: {merchant.gstin}</div>}
                        </div>
                      )}
                      <div className="meta">
                        <div><label>Invoice No:</label> <strong>{einvoiceSale.invoice_number || '-'}</strong></div>
                        <div><label>Date:</label> <span>{format(new Date(einvoiceSale.sale_date), 'dd MMM yyyy HH:mm')}</span></div>
                        <div><label>Customer:</label> <span>{(einvoiceSale as any).customer?.name || 'Walk-in'}</span></div>
                      </div>
                      <table style={{ marginTop: 6 }}>
                        <thead>
                          <tr>
                            <th style={{ width: '58%' }}>Product</th>
                            <th style={{ width: '10%' }} className="right">Qty</th>
                            <th style={{ width: '16%' }} className="right">Price</th>
                            <th style={{ width: '16%' }} className="right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(einvoiceSale.sale_items || []).map((it: any, i: number) => (
                            <tr key={i}>
                              <td>{it.product_name || it.product_id}</td>
                              <td className="right">{it.quantity}</td>
                              <td className="right">₹{Number(it.unit_price || 0).toFixed(2)}</td>
                              <td className="right">₹{Number(it.total_price || (it.quantity*it.unit_price)||0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="totals">
                        <div className="row"><span className="small">Subtotal</span><span>₹{Number(einvoiceSale.subtotal||0).toFixed(2)}</span></div>
                        <div className="row"><span className="small">Tax</span><span>₹{Number(einvoiceSale.tax_amount||0).toFixed(2)}</span></div>
                        <div className="row"><span className="small">Discount</span><span>₹{Number(einvoiceSale.discount_amount||0).toFixed(2)}</span></div>
                        <div className="row grand"><span>Total</span><span>₹{Number(einvoiceSale.total_amount||0).toFixed(2)}</span></div>
                      </div>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEinvoiceSale(null)}>Close</Button>
            {tabValue === 1 && (
              <Button variant="contained" onClick={() => window.print()}>Print</Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Invoice view dialog */}
      <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Preview</DialogTitle>
        <DialogContent dividers>
          {viewSale && (
            <Box className="print-container">
              {['Customer Copy','Office Copy'].map((label, idx) => (
                <Box key={idx} className="copy" sx={{ mb: idx===0?2:0 }}>
                  <div className="inv-header">
                    <div className="inv-brand">
                      {merchant && (merchant.settings as any)?.logo_url && (
                        <img src={(merchant.settings as any).logo_url} alt="logo" />
                      )}
                      <div className="inv-title">{merchant?.name || 'Invoice'}</div>
                    </div>
                    <div className="small">{label}</div>
                  </div>
                  {(merchant?.address || merchant?.gstin) && (
                    <div className="small" style={{ marginBottom: 4 }}>
                      {merchant?.address && <div>{merchant.address}</div>}
                      {merchant?.gstin && <div>GST: {merchant.gstin}</div>}
                    </div>
                  )}
                  <div className="meta">
                    <div><label>Invoice No:</label> <strong>{viewSale.invoice_number || '-'}</strong></div>
                    <div><label>Date:</label> <span>{format(new Date(viewSale.sale_date), 'dd MMM yyyy HH:mm')}</span></div>
                    <div><label>Customer:</label> <span>{(viewSale as any).customer?.name || 'Walk-in'}</span></div>
                  </div>
                  <table style={{ marginTop: 6 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '58%' }}>Product</th>
                        <th style={{ width: '10%' }} className="right">Qty</th>
                        <th style={{ width: '16%' }} className="right">Price</th>
                        <th style={{ width: '16%' }} className="right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewSale.sale_items || []).map((it: any, i: number) => (
                        <tr key={i}>
                          <td>{it.product_name || it.product_id}</td>
                          <td className="right">{it.quantity}</td>
                          <td className="right">₹{Number(it.unit_price || 0).toFixed(2)}</td>
                          <td className="right">₹{Number(it.total_price || (it.quantity*it.unit_price)||0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="totals">
                    <div className="row"><span className="small">Subtotal</span><span>₹{Number(viewSale.subtotal||0).toFixed(2)}</span></div>
                    <div className="row"><span className="small">Tax</span><span>₹{Number(viewSale.tax_amount||0).toFixed(2)}</span></div>
                    <div className="row"><span className="small">Discount</span><span>₹{Number(viewSale.discount_amount||0).toFixed(2)}</span></div>
                    <div className="row grand"><span>Total</span><span>₹{Number(viewSale.total_amount||0).toFixed(2)}</span></div>
                  </div>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceOpen(false)} className="no-print">Close</Button>
          <Button variant="contained" onClick={() => window.print()} className="no-print">Print</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
