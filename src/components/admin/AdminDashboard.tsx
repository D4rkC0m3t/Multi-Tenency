import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import {
  Users,
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  ArrowRight,
  Ban,
  Pause,
  Play,
  RefreshCw,
  Shield,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PatternAlert } from '../common/PatternAlert';
import { RecentActivity } from '../common/RecentActivity';

// Placeholder for 3D model (removed for simplicity)


/* -------------------------------------------------
   3D Skull Model Component
   - Place a GLB file named `skull.glb` in the public folder.
   - If missing, a simple fallback sphere is shown.
------------------------------------------------- */
// SkullModel removed; using static image instead

export function AdminDashboard() {
  const navigate = useNavigate();

const [stats, setStats] = useState({
  totalMerchants: 0,
  paymentsPending: 0,
  merchantsRejected: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  verifiedPayments: 0,
  rejectedPayments: 0,
});
const [recentActivity, setRecentActivity] = useState<any[]>([]);
const [anomaly, setAnomaly] = useState<any>(null);
const [loading, setLoading] = useState(true);


  /* -------------------------------------------------
     Fetch data on mount
  ------------------------------------------------- */
  useEffect(() => {
    checkAdminAccess();
    fetchDashboardData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!profile?.is_platform_admin && profile?.role !== 'super_admin') {
        toast.error('Access denied');
        navigate('/admin/login');
        return;
      }
      // profile is validated; no need to store locally
    } catch (e) {
      console.error(e);
      navigate('/admin/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1️⃣ Fetch aggregated KPI view
      const { data: viewData, error: viewError } = await supabase
        .from('merchant_actions')
        .select('*')
        .single();
      if (viewError) throw viewError;

      // 2️⃣ Fetch revenue data (still from payments)
      const { data: payments, error: payError } = await supabase
        .from('payment_submissions')
        .select('status, amount, created_at');
      if (payError) throw payError;
      const totalRevenue = payments?.filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const monthlyRevenue = payments?.filter(p => {
        const d = new Date(p.created_at);
        return p.status === 'verified' && d.getMonth() === month && d.getFullYear() === year;
      }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // 3️⃣ Recent merchant activity (audit log)
      const { data: activityData, error: actError } = await supabase
        .from('merchant_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      if (actError) throw actError;

      // 4️⃣ Latest anomaly event (if any)
      const { data: anomalyData, error: anError } = await supabase
        .from('anomaly_events')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(1);
      if (anError) throw anError;

      setStats({
        totalMerchants: viewData?.total_merchants || 0,
        paymentsPending: viewData?.payments_pending || 0,
        merchantsRejected: viewData?.merchants_rejected || 0,
        totalRevenue,
        monthlyRevenue,
        verifiedPayments: payments?.filter(p => p.status === 'verified').length || 0,
        rejectedPayments: payments?.filter(p => p.status === 'rejected').length || 0,
      });
      setRecentActivity(activityData || []);
      setAnomaly(anomalyData && anomalyData.length > 0 ? anomalyData[0] : null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // logout handled by AdminLayout

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // Date formatting is handled inside RecentActivity component. Recent activity type is defined in the RecentActivity component.

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Optional anomaly banner */}
      {anomaly && (
        <PatternAlert
          title={anomaly.title}
          description={anomaly.description}
          severity={anomaly.severity}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage your platform</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMerchants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Approve Payments</CardTitle>
                <CardDescription>Pending payments: {stats.paymentsPending}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/payments')} className="w-full">
              Go to Payments <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Manage Merchants</CardTitle>
                <CardDescription>Total merchants: {stats.totalMerchants}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/merchants')} className="w-full">
              Go to Merchants <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Reports</CardTitle>
                <CardDescription>View analytics and trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/reports')} className="w-full">
              View Reports <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivity} onRefresh={fetchDashboardData} />

      {/* Payment status overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.verifiedPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.paymentsPending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.merchantsRejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Controls Section */}
      <Card className="border-orange-500/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <CardTitle>Manual Controls</CardTitle>
          </div>
          <CardDescription>Quick actions for payment and account management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Payment Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Controls
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/payments?filter=pending')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Review Pending ({stats.paymentsPending})
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Refresh payment data from database?')) {
                      fetchDashboardData();
                      toast.success('Payment data refreshed');
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Payments
                </Button>
              </div>
            </div>

            {/* Account Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Account Controls
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/merchants')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Accounts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                  onClick={() => {
                    toast('Account pause feature - Navigate to merchant details to pause individual accounts', {
                      icon: '⚠️',
                      duration: 3000,
                    });
                    navigate('/admin/merchants');
                  }}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Account
                </Button>
              </div>
            </div>

            {/* Subscription Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Play className="w-4 h-4" />
                Subscription Controls
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-green-600 hover:text-green-700"
                  onClick={() => {
                    toast('Activate subscription - Verify payment first in Payments page', {
                      icon: '✅',
                      duration: 3000,
                    });
                    navigate('/admin/payments');
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Activate Subscription
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast('View subscription details in Merchants page', {
                      icon: 'ℹ️',
                      duration: 3000,
                    });
                    navigate('/admin/merchants');
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Subscriptions
                </Button>
              </div>
            </div>

            {/* Security Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Security Controls
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    toast('Ban account - Navigate to merchant details to ban individual accounts', {
                      icon: '🚫',
                      duration: 3000,
                    });
                    navigate('/admin/merchants');
                  }}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban Account
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Refresh all dashboard data?')) {
                      fetchDashboardData();
                      toast.success('Dashboard refreshed');
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">{stats.verifiedPayments}</div>
                <div className="text-xs text-muted-foreground">Verified Payments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{stats.paymentsPending}</div>
                <div className="text-xs text-muted-foreground">Pending Review</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalMerchants}</div>
                <div className="text-xs text-muted-foreground">Total Merchants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
