import { supabase } from './supabase';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

interface DashboardMetrics {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
  salesTrend: { date: string; amount: number }[];
  stockByCategory: { name: string; value: number }[];
  recentSales: any[];
  recentPurchases: any[];
}

export const fetchDashboardData = async (merchantId: string, range: TimeRange = '30d'): Promise<DashboardMetrics> => {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Fetch data in parallel
    const [
      { data: salesData },
      { data: productsData },
      { data: categoriesData },
      { data: recentSales },
      { data: recentPurchases },
    ] = await Promise.all([
      // Sales data for metrics and trend
      supabase
        .from('sales')
        .select('id, sale_date, total_amount')
        .eq('merchant_id', merchantId)
        .gte('sale_date', startDate.toISOString())
        .order('sale_date', { ascending: true }),

      // Products data
      supabase
        .from('products')
        .select('id, current_stock, minimum_stock, category_id')
        .eq('merchant_id', merchantId)
        .eq('status', 'active'),

      // Categories for stock by category
      supabase
        .from('categories')
        .select('id, name')
        .eq('merchant_id', merchantId)
        .eq('is_active', true),

      // Recent sales
      supabase
        .from('sales')
        .select(`
          id,
          invoice_number,
          sale_date,
          total_amount,
          payment_status,
          customers ( id, name )
        `)
        .eq('merchant_id', merchantId)
        .order('sale_date', { ascending: false })
        .limit(5),

      // Recent purchases
      supabase
        .from('purchases')
        .select(`
          id,
          invoice_number,
          purchase_date,
          total_amount,
          payment_status,
          suppliers ( id, name )
        `)
        .eq('merchant_id', merchantId)
        .order('purchase_date', { ascending: false })
        .limit(5),
    ]);

    // Process data
    const totalSales = salesData?.length || 0;
    const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const totalProducts = productsData?.length || 0;
    const lowStockItems = productsData?.filter(
      (p) => p.current_stock <= (p.minimum_stock || 0)
    ).length || 0;

    // Group sales by date for trend
    const salesByDate = salesData?.reduce((acc, sale) => {
      const date = new Date(sale.sale_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (sale.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    // Generate trend data
    const salesTrend = Object.entries(salesByDate || {}).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Group products by category for stock by category
    const stockByCategory = categoriesData?.map((category) => {
      const categoryProducts = productsData?.filter(
        (p) => p.category_id === category.id
      ) || [];
      const totalStock = categoryProducts.reduce(
        (sum, p) => sum + (p.current_stock || 0),
        0
      );
      return {
        name: category.name,
        value: totalStock,
      };
    }) || [];

    return {
      totalSales,
      totalRevenue,
      totalProducts,
      lowStockItems,
      salesTrend,
      stockByCategory,
      recentSales: recentSales || [],
      recentPurchases: recentPurchases || [],
    };
  } catch (error) {
    throw error;
  }
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export { formatCurrency, formatDate };
