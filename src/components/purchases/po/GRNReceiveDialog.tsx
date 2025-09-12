import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Button, Grid, Typography, Paper } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import type { PurchaseOrder } from './PurchaseOrdersPage';

interface Props { po: PurchaseOrder; onClose: () => void; onSaved: () => void; }

export function GRNReceiveDialog({ po, onClose, onSaved }: Props) {
  const { merchant, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [refNo, setRefNo] = useState('');
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState('');
  const [receive, setReceive] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const it of (po.purchase_order_items || [])) {
      map[(it as any).id!] = 0;
    }
    setReceive(map);
  }, [po]);

  const totalReceive = useMemo(() => Object.values(receive).reduce((s, x) => s + Number(x||0), 0), [receive]);

  const save = async () => {
    if (!merchant) return;
    const entries = (po.purchase_order_items || []).filter((it:any)=> Number(receive[it.id]||0) > 0);
    if (entries.length === 0) { toast('Nothing to receive'); return; }
    try {
      setSaving(true);
      // create grn header
      const { data:grn, error:grnErr } = await supabase.from('grns').insert([{
        merchant_id: merchant.id,
        purchase_order_id: po.id,
        reference_number: refNo || null,
        received_date: receivedDate ? new Date(receivedDate).toISOString() : new Date().toISOString(),
        notes: notes || null,
        created_by: profile?.id || null,
      }]).select('id').single();
      if (grnErr) throw grnErr;
      const grnId = (grn as any).id;
      // create grn items
      const rows = entries.map((it:any) => ({
        merchant_id: merchant.id,
        grn_id: grnId,
        product_id: it.product_id,
        purchase_order_item_id: it.id,
        quantity_received: Number(receive[it.id]||0),
        unit_cost: Number(it.unit_price||0),
        total_cost: Number(receive[it.id]||0) * Number(it.unit_price||0),
      }));
      const { error: itemsErr } = await supabase.from('grn_items').insert(rows as any);
      if (itemsErr) throw itemsErr;

      // compute if fully received
      const { data: ordered } = await supabase
        .from('purchase_order_items')
        .select('id, quantity')
        .eq('purchase_order_id', po.id);
      const poItemIds = (ordered||[]).map((x:any)=>x.id);
      let fullyReceived = false;
      if (poItemIds.length) {
        const { data: recs } = await supabase
          .from('grn_items')
          .select('purchase_order_item_id, quantity_received')
          .in('purchase_order_item_id', poItemIds as any);
        const recMap = new Map<string, number>();
        (recs||[]).forEach((r:any)=> recMap.set(r.purchase_order_item_id, (recMap.get(r.purchase_order_item_id)||0) + Number(r.quantity_received||0)) );
        fullyReceived = (ordered||[]).every((o:any)=> Number(recMap.get(o.id)||0) >= Number(o.quantity||0));
      }
      await supabase
        .from('purchase_orders')
        .update({ status: fullyReceived ? 'received' : 'partially_received', updated_at: new Date().toISOString() })
        .eq('id', po.id);

      toast.success('Goods received');
      onSaved();
    } catch (e:any) {
      toast.error(e.message || 'Failed to save GRN');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onClose={()=>!saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Receive Goods (GRN)</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Reference #" value={refNo} onChange={(e)=>setRefNo(e.target.value)} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Received Date" InputLabelProps={{shrink:true}} value={receivedDate} onChange={(e)=>setReceivedDate(e.target.value)} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} /></Grid>
          </Grid>
          <Paper variant="outlined" sx={{ p:2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Items to Receive</Typography>
            <Grid container spacing={1}>
              {(po.purchase_order_items || []).map((it:any) => (
                <Grid item xs={12} key={it.id}>
                  <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }}>
                    <Typography sx={{ flex: 1 }}>{it.description || it.product_id}</Typography>
                    <Typography variant="caption" color="text.secondary">Ordered: {it.quantity}</Typography>
                    <TextField size="small" type="number" label="Receive Qty" sx={{ width: 140 }} value={Number(receive[it.id]||0)} onChange={(e)=> setReceive(prev=>({ ...prev, [it.id]: Number(e.target.value) }))} />
                  </Stack>
                </Grid>
              ))}
            </Grid>
            <Typography variant="caption" color="text.secondary">Total to receive: {totalReceive}</Typography>
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
