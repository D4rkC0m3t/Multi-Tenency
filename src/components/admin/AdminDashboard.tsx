import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
  LogOut,
  Settings,
  BarChart3,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalMerchants: number;
  activeMerchants: number;
  pendingPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  verifiedPayments: number;
  rejectedPayments: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    activeMerchants: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    verifiedPayments: 0,
    rejectedPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const navigate = useNavigate();

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

      setAdminProfile(profile);
    } catch (error) {
      console.error('Access check error:', error);
      navigate('/admin/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch merchants count
      const { count: totalMerchants } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscriptions count
      const { count: activeMerchants } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch payment statistics
      const { data: payments } = await supabase
        .from('payment_submissions')
        .select('status, amount, created_at');

      const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
      const verifiedPayments = payments?.filter(p => p.status === 'verified').length || 0;
      const rejectedPayments = payments?.filter(p => p.status === 'rejected').length || 0;

      // Calculate revenue
      const totalRevenue = payments
        ?.filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = payments
        ?.filter(p => {
          const paymentDate = new Date(p.created_at);
          return p.status === 'verified' &&
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Fetch recent activity from audit log
      const { data: auditLog } = await supabase
        .from('payment_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const activities: RecentActivity[] = auditLog?.map(log => ({
        id: log.id,
        type: log.action,
        description: log.notes || 'Payment action',
        timestamp: log.created_at,
        status: log.action.includes('verified') ? 'success' : 'info'
      })) || [];

      setStats({
        totalMerchants: totalMerchants || 0,
        activeMerchants: activeMerchants || 0,
        pendingPayments,
        totalRevenue,
        monthlyRevenue,
        verifiedPayments,
        rejectedPayments,
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-white font-medium">{adminProfile?.full_name}</p>
                <p className="text-xs text-gray-400">{adminProfile?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Merchants */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalMerchants}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Total Merchants</h3>
            <p className="text-gray-400 text-xs mt-1">{stats.activeMerchants} active subscriptions</p>
          </div>

          {/* Pending Payments */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.pendingPayments}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Pending Payments</h3>
            <p className="text-gray-400 text-xs mt-1">Awaiting verification</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Total Revenue</h3>
            <p className="text-gray-400 text-xs mt-1">{stats.verifiedPayments} verified payments</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">This Month</h3>
            <p className="text-gray-400 text-xs mt-1">Current month revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/payments')}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-4 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <CreditCard className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg">Manage Payments</h3>
                <p className="text-gray-400 text-sm">Verify & process payments</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/merchants')}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-4 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg">Merchants</h3>
                <p className="text-gray-400 text-sm">View all merchants</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-4 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg">Reports</h3>
                <p className="text-gray-400 text-sm">Analytics & insights</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Activity className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.type}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatDate(activity.timestamp)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-green-500/10 backdrop-blur-xl rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-semibold">Verified</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.verifiedPayments}</p>
            <p className="text-gray-400 text-sm mt-1">Approved payments</p>
          </div>

          <div className="bg-yellow-500/10 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-semibold">Pending</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingPayments}</p>
            <p className="text-gray-400 text-sm mt-1">Awaiting review</p>
          </div>

          <div className="bg-red-500/10 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-white font-semibold">Rejected</h3>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.rejectedPayments}</p>
            <p className="text-gray-400 text-sm mt-1">Declined payments</p>
          </div>
        </div>
      </main>
    </div>
  );
}
