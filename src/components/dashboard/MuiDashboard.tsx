import { Box, Container, Stack, Typography, Button, Card, CardContent, Chip, Fab, useTheme, Grid, CircularProgress, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardData, formatCurrency, formatDate, type TimeRange } from '../../lib/dashboardQueries';

const MuiDashboard = () => {
  const theme = useTheme();
  const { user, merchant, profile } = useAuth() as { user: any; merchant?: { id: string }; profile?: { full_name?: string; merchant_id?: string } };
  const primary = theme.palette.primary.main;
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface DashboardData {
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    lowStockItems: number;
    salesTrend: Array<{ date: string; amount: number }>;
    stockByCategory: Array<{ name: string; value: number }>;
    recentSales: Array<{
      id: string;
      invoice_number: string;
      sale_date: string;
      total_amount: number;
      payment_status: string;
      customers?: { name: string };
    }>;
    recentPurchases: Array<{
      id: string;
      invoice_number: string;
      purchase_date: string;
      total_amount: number;
      payment_status: string;
      suppliers?: { name: string };
    }>;
  }

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    salesTrend: [],
    stockByCategory: [],
    recentSales: [],
    recentPurchases: []
  });

  useEffect(() => {
    const loadData = async () => {
      const merchantId = merchant?.id || profile?.merchant_id;
      if (!merchantId) {
        // Merchant context not ready yet; do not show spinner
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.debug('[MuiDashboard] fetching dashboard data', { merchantId, timeRange });
        const timeoutMs = 15000; // 15s safety timeout
        const timer = setTimeout(() => {
          console.warn('[MuiDashboard] dashboard fetch timed out');
          setIsLoading(false);
          setError('Dashboard is taking longer than usual to load. Please retry or adjust filters.');
        }, timeoutMs);

        const data = await fetchDashboardData(merchantId, timeRange);
        setDashboardData(data);
        clearTimeout(timer);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        const msg = (err as any)?.message || 'Failed to load dashboard data. Please try again later.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeRange, merchant?.id, profile?.merchant_id]);

  const trendData = dashboardData.salesTrend.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    value: item.amount
  }));

  // Define columns for DataGrid
  const salesColumns = [
    { field: 'invoice_number', headerName: 'Invoice', flex: 1 },
    { field: 'customer', headerName: 'Customer', flex: 1, valueGetter: (params: any) => params?.row?.customers?.name ?? 'Walk-in' },
    { field: 'sale_date', headerName: 'Date', width: 120, valueFormatter: (params: any) => (params?.value ? formatDate(params.value) : '') },
    { field: 'total_amount', headerName: 'Amount', width: 120, valueFormatter: (params: any) => (params?.value != null ? formatCurrency(params.value) : '') },
    { field: 'payment_status', headerName: 'Status', width: 120 }
  ];

  const purchaseColumns = [
    { field: 'invoice_number', headerName: 'Invoice', flex: 1 },
    { field: 'supplier', headerName: 'Supplier', flex: 1, valueGetter: (params: any) => params?.row?.suppliers?.name ?? 'Unknown' },
    { field: 'purchase_date', headerName: 'Date', width: 120, valueFormatter: (params: any) => (params?.value ? formatDate(params.value) : '') },
    { field: 'total_amount', headerName: 'Amount', width: 120, valueFormatter: (params: any) => (params?.value != null ? formatCurrency(params.value) : '') },
    { field: 'payment_status', headerName: 'Status', width: 120 }
  ];

  const pieData = dashboardData.stockByCategory;
  
  const pieColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const kpis = [
    { label: 'Total Sales', value: dashboardData.totalSales, change: 12.5, format: (val: number) => val.toLocaleString() },
    { label: 'Revenue', value: dashboardData.totalRevenue, change: 8.3, format: formatCurrency },
    { label: 'Total Products', value: dashboardData.totalProducts, change: -2.1, format: (val: number) => val.toLocaleString() },
    { label: 'Low Stock Items', value: dashboardData.lowStockItems, change: -5.4, format: (val: number) => val.toString() },
  ];

  // DataGrid rows will use raw recentSales and recentPurchases from dashboardData directly

  if (!merchant?.id && !profile?.merchant_id) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 2 } }}>
        <Alert severity="info">Preparing your dashboard... please wait while we load your merchant context.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const salesRows = dashboardData.recentSales;
  const purchaseRows = dashboardData.recentPurchases;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_event, newRange) => newRange && setTimeRange(newRange)}
          aria-label="time range"
          size="small"
          sx={{
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              '&:not(:first-of-type)': {
                borderRadius: 1,
                marginLeft: 0.5,
              },
              '&:first-of-type': {
                borderRadius: 1,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          <ToggleButton value="7d">7D</ToggleButton>
          <ToggleButton value="30d">30D</ToggleButton>
          <ToggleButton value="90d">90D</ToggleButton>
          <ToggleButton value="1y">1Y</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{
            overflow: 'hidden',
            position: 'relative',
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.common.white,
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            backgroundImage: `
              radial-gradient(900px 320px at 85% 25%, rgba(56,189,248,0.25), transparent 60%),
              radial-gradient(700px 260px at 65% 72%, rgba(74,222,128,0.18), transparent 60%),
              linear-gradient(135deg, #0b1220 0%, #0a1624 50%, #0b1f30 100%)
            `,
          }}>
            <CardContent sx={{ position: 'relative', minHeight: 220 }}>
              <Box
                sx={{
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: { xs: '45%', sm: '40%' },
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))',
                  mixBlendMode: 'overlay',
                  opacity: 0.55,
                  filter: 'blur(0.5px)',
                  clipPath: 'polygon(24% 0, 100% 0, 100% 100%, 0 100%)',
                }}
              />
              <Box
                sx={{
                  pointerEvents: 'none',
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.06,
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 14px)`,
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    Welcome back, {profile?.full_name || 'User'}! {['🌱', '🌾', '🌿', '🌻'][Math.floor(Math.random() * 4)]}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {dashboardData.totalSales > 0 
                      ? `You've made ${dashboardData.totalSales} sales in the last ${timeRange}. Keep up the great work!`
                      : 'No sales data available for the selected period.'}
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                    <Chip
                      icon={<TrendingUpIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.common.white }} />}
                      label="Top Performer"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.common.white,
                      }}
                    />
                    <Chip
                      label="+2.6% this week"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.common.white,
                      }}
                    />
                  </Stack>
                  <Button variant="contained" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.16)', borderRadius: 2, px: 2.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>View Profile</Button>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 320 }, height: 160, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)' }} />
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
                      <defs>
                        <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#ffffff" fillOpacity={1} fill="url(#gradPrimary)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', right: -8, bottom: -6, width: 110, height: 110, opacity: 0.95 }}>
                    <img
                      src="https://cdn.jsdelivr.net/gh/alohe/brand-assets/placeholders/mascot-1.png"
                      alt="mascot"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.045)' : '#0e1726',
            color: theme.palette.mode === 'dark' ? undefined : theme.palette.common.white,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Special Offer</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>Boost seasonal sales by 15%</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>Run targeted campaigns and manage inventory better with smart alerts.</Typography>
              <Box sx={{ width: '100%', height: 120, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)'} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke={primary} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Button variant="contained" sx={{ mt: 1 }}>Learn More</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {kpis.map((kpi) => (
              <Grid key={kpi.label} item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#0e1726',
                  color: theme.palette.mode === 'dark' ? undefined : theme.palette.common.white,
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)' },
                }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 0.2 }}>{kpi.label}</Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                        {kpi.format ? kpi.format(kpi.value) : kpi.value}
                      </Typography>
                      <Chip
                        size="small"
                        icon={kpi.change >= 0 ? <ArrowUpwardIcon color="success" /> : <ArrowDownwardIcon color="error" />}
                        label={`${kpi.change >= 0 ? '+' : ''}${kpi.change}%`}
                        sx={{
                          fontWeight: 600,
                          bgcolor: kpi.change >= 0 ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)',
                          color: kpi.change >= 0 ? theme.palette.success.main : theme.palette.error.main,
                          borderRadius: 1,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#0e1726',
            color: theme.palette.mode === 'dark' ? undefined : theme.palette.common.white,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)'}`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>Inventory Trend</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {timeRange === '7d' ? 'Last 7 days' : 
                   timeRange === '30d' ? 'Last 30 days' :
                   timeRange === '90d' ? 'Last 90 days' : 'Last 12 months'}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)'} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
                    <Line type="monotone" dataKey="value" stroke={primary} strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#0e1726',
            color: theme.palette.mode === 'dark' ? undefined : '#fff',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)'}`,
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Stock by Category
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  ({dashboardData.stockByCategory.length} categories)
                </Typography>
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={92} paddingAngle={4}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: theme.palette.text.secondary }} />
                    <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tables Row */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Recent Sales
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  (Last 5 transactions)
                </Typography>
              </Typography>
              <div style={{ height: 360, minHeight: 360, width: '100%' }}>
                <DataGrid
                  rows={salesRows || []}
                  columns={salesColumns}
                  getRowId={(row: any) => row.id}
                  pageSizeOptions={[5]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                  density="compact"
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  sx={{
                    height: '100%',
                    border: 0,
                    '& .MuiDataGrid-columnHeaders': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)' },
                    '& .MuiDataGrid-row:hover': { bgcolor: theme.palette.action.hover },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Recent Purchases
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  (Last 5 transactions)
                </Typography>
              </Typography>
              <div style={{ height: 360, minHeight: 360, width: '100%' }}>
                <DataGrid
                  rows={purchaseRows || []}
                  columns={purchaseColumns}
                  getRowId={(row: any) => row.id}
                  pageSizeOptions={[5]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                  density="compact"
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  sx={{
                    height: '100%',
                    border: 0,
                    '& .MuiDataGrid-columnHeaders': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)' },
                    '& .MuiDataGrid-row:hover': { bgcolor: theme.palette.action.hover },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Add Button */}
      <Fab color="primary" sx={{ position: 'fixed', right: 24, bottom: 24 }} aria-label="add">
        <AddIcon />
      </Fab>
    </Container>
  );
}

export default MuiDashboard;
export { MuiDashboard };
