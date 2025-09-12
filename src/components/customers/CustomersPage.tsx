import { useEffect, useState } from 'react';
import { Add as AddIcon, Search as SearchIcon, People as PeopleIcon, Edit as EditIcon, Delete as DeleteIcon, Phone as PhoneIcon, Email as MailIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { supabase, Customer } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerForm } from './CustomerForm';
import toast from 'react-hot-toast';
import {
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Divider,
  CircularProgress,
} from '@mui/material';

export function CustomersPage() {
  const { merchant } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (merchant) {
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchCustomers = async () => {
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.village?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || customer.customer_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const customerTypes = ['farmer', 'retailer', 'wholesaler', 'distributor', 'individual'];

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={260}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">Manage your customer database</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>Add Customer</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <Select
            fullWidth
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as string)}
            displayEmpty
          >
            <MenuItem value="all">All Types</MenuItem>
            {customerTypes.map(type => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
            ))}
          </Select>
          <Box sx={{ minWidth: 240, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">Showing {filteredCustomers.length} of {customers.length} customers</Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {filteredCustomers.map((customer) => (
          <Grid item xs={12} md={6} lg={4} key={customer.id}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 1.5 }}>
                      <PeopleIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{customer.name}</Typography>
                      <Chip size="small" label={customer.customer_type} color="success" variant="outlined" />
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => { setEditingCustomer(customer); setShowForm(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(customer.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Stack spacing={1.0} sx={{ color: 'text.secondary' }}>
                  {customer.phone && (
                    <Stack direction="row" spacing={1} alignItems="center"><PhoneIcon fontSize="small" /> <Typography variant="body2">{customer.phone}</Typography></Stack>
                  )}
                  {customer.email && (
                    <Stack direction="row" spacing={1} alignItems="center"><MailIcon fontSize="small" /> <Typography variant="body2">{customer.email}</Typography></Stack>
                  )}
                  {customer.village && (
                    <Stack direction="row" spacing={1} alignItems="center"><LocationOnIcon fontSize="small" /> <Typography variant="body2">{customer.village}{customer.district ? `, ${customer.district}` : ''}</Typography></Stack>
                  )}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Outstanding Balance</Typography>
                    <Typography variant="subtitle2" color={customer.outstanding_balance > 0 ? 'error.main' : 'success.main'}>₹{customer.outstanding_balance.toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Credit Limit</Typography>
                    <Typography variant="subtitle2">₹{customer.credit_limit.toFixed(2)}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Chip size="small" label={customer.is_active ? 'Active' : 'Inactive'} color={customer.is_active ? 'success' : 'default'} variant={customer.is_active ? 'filled' : 'outlined'} />
                  <Typography variant="caption" color="text.secondary">Added {new Date(customer.created_at).toLocaleDateString()}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCustomers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PeopleIcon color="disabled" sx={{ fontSize: 48 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>No customers found</Typography>
          <Typography variant="caption" color="text.secondary">
            {searchTerm || selectedType !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first customer.'}
          </Typography>
        </Box>
      )}

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={() => {
            fetchCustomers();
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </Container>
  );
}
