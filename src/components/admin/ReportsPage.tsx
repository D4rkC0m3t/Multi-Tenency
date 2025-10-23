import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ReportData {
  totalMerchants: number;
  activeMerchants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  verifiedPayments: number;
  rejectedPayments: number;
  averageRevenuePerMerchant: number;
  growthRate: number;
  revenueByMonth: { month: string; revenue: number }[];
  merchantsByMonth: { month: string; count: number }[];
  paymentsByStatus: { status: string; count: number; amount: number }[];
}

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalMerchants: 0,
    activeMerchants: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    rejectedPayments: 0,
    averageRevenuePerMerchant: 0,
    growthRate: 0,
    revenueByMonth: [],
    merchantsByMonth: [],
    paymentsByStatus: [],
  });
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }

      // Fetch merchants data
      const { data: merchants, error: merchantsError } = await supabase
        .from('merchants')
        .select('id, created_at, is_active');

      if (merchantsError) throw merchantsError;

      // Fetch payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_submissions')
        .select('id, amount, status, created_at')
        .gte('created_at', startDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Fetch subscriptions data
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('merchant_id, status')
        .eq('status', 'active');

      if (subscriptionsError) throw subscriptionsError;

      // Calculate metrics
      const totalMerchants = merchants?.length || 0;
      const activeMerchants = subscriptions?.length || 0;

      const verifiedPayments = payments?.filter(p => p.status === 'verified') || [];
      const totalRevenue = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const monthlyRevenue = verifiedPayments
        .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Yearly revenue (last 365 days)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      const yearlyRevenue = verifiedPayments
        .filter(p => new Date(p.created_at) >= oneYearAgo)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Payment status breakdown
      const paymentsByStatus = [
        {
          status: 'Verified',
          count: payments?.filter(p => p.status === 'verified').length || 0,
          amount: verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        },
        {
          status: 'Pending',
          count: payments?.filter(p => p.status === 'pending').length || 0,
          amount: payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        },
        {
          status: 'Rejected',
          count: payments?.filter(p => p.status === 'rejected').length || 0,
          amount: payments?.filter(p => p.status === 'rejected').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        },
      ];

      // Revenue by month (last 6 months)
      const revenueByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(now.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthRevenue = verifiedPayments
          .filter(p => {
            const pDate = new Date(p.created_at);
            return pDate >= monthStart && pDate <= monthEnd;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        revenueByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
        });
      }

      // Merchants by month (last 6 months)
      const merchantsByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(now.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthMerchants = merchants?.filter(m => {
          const mDate = new Date(m.created_at);
          return mDate >= monthStart && mDate <= monthEnd;
        }).length || 0;

        merchantsByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count: monthMerchants,
        });
      }

      // Calculate growth rate (compare last month vs previous month)
      const lastMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?.revenue || 0;
      const previousMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?.revenue || 0;
      const growthRate = previousMonthRevenue > 0 
        ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      setReportData({
        totalMerchants,
        activeMerchants,
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        totalPayments: payments?.length || 0,
        pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
        verifiedPayments: verifiedPayments.length,
        rejectedPayments: payments?.filter(p => p.status === 'rejected').length || 0,
        averageRevenuePerMerchant: activeMerchants > 0 ? totalRevenue / activeMerchants : 0,
        growthRate,
        revenueByMonth,
        merchantsByMonth,
        paymentsByStatus,
      });
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const exportToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Merchants', reportData.totalMerchants],
      ['Active Merchants', reportData.activeMerchants],
      ['Total Revenue', reportData.totalRevenue],
      ['Monthly Revenue', reportData.monthlyRevenue],
      ['Yearly Revenue', reportData.yearlyRevenue],
      ['Total Payments', reportData.totalPayments],
      ['Pending Payments', reportData.pendingPayments],
      ['Verified Payments', reportData.verifiedPayments],
      ['Rejected Payments', reportData.rejectedPayments],
      ['Average Revenue Per Merchant', reportData.averageRevenuePerMerchant],
      ['Growth Rate (%)', reportData.growthRate],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2" />
        Loading reports…
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-3">
          {/* Date Range Filter */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range === '7d' && '7 Days'}
                {range === '30d' && '30 Days'}
                {range === '90d' && '90 Days'}
                {range === '1y' && '1 Year'}
                {range === 'all' && 'All Time'}
              </Button>
            ))}
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportData.verifiedPayments} verified payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.monthlyRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              {reportData.growthRate >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <p className={`text-xs ${reportData.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {reportData.growthRate.toFixed(1)}% vs last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.activeMerchants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {reportData.totalMerchants} total merchants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Merchant</CardTitle>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.averageRevenuePerMerchant)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per active merchant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          <CardDescription>Monthly revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.revenueByMonth.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">{item.month}</div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.max((item.revenue / Math.max(...reportData.revenueByMonth.map(r => r.revenue))) * 100, 2)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-32 text-sm font-medium text-right">{formatCurrency(item.revenue)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Breakdown</CardTitle>
            <CardDescription>Distribution of payment submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.paymentsByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === 'Verified'
                          ? 'bg-green-500'
                          : item.status === 'Pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.count} payments</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merchant Growth (Last 6 Months)</CardTitle>
            <CardDescription>New merchant registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.merchantsByMonth.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${Math.max((item.count / Math.max(...reportData.merchantsByMonth.map(m => m.count))) * 100, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm font-medium text-right">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Overall platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Payments</div>
              <div className="text-2xl font-bold">{reportData.totalPayments}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Pending Payments</div>
              <div className="text-2xl font-bold text-yellow-500">{reportData.pendingPayments}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Yearly Revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(reportData.yearlyRevenue)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
