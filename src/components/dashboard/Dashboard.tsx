import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Container,
  TextField,
  InputAdornment,
  Fab,
  Avatar,
} from '@mui/material';
import {
  Inventory as PackageIcon,
  People as UsersIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Warning as AlertTriangleIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  monthlySales: number;
  lowStockProducts: number;
  expiringProducts: number;
}

export function Dashboard() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    monthlySales: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (merchant) {
      fetchDashboardStats();
      fetchRecentSales();
      fetchRecentPurchases();
      fetchProductsLite();
      fetchCategoriesLite();
      fetchCustomersLite();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchDashboardStats = async () => {
    if (!merchant) return;

    try {
      // Fetch all stats in parallel
      const [
        productsResult,
        customersResult,
        salesResult,
        monthlySalesResult,
        lowStockResult,
        expiringResult,
      ] = await Promise.all([
        supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('merchant_id', merchant.id)
          .eq('status', 'active'),
        
        supabase
          .from('customers')
          .select('id', { count: 'exact' })
          .eq('merchant_id', merchant.id)
          .eq('is_active', true),
        
        supabase
          .from('sales')
          .select('total_amount')
          .eq('merchant_id', merchant.id),
        
        supabase
          .from('sales')
          .select('total_amount')
          .eq('merchant_id', merchant.id)
          .gte('sale_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        
        supabase
          .rpc('get_low_stock_count', { merchant_id_param: merchant.id }),
        
        supabase
          .rpc('get_expiring_products_count', { merchant_id_param: merchant.id, days_ahead: 30 }),
      ]);

      const totalSalesAmount = salesResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const monthlySalesAmount = monthlySalesResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalCustomers: customersResult.count || 0,
        totalSales: totalSalesAmount,
        monthlySales: monthlySalesAmount,
        lowStockProducts: lowStockResult.data || 0,
        expiringProducts: expiringResult.data || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesLite = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true);
      if (error) throw error;
      setCategories(data || []);
    } catch (e) {
      console.error('Categories load failed', e);
    }
  };

  const fetchRecentPurchases = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('id, total_amount, created_at, supplier:suppliers(id,name)')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentPurchases(data || []);
    } catch (e) {
      console.error('Recent purchases load failed', e);
    }
  };

  const fetchRecentSales = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('id, invoice_number, total_amount, sale_date')
        .eq('merchant_id', merchant.id)
        .order('sale_date', { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentSales(data || []);
    } catch (e) {
      console.error('Recent sales load failed', e);
    }
  };

  const fetchProductsLite = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, current_stock, minimum_stock, unit')
        .eq('merchant_id', merchant.id)
        .eq('status', 'active');
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error('Products load failed', e);
    }
  };

  const fetchCustomersLite = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true);
      if (error) throw error;
      setCustomers(data || []);
    } catch (e) {
      console.error('Customers load failed', e);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: PackageIcon,
      color: '#2563eb', // Blue
      bgColor: '#dbeafe',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UsersIcon,
      color: '#059669', // Emerald
      bgColor: '#d1fae5',
    },
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toFixed(2)}`,
      icon: TrendingUpIcon,
      color: '#dc2626', // Red
      bgColor: '#fee2e2',
    },
    {
      title: 'Monthly Sales',
      value: `₹${stats.monthlySales.toFixed(2)}`,
      icon: ShoppingCartIcon,
      color: '#7c3aed', // Violet
      bgColor: '#ede9fe',
    },
  ];

  // Search functionality
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const searchTerm = query.toLowerCase();
    return products.filter((p: any) => 
      (p.name && p.name.toLowerCase().includes(searchTerm)) ||
      (p.unit && p.unit.toLowerCase().includes(searchTerm)) ||
      searchTerm === 'products' || searchTerm === 'product'
    );
  }, [products, query]);

  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return customers;
    const searchTerm = query.toLowerCase();
    return customers.filter((c: any) => 
      (c.name && c.name.toLowerCase().includes(searchTerm)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      searchTerm === 'customers' || searchTerm === 'customer'
    );
  }, [customers, query]);

  const filteredSales = useMemo(() => {
    if (!query.trim()) return recentSales;
    const searchTerm = query.toLowerCase();
    return recentSales.filter((s: any) => 
      (s.invoice_number && s.invoice_number.toLowerCase().includes(searchTerm)) ||
      searchTerm === 'sales' || searchTerm === 'sale'
    );
  }, [recentSales, query]);

  // Derived: low stock list and category distribution for charts
  const lowStockList = useMemo(() => {
    const baseProducts = query.trim() ? filteredProducts : products;
    return (baseProducts || []).filter((p: any) => Number(p.current_stock) <= Number(p.minimum_stock)).slice(0, 6);
  }, [products, filteredProducts, query]);

  const categoryDistribution = useMemo(() => {
    const baseProducts = query.trim() ? filteredProducts : products;
    const map = new Map<string, number>();
    for (const p of baseProducts) {
      const key = p.category_id || 'uncat';
      map.set(key, (map.get(key) || 0) + 1);
    }
    const nameById = new Map<string, string>(categories.map((c:any)=>[c.id, c.name]));
    const arr = Array.from(map.entries()).map(([id, value]) => ({ name: nameById.get(id) || 'Uncategorized', value }));
    return arr.length ? arr : [{ name: 'No Data', value: 1 }];
  }, [products, filteredProducts, categories, query]);
  const COLORS = ['#16a34a', '#0284c7', '#9333ea', '#f59e0b', '#ef4444', '#0ea5e9'];

  // Dummy inventory trend from monthlySales; In real, fetch by month
  const trendData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const currentMonth = now.getMonth();
    return months.map((m, i) => ({ month: m, value: i === currentMonth ? stats.monthlySales : Math.max(0, stats.monthlySales * (0.6 + 0.4 * Math.sin(i))) }));
  }, [stats.monthlySales]);

  const alertCards = [
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProducts,
      description: 'Products below minimum stock',
      icon: AlertTriangleIcon,
      severity: 'error' as const,
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringProducts,
      description: 'Products expiring in 30 days',
      icon: CalendarIcon,
      severity: 'warning' as const,
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with search, notifications, avatar */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={{ xs: 3, md: 2 }} 
        alignItems={{ xs: 'stretch', md: 'center' }} 
        justifyContent="space-between" 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            KrishiSethu Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your inventory and sales performance
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField 
            size="small" 
            placeholder="Search products, customers, sales..." 
            value={query} 
            onChange={(e)=>setQuery(e.target.value)} 
            sx={{ minWidth: 300 }}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ) 
            }} 
          />
        </Stack>
      </Stack>

      {/* Search Results Indicator */}
      {query.trim() && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Showing search results for "{query}" - Found {filteredProducts.length} products, {filteredCustomers.length} customers, {filteredSales.length} sales
            </Typography>
          </Alert>
        </Box>
      )}

      {/* KPI / Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <Avatar sx={{ 
                    bgcolor: card.bgColor, 
                    color: card.color, 
                    width: 60, 
                    height: 60,
                    '& svg': { fontSize: 28 }
                  }}>
                    <card.icon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color={card.color}>
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: 2,
            height: '100%'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Inventory Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: 2,
            height: '100%'
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Stock by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" outerRadius={100}>
                    {categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {alertCards.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Alert severity={card.severity} sx={{ p: 3, borderRadius: 2 }}>
              <AlertTitle>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <card.icon />
                  <Typography variant="h6" component="span" fontWeight="bold">
                    {card.title}
                  </Typography>
                </Stack>
              </AlertTitle>
              <Typography variant="h4" fontWeight="bold" sx={{ my: 1.5 }}>
                {card.value}
              </Typography>
              <Typography variant="body2">
                {card.description}
              </Typography>
            </Alert>
          </Grid>
        ))}
      </Grid>

      {/* Low Stock and Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                Low Stock Items
              </Typography>
              {lowStockList.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  All good! No items at or below minimum stock.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {lowStockList.map((p) => (
                    <Stack 
                      key={p.id} 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {p.name}
                      </Typography>
                      <Chip 
                        label={`Stock: ${p.current_stock} / Min: ${p.minimum_stock}`} 
                        color="error" 
                        size="small" 
                      />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ 
                      p: 2.5, 
                      height: 'auto', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }} 
                    onClick={() => navigate('/products')}
                  >
                    <PackageIcon sx={{ color: 'success.main', mb: 1, fontSize: 32 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                      Add New Product
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Add products to inventory
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ 
                      p: 2.5, 
                      height: 'auto', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }} 
                    onClick={() => navigate('/pos')}
                  >
                    <ShoppingCartIcon sx={{ color: 'primary.main', mb: 1, fontSize: 32 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                      Create Sale
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Record a new sale
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ 
                      p: 2.5, 
                      height: 'auto', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }} 
                    onClick={() => navigate('/customers')}
                  >
                    <UsersIcon sx={{ color: 'secondary.main', mb: 1, fontSize: 32 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                      Add Customer
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Register new customer
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Sales & Purchases */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                {query.trim() ? `Sales Results (${filteredSales.length})` : 'Recent Sales'}
              </Typography>
              {filteredSales.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {query.trim() ? 'No sales found matching your search.' : 'No recent sales.'}
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {filteredSales.slice(0, 5).map((s) => (
                    <Card 
                      key={s.id} 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: 1,
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {s.invoice_number}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={700} color="success.main">
                            ₹{Number(s.total_amount || 0).toFixed(2)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(s.sale_date).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                Recent Purchases
              </Typography>
              {recentPurchases.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent purchases.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {recentPurchases.map((p) => (
                    <Card 
                      key={p.id} 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: 1,
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {p.supplier?.name || 'Supplier'}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                            ₹{Number(p.total_amount || 0).toFixed(2)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(p.created_at).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => navigate('/products')}>
        <AddIcon />
      </Fab>
    </Container>
  );
}
