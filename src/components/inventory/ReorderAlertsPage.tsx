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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

interface ReorderAlert {
  id: string;
  product_id: string;
  current_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  alert_level: 'low' | 'critical' | 'out_of_stock';
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    unit?: string;
    min_stock_level: number;
    max_stock_level: number;
    reserved_stock: number;
  };
  acknowledger?: {
    full_name: string;
  };
}

interface StockSummary {
  total_products: number;
  low_stock_count: number;
  critical_stock_count: number;
  out_of_stock_count: number;
}

export function ReorderAlertsPage() {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    total_products: 0,
    low_stock_count: 0,
    critical_stock_count: 0,
    out_of_stock_count: 0,
  });

  // Filters
  const [filterLevel, setFilterLevel] = useState<'all' | 'low' | 'critical' | 'out_of_stock'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'acknowledged'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Acknowledge dialog
  const [ackDialogOpen, setAckDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ReorderAlert | null>(null);
  const [ackNote, setAckNote] = useState('');
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    if (merchant) {
      fetchAlerts();
      fetchStockSummary();
    }
  }, [merchant]);

  const fetchAlerts = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reorder_alerts')
        .select(`
          *,
          product:products(id, name, sku, unit, min_stock_level, max_stock_level, reserved_stock),
          acknowledger:profiles!reorder_alerts_acknowledged_by_fkey(full_name)
        `)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load reorder alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockSummary = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('current_stock, reserved_stock, reorder_point')
        .eq('merchant_id', merchant.id)
        .eq('status', 'active')
        .gt('reorder_point', 0);

      if (error) throw error;

      const summary = (data || []).reduce(
        (acc, product) => {
          const availableStock = product.current_stock - product.reserved_stock;
          acc.total_products++;
          
          if (availableStock <= 0) {
            acc.out_of_stock_count++;
          } else if (availableStock <= product.reorder_point * 0.5) {
            acc.critical_stock_count++;
          } else if (availableStock <= product.reorder_point) {
            acc.low_stock_count++;
          }
          
          return acc;
        },
        { total_products: 0, low_stock_count: 0, critical_stock_count: 0, out_of_stock_count: 0 }
      );

      setStockSummary(summary);
    } catch (error) {
      console.error('Error fetching stock summary:', error);
    }
  };

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Filter by alert level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(alert => alert.alert_level === filterLevel);
    }

    // Filter by acknowledgment status
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        filtered = filtered.filter(alert => !alert.is_acknowledged);
      } else {
        filtered = filtered.filter(alert => alert.is_acknowledged);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.product?.name?.toLowerCase().includes(query) ||
        alert.product?.sku?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [alerts, filterLevel, filterStatus, searchQuery]);

  const handleAcknowledge = async () => {
    if (!selectedAlert) return;
    
    try {
      setAcknowledging(true);
      const { error } = await supabase
        .from('reorder_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', selectedAlert.id);

      if (error) throw error;

      toast.success('Alert acknowledged');
      setAckDialogOpen(false);
      setSelectedAlert(null);
      setAckNote('');
      fetchAlerts();
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      toast.error(error.message || 'Failed to acknowledge alert');
    } finally {
      setAcknowledging(false);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'out_of_stock':
        return 'error';
      case 'critical':
        return 'error';
      case 'low':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'out_of_stock':
        return <ErrorIcon />;
      case 'critical':
        return <ErrorIcon />;
      case 'low':
        return <WarningIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const pendingAlerts = alerts.filter(alert => !alert.is_acknowledged);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Reorder Alerts</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor low stock levels and manage reorder notifications
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchAlerts} color="primary"><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {/* Stock Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <ErrorIcon />
                </Box>
                <Stack>
                  <Typography variant="h6" fontWeight={700}>
                    {stockSummary.out_of_stock_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <WarningIcon />
                </Box>
                <Stack>
                  <Typography variant="h6" fontWeight={700}>
                    {stockSummary.critical_stock_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Stock
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <WarningIcon />
                </Box>
                <Stack>
                  <Typography variant="h6" fontWeight={700}>
                    {stockSummary.low_stock_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CartIcon />
                </Box>
                <Stack>
                  <Typography variant="h6" fontWeight={700}>
                    {pendingAlerts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Alerts
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Summary */}
      {pendingAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {pendingAlerts.length} pending reorder alert{pendingAlerts.length > 1 ? 's' : ''} that require attention.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Alert Level</InputLabel>
              <Select
                value={filterLevel}
                label="Alert Level"
                onChange={(e) => setFilterLevel(e.target.value as any)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <MenuItem value="all">All Alerts</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Table */}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell align="right">Reorder Point</TableCell>
              <TableCell align="right">Suggested Qty</TableCell>
              <TableCell>Alert Level</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.map((alert) => {
              const availableStock = alert.current_stock - (alert.product?.reserved_stock || 0);
              
              return (
                <TableRow key={alert.id} hover>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>
                        {alert.product?.name}
                      </Typography>
                      {alert.product?.sku && (
                        <Typography variant="caption" color="text.secondary">
                          {alert.product.sku}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{alert.current_stock}</TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      color={availableStock <= 0 ? 'error.main' : availableStock <= alert.reorder_point ? 'warning.main' : 'inherit'}
                      fontWeight={availableStock <= alert.reorder_point ? 600 : 400}
                    >
                      {availableStock}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{alert.reorder_point}</TableCell>
                  <TableCell align="right">{alert.suggested_quantity}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={getAlertIcon(alert.alert_level)}
                      label={alert.alert_level.replace('_', ' ')}
                      color={getAlertColor(alert.alert_level) as any}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(parseISO(alert.created_at), 'MMM dd, HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {alert.is_acknowledged ? (
                      <Stack>
                        <Chip size="small" icon={<CheckIcon />} label="Acknowledged" color="success" variant="outlined" />
                        {alert.acknowledged_at && (
                          <Typography variant="caption" color="text.secondary">
                            {format(parseISO(alert.acknowledged_at), 'MMM dd, HH:mm')}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Chip size="small" label="Pending" color="warning" variant="filled" />
                    )}
                  </TableCell>
                  <TableCell>
                    {!alert.is_acknowledged && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setAckDialogOpen(true);
                        }}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filteredAlerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No reorder alerts found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Acknowledge Dialog */}
      <Dialog open={ackDialogOpen} onClose={() => !acknowledging && setAckDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Acknowledge Reorder Alert</DialogTitle>
        <DialogContent dividers>
          {selectedAlert && (
            <Stack spacing={2}>
              <Alert severity={getAlertColor(selectedAlert.alert_level) as any}>
                <Typography variant="body2">
                  <strong>{selectedAlert.product?.name}</strong> is {selectedAlert.alert_level.replace('_', ' ')}
                </Typography>
                <Typography variant="body2">
                  Current available stock: {selectedAlert.current_stock - (selectedAlert.product?.reserved_stock || 0)} units
                </Typography>
                <Typography variant="body2">
                  Reorder point: {selectedAlert.reorder_point} units
                </Typography>
              </Alert>
              <TextField
                fullWidth
                label="Acknowledgment Note (Optional)"
                multiline
                rows={3}
                value={ackNote}
                onChange={(e) => setAckNote(e.target.value)}
                placeholder="Add any notes about actions taken or planned..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAckDialogOpen(false)} disabled={acknowledging}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAcknowledge} disabled={acknowledging}>
            Acknowledge Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
