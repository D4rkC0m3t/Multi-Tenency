import { useCallback, useEffect, useState } from 'react';
import { Add as AddIcon, Search as SearchIcon, FolderOpen as FolderOpenIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase, Category } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CategoryForm } from './CategoryForm';
import toast from 'react-hot-toast';
import {
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';

export function CategoriesPage() {
  const { merchant } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = useCallback(async () => {
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [merchant]);

  useEffect(() => {
    if (merchant) {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [merchant, fetchCategories]);
  

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all products in this category.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Typography variant="h4" fontWeight={800}>Categories</Typography>
          <Typography variant="body2" color="text.secondary">Organize your products into categories</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>Add Category</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ maxWidth: 520 }}>
          <TextField
            fullWidth
            label="Search Categories"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} md={6} lg={4} key={category.id}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: 'success.light', color: 'success.main', borderRadius: 1.5 }}>
                      <FolderOpenIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{category.description || 'No description'}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => { setEditingCategory(category); setShowForm(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(category.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                  <Chip size="small" label={category.is_active ? 'Active' : 'Inactive'} color={category.is_active ? 'success' : 'default'} variant={category.is_active ? 'filled' : 'outlined'} />
                  <Typography variant="caption" color="text.secondary">Created {new Date(category.created_at).toLocaleDateString()}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCategories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FolderOpenIcon color="disabled" sx={{ fontSize: 48 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>No categories found</Typography>
          <Typography variant="caption" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first product category.'}
          </Typography>
        </Box>
      )}

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSave={() => {
            fetchCategories();
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </Container>
  );
}
