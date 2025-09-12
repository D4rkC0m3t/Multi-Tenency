// E-Invoice Management Page
// Central hub for managing all E-Invoice operations

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import EInvoiceSettings from '../settings/EInvoiceSettings';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface EInvoiceRecord {
  id: string;
  sale_id: string;
  irn: string;
  ack_no: string;
  ack_date: string;
  status: 'active' | 'cancelled';
  created_at: string;
  cancelled_at?: string;
  cancel_reason?: string;
  sale: {
    invoice_number: string;
    sale_date: string;
    total_amount: number;
    customer: {
      name: string;
      gst_number?: string;
    };
  };
}

export function EInvoicePage() {
  const { merchant } = useAuth();
  const [einvoices, setEinvoices] = useState<EInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEinvoice, setSelectedEinvoice] = useState<EInvoiceRecord | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (merchant) {
      fetchEInvoices();
    }
  }, [merchant]);

  const fetchEInvoices = async () => {
    if (!merchant) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('einvoice_metadata')
        .select(`
          *,
          sale:sales(
            invoice_number,
            sale_date,
            total_amount,
            customer:customers(name, gst_number)
          )
        `)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEinvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching E-Invoices:', error);
      toast.error('Failed to load E-Invoices');
    } finally {
      setLoading(false);
    }
  };


  const filteredEInvoices = useMemo(() => {
    let filtered = [...einvoices];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    if (filterDateFrom) {
      filtered = filtered.filter(e => new Date(e.created_at) >= new Date(filterDateFrom));
    }

    if (filterDateTo) {
      filtered = filtered.filter(e => new Date(e.created_at) <= new Date(filterDateTo));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.irn.toLowerCase().includes(query) ||
        e.ack_no.toLowerCase().includes(query) ||
        (e.sale as any)?.invoice_number?.toLowerCase().includes(query) ||
        (e.sale as any)?.customer?.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [einvoices, filterStatus, filterDateFrom, filterDateTo, searchQuery]);

  const stats = useMemo(() => {
    const total = einvoices.length;
    const active = einvoices.filter(e => e.status === 'active').length;
    const cancelled = einvoices.filter(e => e.status === 'cancelled').length;
    const thisMonth = einvoices.filter(e => {
      const date = new Date(e.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return { total, active, cancelled, thisMonth };
  }, [einvoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef<EInvoiceRecord>[] = [
    { 
      field: 'irn', 
      headerName: 'IRN', 
      flex: 1.5,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'ack_no', 
      headerName: 'Ack No.', 
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'invoice_number', 
      headerName: 'Invoice #', 
      flex: 0.8,
      valueGetter: (_, row) => row.sale?.invoice_number || 'N/A'
    },
    { 
      field: 'customer_name', 
      headerName: 'Customer', 
      flex: 1,
      valueGetter: (_, row) => row.sale?.customer?.name || 'N/A'
    },
    { 
      field: 'total_amount', 
      headerName: 'Amount', 
      flex: 0.8,
      type: 'number',
      valueGetter: (_, row) => row.sale?.total_amount || 0,
      valueFormatter: (value) => `₹${Number(value || 0).toFixed(2)}`
    },
    { 
      field: 'ack_date', 
      headerName: 'E-Invoice Date', 
      flex: 1,
      valueFormatter: (value) => {
        if (!value) return '-';
        return format(new Date(value), 'dd MMM yyyy');
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setSelectedEinvoice(params.row)}
        >
          View
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>
            E-Invoice Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage GST compliant E-Invoices for your business
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEInvoices}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ReceiptIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total E-Invoices
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckIcon color="success" />
                <Box>
                  <Typography variant="h6">{stats.active}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CancelIcon color="error" />
                <Box>
                  <Typography variant="h6">{stats.cancelled}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningIcon color="warning" />
                <Box>
                  <Typography variant="h6">{stats.thisMonth}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="IRN, Ack No., Invoice #, Customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From Date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To Date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* E-Invoice List */}
      {filteredEInvoices.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No E-Invoices Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {einvoices.length === 0 
              ? 'Start generating E-Invoices from your sales to see them here.'
              : 'Try adjusting your filters to find E-Invoices.'
            }
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            E-Invoices are generated from the Sales page. Click the receipt icon next to any eligible sale to generate an E-Invoice.
          </Alert>
        </Paper>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredEInvoices}
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
            pageSizeOptions={[5, 10, 20, 50]}
            disableRowSelectionOnClick
          />
        </Paper>
      )}

      {/* E-Invoice Details Dialog */}
      {selectedEinvoice && (
        <Dialog open={!!selectedEinvoice} onClose={() => setSelectedEinvoice(null)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              E-Invoice Details - {selectedEinvoice.sale?.invoice_number}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="E-Invoice Info" />
              <Tab label="Management" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">IRN</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mb: 2 }}>
                      {selectedEinvoice.irn}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Ack No.</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedEinvoice.ack_no}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedEinvoice.status.toUpperCase()}
                      color={getStatusColor(selectedEinvoice.status) as any}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">E-Invoice Date</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {format(new Date(selectedEinvoice.ack_date), 'dd MMM yyyy, hh:mm a')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Invoice Amount</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      ₹{Number(selectedEinvoice.sale?.total_amount || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  {selectedEinvoice.status === 'cancelled' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">Cancelled Date</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedEinvoice.cancelled_at ? 
                            format(new Date(selectedEinvoice.cancelled_at), 'dd MMM yyyy, hh:mm a') : 
                            'N/A'
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Cancellation Reason</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {selectedEinvoice.cancel_reason || 'N/A'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}
            
            {tabValue === 1 && merchant && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Use the management tools below to verify or cancel this E-Invoice.
                </Alert>
                {/* E-Invoice management would go here - placeholder for now */}
                <Typography variant="body2" color="text.secondary">
                  E-Invoice management tools will be available here.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedEinvoice(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}


      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>E-Invoice Configuration</DialogTitle>
        <DialogContent>
          <EInvoiceSettings />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
