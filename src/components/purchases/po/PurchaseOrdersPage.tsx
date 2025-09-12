import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Typography, Paper, Grid, TextField, MenuItem, Button, Chip, IconButton, Box } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, LocalShipping as ReceiveIcon, Delete as DeleteIcon, CheckCircle as ApproveIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { GRNReceiveDialog } from './GRNReceiveDialog';

export interface POItem { id?: string; product_id: string; description?: string | null; quantity: number; unit_price: number; tax_rate?: number; total_price?: number; }
export interface PurchaseOrder { id: string; merchant_id: string; supplier_id: string | null; po_number: string | null; status: 'draft'|'approved'|'partially_received'|'received'|'closed'|'cancelled'; expected_date: string | null; subtotal: number; tax_amount: number; discount_amount: number; total_amount: number; notes?: string | null; created_at: string; updated_at: string; purchase_order_items?: POItem[]; supplier?: { id: string; name: string } }

export function PurchaseOrdersPage() {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [receivePO, setReceivePO] = useState<PurchaseOrder | null>(null);

  const [qNumber, setQNumber] = useState('');
  const [qSupplier, setQSupplier] = useState('');
  const [qStatus, setQStatus] = useState('all');

  const fetchPOs = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`*, supplier:suppliers(id,name), purchase_order_items:purchase_order_items(*)`)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRows((data as any) || []);
    } catch (e) {
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (merchant) fetchPOs(); }, [merchant]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (qNumber.trim()) list = list.filter(r => (r.po_number || '').toLowerCase().includes(qNumber.toLowerCase()));
    if (qSupplier.trim()) list = list.filter(r => (r.supplier?.name || '').toLowerCase().includes(qSupplier.toLowerCase()));
    if (qStatus !== 'all') list = list.filter(r => r.status === (qStatus as any));
    return list;
  }, [rows, qNumber, qSupplier, qStatus]);

  const approvePO = async (id: string) => {
    try {
      const { error } = await supabase.from('purchase_orders').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast.success('PO approved');
      fetchPOs();
    } catch (e:any) { toast.error(e.message || 'Failed to approve'); }
  };

  const closePO = async (id: string) => {
    try {
      const { error } = await supabase.from('purchase_orders').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast.success('PO closed');
      fetchPOs();
    } catch (e:any) { toast.error(e.message || 'Failed to close'); }
  };

  const columns: GridColDef<any>[] = [
    { field: 'po_number', headerName: 'PO #', flex: 1 },
    { field: 'supplier', headerName: 'Supplier', flex: 1.5, valueGetter: (p:any)=>p?.row?.supplier?.name || '—' },
    { field: 'expected_date', headerName: 'Expected', flex: 1 },
    { field: 'total_amount', headerName: 'Total', type:'number', flex: 1, valueFormatter:(p:any)=>`₹${Number(p.value||0).toFixed(2)}` },
    { field: 'status', headerName: 'Status', flex: 1, renderCell:(p:any)=> (
      <Chip size="small" label={String(p.value)} color={p.value==='approved'?'info':p.value?.includes('received')?'success':p.value==='cancelled'?'error':'default'} />
    )},
    { field: 'items', headerName: 'Items', flex: 0.7, type:'number', valueGetter:(p:any)=> p?.row?.purchase_order_items?.length || 0 },
    { field: 'actions', headerName: 'Actions', flex: 1.4, sortable:false, renderCell:(p:any)=> (
      <Box>
        <IconButton size="small" color="success" title="Approve" disabled={!(p.row.status==='draft')} onClick={()=>approvePO(p.row.id)}><ApproveIcon /></IconButton>
        <IconButton size="small" onClick={()=>{ setEditing(p.row); setShowForm(true); }}><EditIcon /></IconButton>
        <IconButton size="small" color="primary" onClick={()=> setReceivePO(p.row)} title="Receive"><ReceiveIcon /></IconButton>
        <IconButton size="small" color="warning" title="Close" disabled={p.row.status==='closed'} onClick={()=>closePO(p.row.id)}><CloseIcon /></IconButton>
        <IconButton size="small" color="error" onClick={async ()=>{
          if (!confirm('Delete this PO?')) return;
          const { error } = await supabase.from('purchase_orders').delete().eq('id', p.row.id);
          if (error) return toast.error(error.message);
          toast.success('Deleted');
          fetchPOs();
        }}><DeleteIcon /></IconButton>
      </Box>
    )}
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs:'column', sm:'row' }} spacing={1.5} alignItems={{ xs:'stretch', sm:'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Purchase Orders</Typography>
          <Typography variant="body2" color="text.secondary">Create, approve, and receive stock against POs</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={()=>{ setEditing(null); setShowForm(true); }}>New PO</Button>
      </Stack>

      <Paper sx={{ p:2, mb:2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="PO #" value={qNumber} onChange={(e)=>setQNumber(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Supplier" value={qSupplier} onChange={(e)=>setQSupplier(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}>
            <TextField select size="small" fullWidth label="Status" value={qStatus} onChange={(e)=>setQStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {['draft','approved','partially_received','received','closed','cancelled'].map(s=> <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}><Button fullWidth variant="outlined" onClick={fetchPOs}>Refresh</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid rows={filtered} columns={columns} loading={loading} getRowId={(r:any)=>r.id} slots={{ toolbar: GridToolbar }} />
      </Paper>

      {showForm && (
        <PurchaseOrderForm po={editing} onClose={()=>setShowForm(false)} onSaved={()=>{ setShowForm(false); fetchPOs(); }} />
      )}

      {receivePO && (
        <GRNReceiveDialog po={receivePO} onClose={()=>setReceivePO(null)} onSaved={()=>{ setReceivePO(null); fetchPOs(); }} />
      )}
    </Container>
  );
}
