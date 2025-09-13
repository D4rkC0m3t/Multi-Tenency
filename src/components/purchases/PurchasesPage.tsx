import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Undo as UndoIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  IconButton, 
  Container, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Grid, 
  LinearProgress,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Collapse,
  // Remove unused imports
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar, 
  GridRenderCellParams,
  GridValueFormatter,
  GridValueGetter,
  GridValueOptions,
  GridColTypeDef,
  GridValueGetterFullParams
} from '@mui/x-data-grid';

// Define PurchaseRow type that extends Purchase with additional fields needed for the grid
interface PurchaseRow extends Omit<Purchase, 'purchase_items'> {
  purchase_items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  supplier_name?: string;
  total_items?: number;
  payment_status_display?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
import { supabase, Purchase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PurchaseForm } from './PurchaseForm';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface FilterState {
  status: string;
  supplier: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  minAmount: string;
  maxAmount: string;
  searchQuery: string;
}

export function PurchasesPage() {
  const { merchant } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [returningPurchase, setReturningPurchase] = useState<Purchase | null>(null);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});
  const [savingReturn, setSavingReturn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string}>>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    supplier: 'all',
    dateRange: {
      start: null,
      end: null
    },
    minAmount: '',
    maxAmount: '',
    searchQuery: ''
  });

  useEffect(() => {
    if (merchant) {
      fetchPurchases();
      fetchSuppliers();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  useEffect(() => {
    applyFilters();
  }, [purchases, filters]);

  const fetchSuppliers = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('merchant_id', merchant.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
    }
  };

  const applyFilters = () => {
    if (!purchases.length) {
      setFilteredPurchases([]);
      return;
    }

    let result = [...purchases];

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(purchase => 
        purchase.invoice_number?.toLowerCase().includes(query) ||
        purchase.supplier?.name?.toLowerCase().includes(query) ||
        purchase.payment_status?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(purchase => purchase.payment_status === filters.status);
    }

    // Filter by supplier
    if (filters.supplier !== 'all') {
      result = result.filter(purchase => purchase.supplier?.id === filters.supplier);
    }

    // Filter by date range
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date);
        return purchaseDate >= startDate;
      });
    }

    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date);
        return purchaseDate <= endDate;
      });
    }

    // Filter by amount range
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      result = result.filter(purchase => purchase.total_amount >= min);
    }

    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      result = result.filter(purchase => purchase.total_amount <= max);
    }

    setFilteredPurchases(result);
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      supplier: 'all',
      dateRange: {
        start: null,
        end: null
      },
      minAmount: '',
      maxAmount: '',
      searchQuery: ''
    });
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.supplier !== 'all') count++;
    if (filters.dateRange.start) count++;
    if (filters.dateRange.end) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const fetchPurchases = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(id, name),
          purchase_items:purchase_items(*)
        `)
        .eq('merchant_id', merchant.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this purchase? This will revert product stock and cannot be undone.')) return;

    try {
      // 1) Load purchase items to revert stock
      const { data: items, error: itemsErr } = await supabase
        .from('purchase_items')
        .select('product_id, quantity')
        .eq('purchase_id', id);
      if (itemsErr) throw itemsErr;

      // 2) Revert stock for each item (remove previously added quantities)
      for (const it of items || []) {
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

      // 3) Delete the purchase (purchase_items will cascade)
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPurchases(prev => prev.filter(p => p.id !== id));
      toast.success('Purchase deleted and stock reverted.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purchase');
    }
  };

  const handleOpenForm = (purchase: Purchase | null) => {
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingPurchase(null);
    setShowForm(false);
  };

  // Define the purchase row type
  type PurchaseRow = Purchase & {
    id: string;
    supplier?: { 
      id: string;
      name: string;
    };
    purchase_items?: Array<{
      id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }>;
    invoice_number?: string;
    purchase_date?: string;
    total_amount?: number;
    payment_status?: string;
  };

  const columns: GridColDef<PurchaseRow>[] = [
    { 
      field: 'id',
      headerName: 'ID',
      flex: 0.5,
      valueGetter: (params) => params.row?.id || ''
    },
    { 
      field: 'invoice_number', 
      headerName: 'Invoice #', 
      flex: 1,
      valueGetter: (params) => params.row?.invoice_number || 'N/A'
    },
    { 
      field: 'supplier_name', 
      headerName: 'Supplier', 
      flex: 1.5, 
      valueGetter: (params) => params.row?.supplier?.name || 'N/A',
      sortable: false
    },
    { 
      field: 'total_amount', 
      headerName: 'Total', 
      flex: 1, 
      type: 'number',
      valueGetter: (params) => params.row?.total_amount || 0,
      valueFormatter: (params) => `₹${Number(params.value || 0).toFixed(2)}`
    },
    { 
      field: 'payment_status', 
      headerName: 'Payment', 
      flex: 1,
      valueGetter: (params) => params.row?.payment_status || 'unpaid',
      renderCell: (params: GridRenderCellParams<PurchaseRow, string>) => {
        const status = params.value || 'unpaid';
        return (
          <Typography 
            variant="caption" 
            sx={{ 
              px: 1, 
              py: 0.5, 
              borderRadius: 1, 
              textTransform: 'capitalize',
              bgcolor: status === 'paid' ? 'success.light' : status === 'partial' ? 'warning.light' : 'error.light',
              color: status === 'paid' ? 'success.dark' : status === 'partial' ? 'warning.dark' : 'error.dark',
            }}
          >
            {status}
          </Typography>
        );
      }
    },
    { 
      field: 'items_count', 
      headerName: 'Items', 
      flex: 0.5, 
      type: 'number',
      valueGetter: (params: GridValueGetterParams<PurchaseRow, PurchaseRow>) => (Array.isArray(params.row?.purchase_items) ? params.row.purchase_items.length : 0)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams<PurchaseRow>) => {
        try {
          if (!params.row?.id) return null;
          
          return (
            <Box>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const q: Record<string, number> = {};
                    if (Array.isArray(params.row.purchase_items)) {
                      params.row.purchase_items.forEach((it: any) => {
                        if (it?.id) q[it.id] = 0;
                      });
                    }
                    setReturnQtys(q);
                    setReturningPurchase(params.row);
                  } catch (error) {
                    console.error('Error setting up return:', error);
                    toast.error('Failed to initiate return');
                  }
                }} 
                color="warning" 
                size="small" 
                title="Return"
              >
                <UndoIcon />
              </IconButton>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenForm(params.row);
                }} 
                color="primary" 
                size="small"
                title="Edit"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (window.confirm('Are you sure you want to delete this purchase?')) {
                      await handleDelete(params.row.id);
                    }
                  } catch (error) {
                    console.error('Error deleting purchase:', error);
                    toast.error('Failed to delete purchase');
                  }
                }} 
                color="error" 
                size="small"
                title="Delete"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        } catch (error) {
          console.error('Error rendering actions:', error);
          return null;
        }
      },
    },
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const renderFilterChips = () => {
    const chips = [];
    
    if (filters.status !== 'all') {
      chips.push({
        key: 'status',
        label: `Status: ${filters.status}`,
        onDelete: () => handleFilterChange('status', 'all')
      });
    }

    if (filters.supplier !== 'all') {
      const supplierName = suppliers.find(s => s.id === filters.supplier)?.name || 'Unknown';
      chips.push({
        key: 'supplier',
        label: `Supplier: ${supplierName}`,
        onDelete: () => handleFilterChange('supplier', 'all')
      });
    }

    if (filters.dateRange.start) {
      chips.push({
        key: 'startDate',
        label: `From: ${format(filters.dateRange.start, 'MMM d, yyyy')}`,
        onDelete: () => handleDateChange('start', null)
      });
    }

    if (filters.dateRange.end) {
      chips.push({
        key: 'endDate',
        label: `To: ${format(filters.dateRange.end, 'MMM d, yyyy')}`,
        onDelete: () => handleDateChange('end', null)
      });
    }

    if (filters.minAmount) {
      chips.push({
        key: 'minAmount',
        label: `Min: ₹${filters.minAmount}`,
        onDelete: () => handleFilterChange('minAmount', '')
      });
    }

    if (filters.maxAmount) {
      chips.push({
        key: 'maxAmount',
        label: `Max: ₹${filters.maxAmount}`,
        onDelete: () => handleFilterChange('maxAmount', '')
      });
    }

    if (chips.length === 0) return null;

    return (
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Active filters:
        </Typography>
        {chips.map(chip => (
          <Chip
            key={chip.key}
            label={chip.label}
            onDelete={chip.onDelete}
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
        <Button 
          size="small" 
          onClick={resetFilters}
          startIcon={<ClearIcon />}
          sx={{ ml: 'auto' }}
        >
          Clear all
        </Button>
      </Box>
    );
  };

  const renderFilters = () => (
    <Collapse in={showFilters} timeout="auto" unmountOnExit>
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search purchases"
              variant="outlined"
              size="small"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partial">Partially Paid</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Supplier</InputLabel>
              <Select
                value={filters.supplier}
                label="Supplier"
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
              >
                <MenuItem value="all">All Suppliers</MenuItem>
                {suppliers.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="From Date"
              value={filters.dateRange.start}
              onChange={(date) => handleDateChange('start', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  InputProps: {
                    startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'action.active' }} />
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="To Date"
              value={filters.dateRange.end}
              onChange={(date) => handleDateChange('end', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  InputProps: {
                    startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'action.active' }} />
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={resetFilters}
              startIcon={<ClearIcon />}
              size="small"
              sx={{ height: '40px' }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Collapse>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Purchases</Typography>
          <Typography variant="body2" color="text.secondary">Record and manage your stock purchases</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            endIcon={activeFilterCount() > 0 ? <Chip label={activeFilterCount()} size="small" color="primary" /> : null}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: '120px' }}
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenForm(null)} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Purchase'}
          </Button>
        </Stack>
      </Stack>

      {renderFilters()}
      {renderFilterChips()}

      <Paper sx={{ height: 600, width: '100%', position: 'relative' }}>
        <ErrorBoundary fallback={
          <Box p={3} textAlign="center">
            <Typography color="error" variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={fetchPurchases}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </Box>
        }>
          <DataGrid
            rows={filteredPurchases.length > 0 ? filteredPurchases : (Array.isArray(purchases) ? purchases : [])}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id || Math.random().toString(36).substr(2, 9)}
            slots={{
              toolbar: GridToolbar,
              noRowsOverlay: () => (
                <Stack height="100%" alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">
                    {loading ? 'Loading purchases...' : 'No purchase records found'}
                  </Typography>
                </Stack>
              ),
              loadingOverlay: () => <LinearProgress />,
              noResultsOverlay: () => (
                <Stack height="100%" alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">
                    No results found
                  </Typography>
                </Stack>
              ),
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'purchase_date', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            disableColumnMenu
            autoHeight={false}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                '&:focus': {
                  outline: 'none',
                },
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                },
              },
            }}
          />
            </ErrorBoundary>
      </Paper>
      
      {showForm && (
        <PurchaseForm
          purchase={editingPurchase}
          onClose={handleCloseForm}
          onSave={() => {
            fetchPurchases();
            handleCloseForm();
          }}
        />
      )}
      
      <Dialog 
        open={Boolean(returningPurchase)} 
        onClose={() => !savingReturn && setReturningPurchase(null)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Purchase Return</DialogTitle>
        <DialogContent dividers>
          {returningPurchase ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Returning items from purchase: {returningPurchase.invoice_number || 'N/A'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {returningPurchase.purchase_items?.length ? (
                  returningPurchase.purchase_items.map((item: any) => (
                    <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{item.product_name || 'Unknown Product'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Purchased: {item.quantity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          label="Return Qty"
                          fullWidth
                          InputProps={{ 
                            inputProps: { 
                              min: 0, 
                              max: item.quantity 
                            } 
                          }}
                          value={returnQtys[item.id] || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value >= 0 && value <= item.quantity) {
                              setReturnQtys(prev => ({
                                ...prev,
                                [item.id]: value
                              }));
                            } else if (e.target.value === '') {
                              const newQtys = { ...returnQtys };
                              delete newQtys[item.id];
                              setReturnQtys(newQtys);
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No items found for this purchase.
                  </Typography>
                )}
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setReturningPurchase(null)} 
            disabled={savingReturn}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={savingReturn || Object.keys(returnQtys).length === 0}
            onClick={async () => {
              if (!returningPurchase) return;
              try {
                setSavingReturn(true);
                const toReturn = (returningPurchase.purchase_items || [])
                  .filter((item: any) => Number(returnQtys[item.id] || 0) > 0);
                
                for (const item of toReturn) {
                  const qty = Number(returnQtys[item.id] || 0);
                  const payload = {
                    merchant_id: returningPurchase.merchant_id,
                    product_id: item.product_id,
                    transaction_type: 'purchase_return',
                    transaction_id: returningPurchase.id,
                    quantity_change: -qty,
                    created_at: new Date().toISOString(),
                  };
                  
                  const { error } = await supabase
                    .from('stock_movements')
                    .insert([payload]);
                    
                  if (error) throw error;
                }
                
                toast.success('Purchase return processed successfully');
                setReturnQtys({});
                setReturningPurchase(null);
                fetchPurchases();
              } catch (error: any) {
                console.error('Error processing return:', error);
                toast.error(error.message || 'Failed to process return');
              } finally {
                setSavingReturn(false);
              }
            }}
          >
            {savingReturn ? 'Processing...' : 'Save Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  </LocalizationProvider>
  );
}
