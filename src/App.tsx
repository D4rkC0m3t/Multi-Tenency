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
import LandingPage from './components/landing/LandingPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';


function AppContent() {
  const { user, loading, merchant } = useAuth();
  const defaultTheme = createTheme();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show landing page or auth pages for non-authenticated users
  if (!user) {
    return (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
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
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="suppliers/payments" element={<SupplierPaymentsPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="purchases/orders" element={<PurchaseOrdersPage />} />
            <Route path="inventory/movements" element={<StockMovementsPage />} />
            <Route path="inventory/stock-take" element={<StockTakePage />} />
            <Route path="inventory/batches" element={<BatchManagementPage />} />
            <Route path="inventory/reorder-alerts" element={<ReorderAlertsPage />} />
            <Route path="einvoice" element={<EInvoicePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
