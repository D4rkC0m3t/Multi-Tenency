import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  LocalShipping as TruckIcon,
  Edit as EditIcon,
  Delete as Trash2Icon,
  Phone as PhoneIcon,
  Email as MailIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { supabase, Supplier } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SupplierForm } from './SupplierForm';
import toast from 'react-hot-toast';

export function SuppliersPage() {
  const { merchant } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (merchant) {
      fetchSuppliers();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchSuppliers = async () => {
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast.success('Supplier deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete supplier');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Suppliers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your product suppliers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => setShowForm(true)}
          sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="end">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search Suppliers"
                placeholder="Search by name, company, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <Grid container spacing={3}>
        {filteredSuppliers.map((supplier) => (
          <Grid item xs={12} md={6} lg={4} key={supplier.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                      <TruckIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {supplier.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.company_name}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingSupplier(supplier);
                        setShowForm(true);
                      }}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(supplier.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <Trash2Icon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  {supplier.contact_person && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <UserIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {supplier.contact_person}
                      </Typography>
                    </Stack>
                  )}
                  {supplier.phone && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {supplier.phone}
                      </Typography>
                    </Stack>
                  )}
                  {supplier.email && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {supplier.email}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Chip
                    label={supplier.is_active ? 'Active' : 'Inactive'}
                    color={supplier.is_active ? 'success' : 'default'}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Added {new Date(supplier.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredSuppliers.length === 0 && (
        <Box textAlign="center" py={8}>
          <TruckIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            No suppliers found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first supplier.'}
          </Typography>
        </Box>
      )}

      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          onSave={() => {
            fetchSuppliers();
            setShowForm(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </Box>
  );
}
