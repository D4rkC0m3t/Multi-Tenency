import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Avatar,
  Badge,
  Fade,
  Slide,
  useTheme,
  alpha,
  styled,
  keyframes
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  LocalGroceryStore as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Product, Customer } from '../../types';
import toast from 'react-hot-toast';

// Styled Components for Modern UI
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const FloatingActionButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  zIndex: 1000,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Enhanced POS Page Component
const ModernPOSPage = () => {
  const { merchant } = useAuth();
  const theme = useTheme();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch data
  const fetchData = async () => {
    if (!merchant) return;
    
    try {
      setLoading(true);
      const [productsRes, customersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(id, name)')
          .eq('merchant_id', merchant.id)
          .eq('status', 'active'),
        supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('is_active', true)
      ]);
      
      if (productsRes.error) throw productsRes.error;
      if (customersRes.error) throw customersRes.error;
      
      setProducts(productsRes.data || []);
      setCustomers(customersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchant) {
      fetchData();
    }
  }, [merchant]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || product.category?.name === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = (product.current_stock || 0) > 0;
      else if (stockFilter === 'low_stock') matchesStock = (product.current_stock || 0) <= (product.minimum_stock || 0);
      else if (stockFilter === 'out_of_stock') matchesStock = (product.current_stock || 0) <= 0;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return (a.sale_price || 0) - (b.sale_price || 0);
        case 'price_high': return (b.sale_price || 0) - (a.sale_price || 0);
        case 'stock': return (b.current_stock || 0) - (a.current_stock || 0);
        default: return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.current_stock) {
        toast.error(`Insufficient stock for ${product.name}`);
        return;
      }
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.current_stock <= 0) {
        toast.error(`No stock available for ${product.name}`);
        return;
      }
      setCart(prevCart => [...prevCart, { product, quantity: 1 }]);
    }
    
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart(cart.filter(item => item.product.id !== productId));
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.current_stock) {
      toast.error(`Insufficient stock for ${product.name}`);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * (item.product.sale_price || 0)), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 300 }}>
            Loading POS System...
          </Typography>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            mx: 'auto'
          }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative'
    }}>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              🛒 Modern Point of Sale
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Smart inventory management for {merchant?.name || 'Your Business'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={cart.length} color="error">
              <IconButton 
                onClick={() => setShowCart(!showCart)}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <CartIcon />
              </IconButton>
            </Badge>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          {/* Search and Filters */}
          <ModernCard sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <SearchIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Product Search & Filters
              </Typography>
            </Box>
            
            <ModernTextField
              fullWidth
              placeholder="🔍 Search products by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {[...new Set(products.map(p => p.category?.name).filter(Boolean))].map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  label="Stock Status"
                >
                  <MenuItem value="all">All Stock</MenuItem>
                  <MenuItem value="in_stock">✅ In Stock</MenuItem>
                  <MenuItem value="low_stock">⚠️ Low Stock</MenuItem>
                  <MenuItem value="out_of_stock">❌ Out of Stock</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="name">Name A→Z</MenuItem>
                  <MenuItem value="price_low">Price Low→High</MenuItem>
                  <MenuItem value="price_high">Price High→Low</MenuItem>
                  <MenuItem value="stock">Stock High→Low</MenuItem>
                </Select>
              </FormControl>
              
              <Chip 
                label={`${filteredProducts.length} products`}
                color="primary"
                variant="outlined"
                sx={{ ml: 'auto', alignSelf: 'center' }}
              />
            </Box>
          </ModernCard>

          {/* Products Grid */}
          <Grid container spacing={3}>
            {filteredProducts.map((product, index) => {
              const isLowStock = (product.current_stock || 0) <= (product.minimum_stock || 0);
              const isOutOfStock = (product.current_stock || 0) <= 0;
              const isFavorite = favorites.includes(product.id);
              const cartItem = cart.find(item => item.product.id === product.id);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Fade in timeout={300 + index * 100}>
                    <ModernCard sx={{ 
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Stock Status Badge */}
                      {isLowStock && !isOutOfStock && (
                        <Chip 
                          label="Low Stock" 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            zIndex: 2,
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontWeight: 600
                          }} 
                        />
                      )}
                      
                      {isOutOfStock && (
                        <Chip 
                          label="Out of Stock" 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            zIndex: 2,
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            fontWeight: 600
                          }} 
                        />
                      )}

                      {/* Favorite Button */}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'white' }
                        }}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                      </IconButton>
                      
                      {/* Product Image */}
                      <Box sx={{ 
                        height: 200,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2
                      }}>
                        <CardMedia
                          component="img"
                          image={product.image_path || '/api/placeholder/200/200'}
                          alt={product.name}
                          sx={{ 
                            objectFit: 'contain',
                            maxHeight: '100%',
                            maxWidth: '100%',
                            borderRadius: 2
                          }}
                        />
                      </Box>
                      
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          mb: 1,
                          color: '#1e293b',
                          lineHeight: 1.2
                        }}>
                          {product.name}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: '#64748b',
                          mb: 2,
                          fontSize: '0.875rem'
                        }}>
                          SKU: {product.sku || 'N/A'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <InventoryIcon sx={{ fontSize: 16, mr: 1, color: isLowStock ? '#dc2626' : '#10b981' }} />
                          <Typography variant="body2" sx={{ 
                            color: isLowStock ? '#dc2626' : '#10b981',
                            fontWeight: 600
                          }}>
                            Stock: {product.current_stock} {product.unit}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 800,
                            color: '#059669',
                            fontSize: '1.5rem'
                          }}>
                            ₹{product.sale_price || 0}
                          </Typography>
                          <Chip 
                            label={product.category?.name || 'General'} 
                            size="small"
                            sx={{ 
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              fontWeight: 600
                            }}
                          />
                        </Box>

                        {/* Quantity Controls or Add Button */}
                        {cartItem ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                              sx={{ 
                                backgroundColor: '#f1f5f9',
                                '&:hover': { backgroundColor: '#e2e8f0' }
                              }}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ 
                              minWidth: 40, 
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '1.1rem'
                            }}>
                              {cartItem.quantity}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                              disabled={cartItem.quantity >= product.current_stock}
                              sx={{ 
                                backgroundColor: '#f1f5f9',
                                '&:hover': { backgroundColor: '#e2e8f0' }
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => removeFromCart(product.id)}
                              sx={{ 
                                ml: 'auto',
                                color: '#dc2626',
                                '&:hover': { backgroundColor: '#fee2e2' }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <GradientButton
                            fullWidth
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock}
                            startIcon={<AddIcon />}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </GradientButton>
                        )}
                      </CardContent>
                    </ModernCard>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Cart Sidebar */}
        <Slide direction="left" in={showCart} mountOnEnter unmountOnExit>
          <Paper sx={{ 
            width: 400,
            height: 'calc(100vh - 120px)',
            position: 'sticky',
            top: 20,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                🛒 Shopping Cart
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {cart.length} items
              </Typography>
            </Box>
            
            <Box sx={{ p: 3, height: 'calc(100% - 120px)', overflow: 'auto' }}>
              {cart.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: '#64748b'
                }}>
                  <CartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Your cart is empty
                  </Typography>
                  <Typography variant="body2">
                    Add products to get started
                  </Typography>
                </Box>
              ) : (
                <>
                  {cart.map((item) => (
                    <Card key={item.product.id} sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={item.product.image_path}
                            sx={{ width: 48, height: 48 }}
                          >
                            <StoreIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              ₹{item.product.sale_price} × {item.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                            ₹{(item.product.sale_price || 0) * item.quantity}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">GST (18%):</Typography>
                      <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                        ₹{total.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <GradientButton
                      fullWidth
                      size="large"
                      startIcon={<ReceiptIcon />}
                      onClick={() => {
                        // Handle checkout
                        toast.success('Checkout functionality coming soon!');
                      }}
                    >
                      Complete Sale
                    </GradientButton>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Slide>
      </Box>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCart(!showCart)}>
        <CartIcon />
      </FloatingActionButton>
    </Box>
  );
};

export default ModernPOSPage;
