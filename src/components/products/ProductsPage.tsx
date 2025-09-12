import { useEffect, useState } from 'react';
import { Add as AddIcon, Search as SearchIcon, Inventory as InventoryIcon, Edit as EditIcon, Delete as DeleteIcon, SelectAll as SelectAllIcon, DeleteSweep as BulkDeleteIcon } from '@mui/icons-material';
import { supabase, Product, Category } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductForm } from './ProductForm';
import toast from 'react-hot-toast';
import {
  Container,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControl,
  InputLabel,
  Toolbar,
} from '@mui/material';

export function ProductsPage() {
  const { merchant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkOperating, setBulkOperating] = useState(false);

  useEffect(() => {
    if (merchant) {
      fetchProducts();
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchProducts = async () => {
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      // Categories are optional, fail silently
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) return;

    setBulkOperating(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;
      
      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete products');
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'discontinued' | 'out_of_stock') => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    setBulkOperating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .in('id', selectedProducts);

      if (error) throw error;
      
      setProducts(products.map(p => 
        selectedProducts.includes(p.id) ? { ...p, status } : p
      ));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update products');
    } finally {
      setBulkOperating(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (product.current_stock <= 0) return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (product.current_stock <= product.minimum_stock) return { status: 'low-stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (daysUntilExpiry <= 30) return { status: 'expiring-soon', color: 'text-orange-600', bg: 'bg-orange-100' };
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={260}>
        <Typography variant="body2" color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your inventory products</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => {
            // Export filtered products to CSV
            const header = ['name','sku','unit','cost_price','sale_price','current_stock','minimum_stock','brand','category','batch_number','expiry_date','hsn_code','manufacturer','packing_details','importing_company'];
            const lines = filteredProducts.map((p:any) => [
              p.name || '',
              p.sku || '',
              p.unit || '',
              p.cost_price ?? '',
              p.sale_price ?? '',
              p.current_stock ?? '',
              p.minimum_stock ?? '',
              p.brand || '',
              (p as any).category?.name || '',
              p.batch_number || '',
              p.expiry_date || '',
              p.hsn_code || '',
              p.manufacturer || '',
              p.packing_details || '',
              p.importing_company || ''
            ]);
            const csv = [header, ...lines].map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = 'products_export.csv'; link.click(); URL.revokeObjectURL(url);
          }}>Export CSV</Button>
          <Button variant="outlined" onClick={()=>{ setImportPreview([]); setImportOpen(true); }}>Import CSV</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>Add Product</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <Select
            fullWidth
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as string)}
            displayEmpty
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
            ))}
          </Select>
          <Box sx={{ minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">Showing {filteredProducts.length} of {products.length} products</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Bulk Operations Toolbar */}
      {selectedProducts.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
          <Toolbar sx={{ px: 0 }}>
            <Typography variant="subtitle1" sx={{ flex: '1 1 100%' }}>
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkStatusUpdate('active')}
                disabled={bulkOperating}
              >
                Mark Active
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkStatusUpdate('discontinued')}
                disabled={bulkOperating}
              >
                Mark Discontinued
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<BulkDeleteIcon />}
                onClick={handleBulkDelete}
                disabled={bulkOperating}
              >
                Delete Selected
              </Button>
            </Stack>
          </Toolbar>
        </Paper>
      )}

      <Paper sx={{ overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                  checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all products' }}
                />
              </TableCell>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              const expiryStatus = getExpiryStatus(product.expiry_date);
              return (
                <TableRow key={product.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      inputProps={{ 'aria-labelledby': `product-${product.id}` }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.3}>
                      <Typography variant="body2" fontWeight={700}>{product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{product.brand || '—'}</Typography>
                      {product.batch_number && (
                        <Typography variant="caption" color="text.disabled">Batch: {product.batch_number}</Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{product.sku || '—'}</TableCell>
                  <TableCell>{(product as any).category?.name || '—'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={`${product.current_stock} ${product.unit}`} color={stockStatus.status === 'in-stock' ? 'success' : stockStatus.status === 'low-stock' ? 'warning' : 'error'} variant={stockStatus.status === 'in-stock' ? 'filled' : 'outlined'} />
                      {expiryStatus && (
                        <Chip size="small" label={expiryStatus.status === 'expired' ? 'Expired' : 'Expiring'} color={expiryStatus.status === 'expired' ? 'error' : 'warning'} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">₹{product.sale_price}</Typography>
                    <Typography variant="caption" color="text.secondary">Cost: ₹{product.cost_price}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={product.status} color={product.status === 'active' ? 'success' : product.status === 'discontinued' ? 'error' : 'default'} variant={product.status === 'active' ? 'filled' : 'outlined'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => { setEditingProduct(product); setShowForm(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InventoryIcon color="disabled" sx={{ fontSize: 48 }} />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>No products found</Typography>
            <Typography variant="caption" color="text.secondary">
              {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first product.'}
            </Typography>
          </Box>
        )}
      </Paper>

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            fetchProducts();
            fetchCategories();
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <Dialog open={importOpen} onClose={()=>!importing && setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Products (CSV)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Expected columns (header row): name, sku, unit, cost_price, sale_price, current_stock, minimum_stock, brand, category, batch_number, expiry_date, hsn_code, manufacturer, packing_details, importing_company
            </Typography>
            <input type="file" accept=".csv,text/csv" onChange={(e)=>{
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const text = String(reader.result || '');
                  const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean);
                  const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g,'').trim().toLowerCase());
                  const idx = (k:string)=> headers.indexOf(k);
                  const items = rows.map(line => {
                    const cols = line.match(/([^",]+|"[^"]*")+/g) || [];
                    const val = (i:number) => (cols[i]||'').replace(/^"|"$/g,'').trim();
                    return {
                      name: val(idx('name')),
                      sku: val(idx('sku')),
                      unit: val(idx('unit')) || 'piece',
                      cost_price: Number(val(idx('cost_price'))||0),
                      sale_price: Number(val(idx('sale_price'))||0),
                      current_stock: Number(val(idx('current_stock'))||0),
                      minimum_stock: Number(val(idx('minimum_stock'))||0),
                      brand: val(idx('brand')),
                      category_name: val(idx('category')),
                      batch_number: val(idx('batch_number')),
                      expiry_date: val(idx('expiry_date')),
                      hsn_code: val(idx('hsn_code')),
                      manufacturer: val(idx('manufacturer')),
                      packing_details: val(idx('packing_details')),
                      importing_company: val(idx('importing_company')),
                    };
                  }).filter(it=>it.name);
                  setImportPreview(items);
                  toast.success(`Parsed ${items.length} rows`);
                } catch (err:any) {
                  toast.error('Failed to parse CSV');
                }
              };
              reader.readAsText(file);
            }} />
            {importPreview.length > 0 && (
              <Typography variant="body2">Ready to import: {importPreview.length} products</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setImportOpen(false)} disabled={importing}>Cancel</Button>
          <Button variant="contained" disabled={importing || importPreview.length===0} onClick={async ()=>{
            try {
              setImporting(true);
              // Build SKU map to decide update vs insert
              const skus = Array.from(new Set(importPreview.map(r=>r.sku).filter(Boolean)));
              let existing:any[] = [];
              if (skus.length) {
                const { data, error } = await supabase
                  .from('products')
                  .select('id, sku')
                  .eq('merchant_id', merchant?.id)
                  .in('sku', skus as any);
                if (error) throw error;
                existing = data || [];
              }
              const existsBySku = new Map(existing.map(r=>[r.sku, r.id]));
              // Resolve category names to ids (best-effort)
              const names = Array.from(new Set(importPreview.map(r=>r.category_name).filter(Boolean)));
              let catMap = new Map<string,string>();
              if (names.length) {
                const { data:cats } = await supabase
                  .from('categories')
                  .select('id,name')
                  .eq('merchant_id', merchant?.id)
                  .in('name', names as any);
                (cats||[]).forEach((c:any)=>catMap.set(c.name, c.id));
              }
              // Insert or update
              for (const r of importPreview) {
                const payload:any = {
                  merchant_id: merchant?.id,
                  name: r.name,
                  sku: r.sku || null,
                  unit: r.unit || 'piece',
                  cost_price: Number(r.cost_price||0),
                  sale_price: Number(r.sale_price||0),
                  current_stock: Number(r.current_stock||0),
                  minimum_stock: Number(r.minimum_stock||0),
                  brand: r.brand || null,
                  category_id: r.category_name ? (catMap.get(r.category_name)||null) : null,
                  batch_number: r.batch_number || null,
                  expiry_date: r.expiry_date || null,
                  hsn_code: r.hsn_code || null,
                  manufacturer: r.manufacturer || null,
                  packing_details: r.packing_details || null,
                  importing_company: r.importing_company || null,
                  status: 'active',
                  updated_at: new Date().toISOString(),
                };
                const existingId = r.sku ? existsBySku.get(r.sku) : null;
                if (existingId) {
                  const { error } = await supabase.from('products').update(payload).eq('id', existingId);
                  if (error) throw error;
                } else {
                  const { error } = await supabase.from('products').insert([{ ...payload, created_at: new Date().toISOString() }]);
                  if (error) throw error;
                }
              }
              toast.success('Import completed');
              setImportOpen(false); setImportPreview([]);
              fetchProducts();
            } catch (e:any) {
              toast.error(e.message || 'Import failed');
            } finally {
              setImporting(false);
            }
          }}>Import</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
