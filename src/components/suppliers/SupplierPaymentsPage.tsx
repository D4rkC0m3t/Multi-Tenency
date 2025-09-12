import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Typography, Paper, Grid, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box, Divider } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Supplier { id: string; name: string }
interface Payment { id: string; supplier_id: string; payment_date: string; amount: number; method?: string | null; reference?: string | null; note?: string | null; supplier?: Supplier }

export function SupplierPaymentsPage() {
  const { merchant, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [balances, setBalances] = useState<{ supplier_id:string; merchant_id:string; total_purchases:number; total_paid:number; balance:number; supplier?: Supplier }[]>([]);

  const [qSupplier, setQSupplier] = useState<string>('all');
  const [qStart, setQStart] = useState<string>('');
  const [qEnd, setQEnd] = useState<string>('');
  const [qMethod, setQMethod] = useState<string>('all');

  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState<{ supplier_id: string; payment_date: string; amount: string; method: string; reference: string; note: string }>({ supplier_id: '', payment_date: new Date().toISOString().slice(0,10), amount: '', method: 'cash', reference: '', note: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      fetchSuppliers();
      fetchPayments();
      fetchBalances();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchSuppliers = async () => {
    if (!merchant) return;
    const { data, error } = await supabase.from('suppliers').select('id, name').eq('merchant_id', merchant.id).order('name');
    if (!error) setSuppliers((data as any) || []);
  };

  const fetchBalances = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('v_supplier_balances')
        .select('*')
        .eq('merchant_id', merchant.id);
      if (error) throw error;
      // join supplier names
      const ids = (data as any[] || []).map(d=>d.supplier_id);
      let byId = new Map<string, Supplier>();
      if (ids.length) {
        const { data: sup, error: sErr } = await supabase.from('suppliers').select('id,name').in('id', ids as any);
        if (!sErr) byId = new Map((sup||[] as any[]).map((s:any)=>[s.id, s]));
      }
      const rows = (data as any[] || []).map(d => ({ ...d, supplier: byId.get(d.supplier_id) }));
      setBalances(rows);
    } catch (e) {
      toast.error('Failed to load supplier balances');
    }
  };

  const fetchPayments = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('supplier_payments')
        .select('*, supplier:suppliers(id, name)')
        .eq('merchant_id', merchant.id)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      setPayments((data as any) || []);
    } catch (e) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...payments];
    if (qSupplier !== 'all') list = list.filter(p => p.supplier_id === qSupplier);
    if (qMethod !== 'all') list = list.filter(p => (p.method || '') === qMethod);
    if (qStart) list = list.filter(p => new Date(p.payment_date) >= new Date(qStart));
    if (qEnd) list = list.filter(p => new Date(p.payment_date) <= new Date(qEnd));
    return list;
  }, [payments, qSupplier, qMethod, qStart, qEnd]);

  const totals = useMemo(() => filtered.reduce((s, x) => s + Number(x.amount || 0), 0), [filtered]);
  const balanceTotals = useMemo(() => {
    const totalPurchases = balances.reduce((s,x)=> s + Number(x.total_purchases||0), 0);
    const totalPaid = balances.reduce((s,x)=> s + Number(x.total_paid||0), 0);
    const totalBalance = balances.reduce((s,x)=> s + Number(x.balance||0), 0);
    return { totalPurchases, totalPaid, totalBalance };
  }, [balances]);

  const exportCsv = () => {
    const header = ['Date','Supplier','Amount','Method','Reference'];
    const lines = filtered.map(r => [r.payment_date, r.supplier?.name || '', Number(r.amount||0), r.method || '', r.reference || '']);
    const csv = [header, ...lines].map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'supplier_payments.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const addPayment = async () => {
    if (!merchant) return;
    if (!form.supplier_id) { toast.error('Select supplier'); return; }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Enter valid amount'); return; }
    try {
      setSaving(true);
      const payload:any = {
        merchant_id: merchant.id,
        supplier_id: form.supplier_id,
        payment_date: form.payment_date || new Date().toISOString().slice(0,10),
        amount,
        method: form.method || null,
        reference: form.reference || null,
        note: form.note || null,
        created_by: profile?.id || null,
      };
      const { error } = await supabase.from('supplier_payments').insert([payload]);
      if (error) throw error;
      toast.success('Payment recorded');
      setOpenAdd(false);
      setForm({ supplier_id: '', payment_date: new Date().toISOString().slice(0,10), amount: '', method: 'cash', reference: '', note: '' });
      fetchPayments();
    } catch (e:any) {
      toast.error(e.message || 'Failed to add payment');
    } finally { setSaving(false); }
  };

  const deletePayment = async (id: string) => {
    if (!confirm('Delete this payment?')) return;
    const { error } = await supabase.from('supplier_payments').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    fetchPayments();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Supplier Payments</Typography>
          <Typography variant="body2" color="text.secondary">Track supplier payables and record payments</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={exportCsv}>Export CSV</Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={()=> setOpenAdd(true)}>Add Payment</Button>
        </Stack>
      </Stack>

      {/* Balances widget */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Supplier Balances</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Typography variant="caption" color="text.secondary">Total Purchases</Typography><Typography variant="subtitle2">₹{balanceTotals.totalPurchases.toFixed(2)}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption" color="text.secondary">Total Paid</Typography><Typography variant="subtitle2">₹{balanceTotals.totalPaid.toFixed(2)}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography variant="caption" color="text.secondary">Total Balance</Typography><Typography variant="subtitle2">₹{balanceTotals.totalBalance.toFixed(2)}</Typography></Grid>
        </Grid>
        <Divider sx={{ my: 1.5 }} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Purchases</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.sort((a,b)=> Number(b.balance||0) - Number(a.balance||0)).slice(0, 10).map(b => (
              <TableRow key={b.supplier_id}>
                <TableCell>{b.supplier?.name || b.supplier_id}</TableCell>
                <TableCell align="right">₹{Number(b.total_purchases||0).toFixed(2)}</TableCell>
                <TableCell align="right">₹{Number(b.total_paid||0).toFixed(2)}</TableCell>
                <TableCell align="right">₹{Number(b.balance||0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {balances.length === 0 && (
              <TableRow><TableCell colSpan={4}><Box sx={{ p:2, textAlign:'center' }}><Typography variant="body2" color="text.secondary">No supplier balances</Typography></Box></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField select label="Supplier" size="small" fullWidth value={qSupplier} onChange={(e)=>setQSupplier(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {suppliers.map(s => (<MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}><TextField type="date" label="Start" size="small" fullWidth InputLabelProps={{shrink:true}} value={qStart} onChange={(e)=>setQStart(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><TextField type="date" label="End" size="small" fullWidth InputLabelProps={{shrink:true}} value={qEnd} onChange={(e)=>setQEnd(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}>
            <TextField select label="Method" size="small" fullWidth value={qMethod} onChange={(e)=>setQMethod(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {['cash','upi','card','bank'].map(m => (<MenuItem key={m} value={m}>{m.toUpperCase()}</MenuItem>))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={fetchPayments}>Refresh</Button></Grid>
        </Grid>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.payment_date}</TableCell>
                <TableCell>{p.supplier?.name || ''}</TableCell>
                <TableCell align="right">₹{Number(p.amount||0).toFixed(2)}</TableCell>
                <TableCell>{(p.method||'').toUpperCase()}</TableCell>
                <TableCell>{p.reference || '—'}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" size="small" onClick={()=>deletePayment(p.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No payments found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="caption" color="text.secondary">Total of filtered payments</Typography>
        <Typography variant="subtitle2">₹{totals.toFixed(2)}</Typography>
      </Paper>

      <Dialog open={openAdd} onClose={()=>!saving && setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Supplier Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField select label="Supplier" fullWidth value={form.supplier_id} onChange={(e)=>setForm(prev=>({ ...prev, supplier_id: e.target.value }))}>
              {suppliers.map(s => (<MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>))}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField type="date" label="Date" fullWidth InputLabelProps={{shrink:true}} value={form.payment_date} onChange={(e)=>setForm(prev=>({ ...prev, payment_date: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField type="number" label="Amount" fullWidth value={form.amount} onChange={(e)=>setForm(prev=>({ ...prev, amount: e.target.value }))} /></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField select label="Method" fullWidth value={form.method} onChange={(e)=>setForm(prev=>({ ...prev, method: e.target.value }))}>{['cash','upi','card','bank'].map(m=>(<MenuItem key={m} value={m}>{m.toUpperCase()}</MenuItem>))}</TextField></Grid>
              <Grid item xs={6}><TextField label="Reference" fullWidth value={form.reference} onChange={(e)=>setForm(prev=>({ ...prev, reference: e.target.value }))} /></Grid>
            </Grid>
            <TextField label="Note" fullWidth value={form.note} onChange={(e)=>setForm(prev=>({ ...prev, note: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={addPayment} disabled={saving}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
