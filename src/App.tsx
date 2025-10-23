import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthPage } from './components/auth/AuthPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProductsPage } from './components/products/ProductsPage';
import { CategoriesPage } from './components/categories/CategoriesPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { SuppliersPage } from './components/suppliers/SuppliersPage';
import { SupplierPaymentsPage } from './components/suppliers/SupplierPaymentsPage';
import { SalesPage } from './components/sales/SalesPage';
import { PurchasesPage } from './components/purchases/PurchasesPage';
import { PurchaseOrdersPage } from './components/purchases/po/PurchaseOrdersPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import POSPage from './components/pos/POSPage';
import { StockMovementsPage } from './components/inventory/StockMovementsPage';
import { StockTakePage } from './components/inventory/StockTakePage';
import { BatchManagementPage } from './components/inventory/BatchManagementPage';
import { ReorderAlertsPage } from './components/inventory/ReorderAlertsPage';
import { EInvoicePage } from './components/einvoice/EInvoicePage';
import LandingPage from './components/landing/LandingPageNew';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { SubscriptionPage } from './components/subscription/SubscriptionPage';
import { PaymentManagementPage } from './components/admin/PaymentManagementPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLayout } from './components/layout/AdminLayout';
import { MerchantsPage } from './components/admin/MerchantsPage';
import { MerchantDetailPage } from './components/admin/MerchantDetailPage';
import { ReportsPage as AdminReportsPage } from './components/admin/ReportsPage';
import TermsAndConditions from './components/legal/TermsAndConditions';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import RefundPolicy from './components/legal/RefundPolicy';
import { FeatureAccessGuard } from './components/common/FeatureAccessGuard';
import { NotFoundPage } from './components/common/NotFoundPage';


function AppContent() {
  const { user, loading, merchant } = useAuth();
  const defaultTheme = createTheme();
  const isPasswordRecovery = window.location.pathname === '/reset-password';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // If user is on password recovery page, show it regardless of auth state
  if (isPasswordRecovery) {
    return (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <div className="app-container">
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/reset-password" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    );
  }

  // Show landing page or auth pages for non-authenticated users
  if (!user) {
    return (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            {/* Redirect all protected routes to login instead of showing 404 */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    );
  }

  const settings: any = (merchant?.settings as any) || {};
  const darkMode = Boolean(settings.preferences?.dark_mode);
  const compact = Boolean(settings.preferences?.compact_view);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#16a34a' },
      background: darkMode
        ? { default: '#0b0f14', paper: '#111827' }
        : { default: '#f8fafc' },
    },
    shape: { borderRadius: 10 },
    components: compact ? {
      MuiTable: { defaultProps: { size: 'small' } },
      MuiButton: { defaultProps: { size: 'small' } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiFormControl: { defaultProps: { margin: 'dense' } },
      MuiListItem: { styleOverrides: { root: { paddingTop: 6, paddingBottom: 6 } } },
    } : {},
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<FeatureAccessGuard feature="Dashboard"><Dashboard /></FeatureAccessGuard>} />
            <Route path="dashboard" element={<FeatureAccessGuard feature="Dashboard"><Dashboard /></FeatureAccessGuard>} />
            <Route path="products" element={<FeatureAccessGuard feature="Product Management"><ProductsPage /></FeatureAccessGuard>} />
            <Route path="categories" element={<FeatureAccessGuard feature="Categories"><CategoriesPage /></FeatureAccessGuard>} />
            <Route path="customers" element={<FeatureAccessGuard feature="Customer Management"><CustomersPage /></FeatureAccessGuard>} />
            <Route path="suppliers" element={<FeatureAccessGuard feature="Supplier Management"><SuppliersPage /></FeatureAccessGuard>} />
            <Route path="suppliers/payments" element={<FeatureAccessGuard feature="Supplier Payments"><SupplierPaymentsPage /></FeatureAccessGuard>} />
            <Route path="sales" element={<FeatureAccessGuard feature="Sales History"><SalesPage /></FeatureAccessGuard>} />
            <Route path="pos" element={<FeatureAccessGuard feature="POS System"><POSPage /></FeatureAccessGuard>} />
            <Route path="purchases" element={<FeatureAccessGuard feature="Purchase Management"><PurchasesPage /></FeatureAccessGuard>} />
            <Route path="purchases/orders" element={<FeatureAccessGuard feature="Purchase Orders"><PurchaseOrdersPage /></FeatureAccessGuard>} />
            <Route path="inventory/movements" element={<FeatureAccessGuard feature="Stock Movements"><StockMovementsPage /></FeatureAccessGuard>} />
            <Route path="inventory/stock-take" element={<FeatureAccessGuard feature="Stock Take"><StockTakePage /></FeatureAccessGuard>} />
            <Route path="inventory/batches" element={<FeatureAccessGuard feature="Batch Management"><BatchManagementPage /></FeatureAccessGuard>} />
            <Route path="inventory/reorder-alerts" element={<FeatureAccessGuard feature="Reorder Alerts"><ReorderAlertsPage /></FeatureAccessGuard>} />
            <Route path="einvoice" element={<FeatureAccessGuard feature="E-Invoice"><EInvoicePage /></FeatureAccessGuard>} />
            <Route path="reports" element={<FeatureAccessGuard feature="Reports & Analytics"><ReportsPage /></FeatureAccessGuard>} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="terms" element={<TermsAndConditions />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="refund" element={<RefundPolicy />} />
          </Route>

          {/* Admin Routes with Layout */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="payments" element={<PaymentManagementPage />} />
            <Route path="merchants" element={<MerchantsPage />} />
            <Route path="merchants/:merchantId" element={<MerchantDetailPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
          
          {/* 404 Not Found - Catch all unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
