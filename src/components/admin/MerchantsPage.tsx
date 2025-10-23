import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Users, DollarSign, AlertCircle, Eye } from 'lucide-react';

interface Merchant {
  id: string;
  business_name: string;
  email: string;
  created_at: string;
  payment_status?: string | null;
  subscription_status?: string | null;
  subscription_end_date?: string | null;
}

export function MerchantsPage() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        // Fetch merchants with payment and subscription info
        const { data: merchantsData, error: merchantsError } = await supabase
          .from('merchants')
          .select('id, name, business_name, email, created_at')
          .order('created_at', { ascending: false });
        
        if (merchantsError) throw merchantsError;

        // Fetch latest payment submission for each merchant
        const { data: paymentsData } = await supabase
          .from('payment_submissions')
          .select('merchant_id, status, created_at')
          .order('created_at', { ascending: false });

        // Fetch active subscriptions
        const { data: subscriptionsData } = await supabase
          .from('user_subscriptions')
          .select('merchant_id, status, end_date')
          .eq('status', 'active');

        // Create payment map (latest payment per merchant)
        const paymentMap = new Map();
        paymentsData?.forEach(p => {
          if (!paymentMap.has(p.merchant_id)) {
            paymentMap.set(p.merchant_id, p.status);
          }
        });

        // Create subscription map
        const subscriptionMap = new Map();
        subscriptionsData?.forEach(s => {
          subscriptionMap.set(s.merchant_id, { status: s.status, end_date: s.end_date });
        });

        // Combine data
        const formattedData = merchantsData?.map(m => {
          const subscription = subscriptionMap.get(m.id);
          return {
            ...m,
            business_name: m.business_name || m.name || 'Unnamed Business',
            payment_status: paymentMap.get(m.id) || null,
            subscription_status: subscription?.status || null,
            subscription_end_date: subscription?.end_date || null
          };
        }) || [];

        setMerchants(formattedData as Merchant[]);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load merchants');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  const paymentStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return <span className="text-xs font-medium px-2 py-1 rounded bg-gray-600 text-white flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> No Payment
      </span>;
    }
    const map: Record<string, { color: string; label: string; icon: any }> = {
      pending: { color: 'bg-yellow-600', label: 'Pending', icon: Clock },
      verified: { color: 'bg-green-600', label: 'Verified', icon: CheckCircle },
      rejected: { color: 'bg-red-600', label: 'Rejected', icon: XCircle },
    };
    const { color, label, icon: Icon } = map[status] || { color: 'bg-gray-600', label: status, icon: DollarSign };
    return <span className={`text-xs font-medium px-2 py-1 rounded ${color} text-white flex items-center gap-1`}>
      <Icon className="w-3 h-3" /> {label}
    </span>;
  };

  const subscriptionStatusBadge = (status: string | null | undefined, endDate: string | null | undefined) => {
    if (!status) {
      return <span className="text-xs font-medium px-2 py-1 rounded bg-gray-600 text-white">No Subscription</span>;
    }
    const daysLeft = endDate ? Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium px-2 py-1 rounded bg-green-600 text-white">Active</span>
        {daysLeft > 0 && <span className="text-xs text-gray-400">{daysLeft} days left</span>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-orange mr-2" />
        Loading merchants…
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-neon-orange" /> Merchants
      </h1>
      {/* Total count */}
      <p className="mb-4 text-gray-400">Total merchants: <span className="font-semibold text-white">{merchants.length}</span></p>
      {merchants.length === 0 ? (
        <p className="text-gray-600">No merchants found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Merchant ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Payment Status</th>
                <th className="px-4 py-2 text-left">Subscription</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map(m => (
                <tr key={m.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-2">
                    <span 
                      className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                      title={`Full ID: ${m.id}\nClick to copy`}
                      onClick={() => {
                        navigator.clipboard.writeText(m.id);
                        toast.success('Merchant ID copied to clipboard!');
                      }}
                    >
                      {m.id.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-2">{m.business_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-400">{m.email}</td>
                  <td className="px-4 py-2">{paymentStatusBadge(m.payment_status)}</td>
                  <td className="px-4 py-2">{subscriptionStatusBadge(m.subscription_status, m.subscription_end_date)}</td>
                  <td className="px-4 py-2 text-sm text-gray-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/admin/merchants/${m.id}`)}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
