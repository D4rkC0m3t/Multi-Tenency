import { Shield, LogOut } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Left navigation */}
      <aside className="w-64 bg-gray-800/80 backdrop-blur-sm p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-neon-orange" />
          <h2 className="text-xl font-bold">🕶️ Hacker Admin</h2>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full text-left py-2 px-3 rounded hover:bg-gray-700"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/admin/merchants')}
            className="w-full text-left py-2 px-3 rounded hover:bg-gray-700"
          >
            Merchants
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="w-full text-left py-2 px-3 rounded hover:bg-gray-700"
          >
            Reports
          </button>
          <button
            onClick={() => navigate('/admin/payments')}
            className="w-full text-left py-2 px-3 rounded hover:bg-gray-700"
          >
            Payments
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full py-2 px-3 rounded hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
