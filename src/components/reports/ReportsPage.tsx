import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  Divider,
  Container,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  ShoppingCart as ShoppingCartIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import { downloadReportPDF, previewReportPDF, type ReportPDFData } from '../../lib/reportPdfGenerator';

interface ReportData {
  salesSummary: {
    totalRevenue: number;
    totalSales: number;
    avgSaleValue: number;
  };
  salesTrend: { date: string; sales: number }[];
  topProducts: { name: string; quantity: number }[];
  stockSummary: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  profitSummary: {
    grossProfit: number;
    cogs: number;
    profitMargin: number;
    totalPurchases: number;
    purchaseCount: number;
  };
  // Additional data for Products and GST reports
  productsData?: any[];
  salesDataWithGst?: any[];
  gstSummary?: {
    totalTaxCollected: number;
    totalTaxableAmount: number;
    avgTaxRate: number;
    gstByHsn: any[];
  };
  gstByHsn?: any[];
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  trend?: string;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          <Icon />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" color="success.main">
              {trend}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export function ReportsPage() {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      customerId: '',
      supplierId: '',
      reportType: 'performance',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const customerId = watch('customerId');
  const supplierId = watch('supplierId');
  const reportType = watch('reportType');

  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  const createSampleData = async () => {
    if (!merchant) return;
    
    try {
      toast.loading('Creating sample data...');
      
      // Create sample categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert([
          { name: 'Fertilizers', merchant_id: merchant.id },
          { name: 'Seeds', merchant_id: merchant.id }
        ])
        .select();
      
      if (categoryError) throw categoryError;
      
      // Create sample products
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([
          {
            name: 'NPK Fertilizer 20-20-20',
            cost_price: 850,
            selling_price: 1000,
            current_stock: 50,
            minimum_stock: 10,
            hsn_code: '31051000',
            manufacturer: 'Coromandel International',
            category_id: categoryData?.[0]?.id,
            merchant_id: merchant.id
          },
          {
            name: 'Urea Fertilizer',
            cost_price: 600,
            selling_price: 720,
            current_stock: 100,
            minimum_stock: 20,
            hsn_code: '31021000',
            manufacturer: 'IFFCO',
            category_id: categoryData?.[0]?.id,
            merchant_id: merchant.id
          },
          {
            name: 'Wheat Seeds HD-2967',
            cost_price: 45,
            selling_price: 55,
            current_stock: 200,
            minimum_stock: 50,
            hsn_code: '10019900',
            manufacturer: 'Punjab Agricultural University',
            category_id: categoryData?.[1]?.id,
            merchant_id: merchant.id
          }
        ])
        .select();
      
      if (productError) throw productError;
      
      // Create sample customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            name: 'Rajesh Kumar',
            phone: '9876543210',
            address: 'Village Khanna, District Ludhiana, Punjab',
            gst_number: '03ABCDE1234F1Z5',
            merchant_id: merchant.id
          }
        ])
        .select();
      
      if (customerError) throw customerError;
      
      toast.dismiss();
      toast.success('Sample data created successfully!');
      
      // Refresh the report data
      fetchReportData({ startDate, endDate });
      
    } catch (error) {
      toast.dismiss();
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample data');
    }
  };

  const fetchReportData = async (filter: { startDate: string; endDate: string }) => {
    if (!merchant) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const startDateISO = new Date(filter.startDate).toISOString();
      const endDateISO = new Date(filter.endDate).toISOString();

      console.log('Fetching report data for:', { startDateISO, endDateISO, merchantId: merchant.id });

      // First, let's check if we have any products at all for this merchant
      const { data: allProducts, error: allProductsError } = await supabase
        .from('products')
        .select('id, name, merchant_id')
        .eq('merchant_id', merchant.id);
      
      console.log('All products for merchant:', allProducts);
      console.log('All products error:', allProductsError);
      
      // Also check if merchant exists and get merchant info
      const { data: merchantInfo, error: merchantError } = await supabase
        .from('merchants')
        .select('id, name, gst_number')
        .eq('id', merchant.id)
        .single();
      
      console.log('Merchant info:', merchantInfo);
      console.log('Merchant error:', merchantError);
      
      // Check if we have any data at all in the database
      const { data: allMerchants, error: allMerchantsError } = await supabase
        .from('merchants')
        .select('id, name')
        .limit(5);
      
      console.log('All merchants (sample):', allMerchants);
      console.log('All merchants error:', allMerchantsError);

      // Sales Data with advanced filtering (including GST data)
      let salesQuery = supabase
        .from('sales')
        .select(`
          total_amount, 
          sale_date, 
          customer_id, 
          subtotal,
          tax_amount,
          discount_amount,
          invoice_number,
          customers(name, gst_number),
          sale_items(quantity, product_id, unit_price, total_price)
        `)
        .eq('merchant_id', merchant.id)
        .gte('sale_date', startDateISO)
        .lte('sale_date', endDateISO);

      // Apply customer filter if selected
      if (customerId && customerId !== 'all') {
        salesQuery = salesQuery.eq('customer_id', customerId);
      }

      const { data: salesData, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Sales query error:', salesError);
        throw salesError;
      }

      console.log('Sales data:', salesData);

      // Product Data for COGS and stock value (including HSN codes for GST)
      let productsQuery = supabase
        .from('products')
        .select('id, name, cost_price, current_stock, minimum_stock, hsn_code, manufacturer')
        .eq('merchant_id', merchant.id);
      
      console.log('Products query:', productsQuery);

      // Note: Warehouse filtering removed as warehouse column doesn't exist in products table

      const { data: productsData, error: productsError } = await productsQuery;

      if (productsError) {
        console.error('Products query error:', productsError);
        throw productsError;
      }

      console.log('Products data:', productsData);
      console.log('Products data length:', productsData?.length);
      console.log('Report type selected:', reportType);
      console.log('Merchant ID:', merchant.id);
      console.log('Date range:', { startDateISO, endDateISO });

      // Purchase Data with supplier filtering
      let purchaseQuery = supabase
        .from('purchases')
        .select('total_amount, purchase_date, supplier_id, purchase_items(quantity, product_id)')
        .eq('merchant_id', merchant.id)
        .gte('purchase_date', startDateISO)
        .lte('purchase_date', endDateISO);

      // Apply supplier filter if selected
      if (supplierId && supplierId !== 'all') {
        purchaseQuery = purchaseQuery.eq('supplier_id', supplierId);
      }

      const { data: purchaseData, error: purchaseError } = await purchaseQuery;

      if (purchaseError) {
        console.error('Purchase query error:', purchaseError);
        throw purchaseError;
      }

      console.log('Purchase data:', purchaseData);
      
      const productsMap = new Map(productsData.map(p => [p.id, p]));

      // Process Sales Summary
      const totalRevenue = salesData?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const totalSales = salesData?.length || 0;
      const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      console.log('Sales summary:', { totalRevenue, totalSales, avgSaleValue });

      // Process Sales Trend
      const salesByDate: { [key: string]: number } = {};
      salesData?.forEach(s => {
        const date = format(new Date(s.sale_date), 'yyyy-MM-dd');
        salesByDate[date] = (salesByDate[date] || 0) + (s.total_amount || 0);
      });
      const salesTrend = Object.entries(salesByDate).map(([date, sales]) => ({ date, sales })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('Sales trend:', salesTrend);

      // Process Top Products & COGS
      let cogs = 0;
      const productSales: { [key: string]: number } = {};
      salesData?.forEach(sale => {
        if (sale.sale_items && Array.isArray(sale.sale_items)) {
          sale.sale_items.forEach(item => {
            const product = productsMap.get(item.product_id);
            if (product) {
              productSales[product.name] = (productSales[product.name] || 0) + (item.quantity || 0);
              cogs += (item.quantity || 0) * (product.cost_price || 0);
            }
          });
        }
      });
      const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, quantity]) => ({ name, quantity }));

      console.log('Top products:', topProducts, 'COGS:', cogs);

      // Process GST Summary
      const totalTaxCollected = salesData?.reduce((sum, s) => sum + (s.tax_amount || 0), 0) || 0;
      const totalTaxableAmount = salesData?.reduce((sum, s) => sum + (s.subtotal || 0), 0) || 0;
      const avgTaxRate = totalTaxableAmount > 0 ? (totalTaxCollected / totalTaxableAmount) * 100 : 0;
      
      // GST by HSN Code
      const gstByHsn: { [key: string]: { taxable: number; tax: number; transactions: number } } = {};
      salesData?.forEach(sale => {
        if (sale.sale_items && Array.isArray(sale.sale_items)) {
          sale.sale_items.forEach(item => {
            const product = productsMap.get(item.product_id);
            if (product && product.hsn_code) {
              const hsn = product.hsn_code;
              if (!gstByHsn[hsn]) {
                gstByHsn[hsn] = { taxable: 0, tax: 0, transactions: 0 };
              }
              const itemTaxableAmount = (item.total_price || 0);
              const itemTaxAmount = itemTaxableAmount * (avgTaxRate / 100);
              gstByHsn[hsn].taxable += itemTaxableAmount;
              gstByHsn[hsn].tax += itemTaxAmount;
              gstByHsn[hsn].transactions += 1;
            }
          });
        }
      });

      const gstByHsnArray = Object.entries(gstByHsn).map(([hsn, data]) => ({
        hsn_code: hsn,
        taxable_amount: data.taxable,
        tax_amount: data.tax,
        transactions: data.transactions
      }));

      console.log('GST summary:', { totalTaxCollected, totalTaxableAmount, avgTaxRate, gstByHsnArray });

      // Process Stock Summary
      const totalItems = productsData?.reduce((sum, p) => sum + (p.current_stock || 0), 0) || 0;
      const totalValue = productsData?.reduce((sum, p) => sum + (p.current_stock || 0) * (p.cost_price || 0), 0) || 0;
      const lowStockCount = productsData?.filter(p => (p.current_stock || 0) > 0 && (p.current_stock || 0) <= (p.minimum_stock || 0)).length || 0;
      const outOfStockCount = productsData?.filter(p => (p.current_stock || 0) <= 0).length || 0;

      console.log('Stock summary:', { totalItems, totalValue, lowStockCount, outOfStockCount });

      // Process Purchase Summary
      const totalPurchases = purchaseData?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
      const purchaseCount = purchaseData?.length || 0;

      console.log('Purchase summary:', { totalPurchases, purchaseCount });

      // Process Profit Summary
      const grossProfit = totalRevenue - cogs;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      console.log('Profit summary:', { grossProfit, cogs, profitMargin });

      const reportData = {
        salesSummary: { totalRevenue, totalSales, avgSaleValue },
        salesTrend,
        topProducts,
        stockSummary: { totalItems, totalValue, lowStockCount, outOfStockCount },
        profitSummary: { grossProfit, cogs, profitMargin, totalPurchases, purchaseCount },
        productsData: productsData || [],
        gstSummary: { 
          totalTaxCollected, 
          totalTaxableAmount, 
          avgTaxRate, 
          gstByHsn: gstByHsnArray 
        },
        salesDataWithGst: salesData || [],
      };

      console.log('Final report data:', reportData);

      setData(reportData);

    } catch (error) {
      console.error('Report data fetch error:', error);
      toast.error('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchant) {
      fetchReportData({ startDate, endDate });
    } else {
      setLoading(false);
    }
  }, [merchant, startDate, endDate, customerId, supplierId, reportType]);

  // Load customers and suppliers for filters
  useEffect(() => {
    const loadLookups = async () => {
      if (!merchant) return;
      try {
        const [{ data: custData, error: custErr }, { data: supData, error: supErr }] = await Promise.all([
          supabase.from('customers').select('id, name').eq('merchant_id', merchant.id).order('name', { ascending: true }),
          supabase.from('suppliers').select('id, name').eq('merchant_id', merchant.id).order('name', { ascending: true }),
        ]);
        if (custErr) throw custErr;
        if (supErr) throw supErr;
        setCustomers(custData || []);
        setSuppliers(supData || []);
      } catch (e) {
        toast.error('Failed to load lookup data');
      }
    };
    loadLookups();
  }, [merchant]);

  const onFilterSubmit = (data: { startDate: string; endDate: string }) => {
    fetchReportData(data);
  };

  const handleExportSelectedPdf = async () => {
    try {
      if (reportType === 'performance') {
        if (!data) {
          toast.error('No data to export');
          return;
        }
        const reportData: ReportPDFData = {
          reportType: 'performance',
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: `${(merchant?.settings as any)?.business_address || 'Address Not Set'}\nGSTIN: ${(merchant?.settings as any)?.gst_number || 'Not Set'}\nPhone: ${(merchant?.settings as any)?.phone || 'Not Set'}\nEmail: ${(merchant?.settings as any)?.email || 'Not Set'}`,
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          data
        };
        await downloadReportPDF(reportData, `performance_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast.success('Performance report downloaded');
        return;
      }

      if (!merchant) {
        toast.error('Merchant not available');
        return;
      }

      // Create report data based on type
      let reportData: ReportPDFData;
      
      if (reportType === 'stock') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('merchant_id', merchant.id);
        
        if (error) {
          toast.error('Failed to fetch product data');
          return;
        }
        
        reportData = {
          reportType: 'stock',
          merchantName: merchant.name || 'Merchant',
          merchantAddress: merchant.address || 'Address Not Set',
          merchantPhone: merchant.phone || '',
          merchantEmail: merchant.email || '',
          dateRange: format(new Date(endDate || new Date()), 'dd/MM/yyyy'),
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant.fertilizer_license || '',
          seedLicense: merchant.seed_license || '',
          pesticideLicense: merchant.pesticide_license || '',
          gstNumber: merchant.gst_number || '',
          data: { products: products || [] }
        };
      } else if (reportType === 'sales') {
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*, customers(name)')
          .eq('merchant_id', merchant.id)
          .gte('sale_date', startDate)
          .lte('sale_date', endDate);
        
        if (error) {
          toast.error('Failed to fetch sales data');
          return;
        }
        
        reportData = {
          reportType: 'sales',
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: { sales: sales || [] }
        };
      } else {
        // Handle other report types with empty data
        reportData = {
          reportType: reportType as any,
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: {}
        };
      }
      
      await downloadReportPDF(reportData, `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success(`${reportType} report downloaded`);
    } catch (e) {
      toast.error('Failed to export report');
    }
  };

  const handlePreviewSelectedPdf = async () => {
    try {
      if (reportType === 'performance') {
        const reportData: ReportPDFData = {
          reportType: 'performance',
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: data || {}
        };
        await previewReportPDF(reportData);
        toast.success('Performance report preview opened');
        return;
      }

      if (!merchant) {
        toast.error('Merchant not available');
        return;
      }

      // Create report data based on type
      let reportData: ReportPDFData;
      
      if (reportType === 'stock') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('merchant_id', merchant.id);
        
        if (error) {
          toast.error('Failed to fetch product data');
          return;
        }
        
        
        reportData = {
          reportType: 'stock',
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: format(new Date(endDate || new Date()), 'dd/MM/yyyy'),
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: { products: products || [] }
        };
      } else if (reportType === 'sales') {
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*, customers(name)')
          .eq('merchant_id', merchant.id)
          .gte('sale_date', startDate)
          .lte('sale_date', endDate);
        
        if (error) {
          toast.error('Failed to fetch sales data');
          return;
        }
        
        reportData = {
          reportType: 'sales',
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: { sales: sales || [] }
        };
      } else if (reportType === 'products' || reportType === 'gst') {
        // Use the existing data from the current report state
        if (!data) {
          toast.error('No data available. Please generate the report first.');
          return;
        }
        
        reportData = {
          reportType: reportType as any,
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: data
        };
      } else {
        // Handle other report types with empty data for preview
        reportData = {
          reportType: reportType as any,
          merchantName: merchant?.name || 'Merchant',
          merchantAddress: merchant?.address || 'Address Not Set',
          merchantPhone: merchant?.phone || '',
          merchantEmail: merchant?.email || '',
          dateRange: `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`,
          generatedDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
          fertilizerLicense: merchant?.fertilizer_license || '',
          seedLicense: merchant?.seed_license || '',
          pesticideLicense: merchant?.pesticide_license || '',
          gstNumber: merchant?.gst_number || '',
          data: {}
        };
      }
      
      await previewReportPDF(reportData);
      toast.success(`${reportType} report preview opened`);
    } catch (e) {
      toast.error('Failed to preview report');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">Analyze your business performance</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportSelectedPdf}
            disabled={loading}
          >
            Export Selected PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePreviewSelectedPdf}
            disabled={loading}
          >
            Preview Selected
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onFilterSubmit)}>
            <Grid container spacing={3} alignItems="end">
              <Grid item xs={12} sm={4}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<AssessmentIcon />}
                  fullWidth
                >
                  Apply Filter
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="reportType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Report Type" fullWidth select>
                      <MenuItem value="performance">Business Performance</MenuItem>
                      <MenuItem value="stock">Stock Report</MenuItem>
                      <MenuItem value="sales">Sales Report</MenuItem>
                      <MenuItem value="purchase">Purchase Report</MenuItem>
                      <MenuItem value="products">Products Report</MenuItem>
                      <MenuItem value="gst">GST Report</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Customer (optional)" fullWidth select>
                      <MenuItem value="">All Customers</MenuItem>
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="supplierId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Supplier (optional)" fullWidth select>
                      <MenuItem value="">All Suppliers</MenuItem>
                      {suppliers.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress size={40} />
        </Box>
      ) : data ? (
        <Stack spacing={3}>
          {/* Conditional Report Rendering Based on Report Type */}
          {reportType === 'products' ? (
            // Products Report
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  Products Report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Total Products: {data.productsData?.length || 0}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell align="right">Current Stock</TableCell>
                        <TableCell align="right">Minimum Stock</TableCell>
                        <TableCell align="right">Cost Price</TableCell>
                        <TableCell align="right">Stock Value</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.productsData && data.productsData.length > 0 ? (
                        data.productsData.map((product: any) => (
                          <TableRow key={product.id} hover>
                            <TableCell component="th" scope="row">
                              <Typography variant="body1" fontWeight="medium">
                                {product.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{product.current_stock || 0}</TableCell>
                            <TableCell align="right">{product.minimum_stock || 0}</TableCell>
                            <TableCell align="right">₹{(product.cost_price || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">₹{((product.current_stock || 0) * (product.cost_price || 0)).toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={
                                  (product.current_stock || 0) <= 0 ? 'Out of Stock' :
                                  (product.current_stock || 0) <= (product.minimum_stock || 0) ? 'Low Stock' :
                                  'In Stock'
                                }
                                color={
                                  (product.current_stock || 0) <= 0 ? 'error' :
                                  (product.current_stock || 0) <= (product.minimum_stock || 0) ? 'warning' :
                                  'success'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                              No products found for this merchant. Check console for debug info.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ) : reportType === 'gst' ? (
            // GST Report
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    GST Summary
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <StatCard 
                        title="Total Tax Collected" 
                        value={`₹${data.gstSummary.totalTaxCollected.toFixed(2)}`} 
                        icon={MoneyIcon} 
                        color="success.main" 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StatCard 
                        title="Total Taxable Amount" 
                        value={`₹${data.gstSummary.totalTaxableAmount.toFixed(2)}`} 
                        icon={TrendingUpIcon} 
                        color="primary.main" 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StatCard 
                        title="Average Tax Rate" 
                        value={`${data.gstSummary.avgTaxRate.toFixed(2)}%`} 
                        icon={AssessmentIcon} 
                        color="info.main" 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    GST by HSN Code
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>HSN Code</TableCell>
                          <TableCell align="right">Taxable Amount</TableCell>
                          <TableCell align="right">Tax Amount</TableCell>
                          <TableCell align="right">Tax Rate</TableCell>
                          <TableCell align="center">Transactions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.gstSummary.gstByHsn?.map((item: any, index: number) => (
                          <TableRow key={index} hover>
                            <TableCell component="th" scope="row">
                              <Typography variant="body1" fontWeight="medium">
                                {item.hsn_code}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">₹{item.taxable_amount.toFixed(2)}</TableCell>
                            <TableCell align="right">₹{item.tax_amount.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              {item.taxable_amount > 0 ? ((item.tax_amount / item.taxable_amount) * 100).toFixed(2) : 0}%
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={item.transactions} 
                                color="primary" 
                                variant="outlined" 
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    Sales Transactions with GST Details
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice No.</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Customer GSTIN</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                          <TableCell align="right">Tax Amount</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.salesDataWithGst?.map((sale: any, index: number) => (
                          <TableRow key={index} hover>
                            <TableCell component="th" scope="row">
                              <Typography variant="body2" fontWeight="medium">
                                {sale.invoice_number}
                              </Typography>
                            </TableCell>
                            <TableCell>{format(new Date(sale.sale_date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{sale.customers?.name || 'Walk-in Customer'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={sale.customers?.gst_number || 'Unregistered'} 
                                color={sale.customers?.gst_number ? 'success' : 'default'}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">₹{(sale.subtotal || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">₹{(sale.tax_amount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">₹{(sale.total_amount || 0).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            // Business Performance Report
            <>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    Sales Report
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <StatCard title="Total Revenue" value={`₹${data.salesSummary.totalRevenue.toFixed(2)}`} icon={TrendingUpIcon} color="success.main" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StatCard title="Total Sales" value={data.salesSummary.totalSales} icon={ShoppingCartIcon} color="primary.main" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StatCard title="Avg. Sale Value" value={`₹${data.salesSummary.avgSaleValue.toFixed(2)}`} icon={MoneyIcon} color="secondary.main" />
                    </Grid>
                  </Grid>
                  <Box sx={{ height: 320, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.salesTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#1976d2" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                {/* Stock Report */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                        Stock Report
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <StatCard title="Total Stock Value" value={`₹${data.stockSummary.totalValue.toFixed(2)}`} icon={InventoryIcon} color="info.main" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <StatCard title="Total Items" value={data.stockSummary.totalItems} icon={InventoryIcon} color="info.main" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <StatCard title="Low Stock" value={data.stockSummary.lowStockCount} icon={WarningIcon} color="warning.main" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <StatCard title="Out of Stock" value={data.stockSummary.outOfStockCount} icon={WarningIcon} color="error.main" />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Profit & Loss */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                        Profit & Loss Summary
                      </Typography>
                      <Stack spacing={2}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">Total Revenue</Typography>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              ₹{data.salesSummary.totalRevenue.toFixed(2)}
                            </Typography>
                          </Stack>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">Cost of Goods Sold (COGS)</Typography>
                            <Typography variant="h6" color="error.main" fontWeight="bold">
                              - ₹{data.profitSummary.cogs.toFixed(2)}
                            </Typography>
                          </Stack>
                        </Paper>
                        <Divider />
                        <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">Gross Profit</Typography>
                            <Typography variant="h5" fontWeight="bold">
                              ₹{data.profitSummary.grossProfit.toFixed(2)}
                            </Typography>
                          </Stack>
                        </Paper>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">Profit Margin</Typography>
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            {data.profitSummary.profitMargin.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Top Products */}
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    Top Selling Products
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Quantity Sold</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topProducts.map((product, index) => (
                          <TableRow key={index} hover>
                            <TableCell component="th" scope="row">
                              <Typography variant="body1" fontWeight="medium">
                                {product.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={product.quantity} 
                                color="primary" 
                                variant="outlined" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}
        </Stack>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            No data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data found for the selected period. This could be due to:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • No products added to inventory yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • No sales recorded in the selected date range
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Database connection issues
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
