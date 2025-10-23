# 📂 Codebase Index

## 📁 Root Directory
- `src/` – React/TS source code
- `public/` – Static assets (images, videos)
- `supabase/` – Supabase migrations & config
- `vercel.json` – Vercel deployment config (SPA rewrite)
- `vite.config.ts` – Vite build config (env handling)
- `package.json` – Dependencies & scripts
- `tsconfig.json` – TypeScript configuration (strict mode)
- `tailwind.config.js` – Tailwind CSS configuration
- `README.md` – Project overview and setup

## 📂 src/
### 📁 components/
- **auth/** – Authentication UI
  - `AuthPage.tsx` – Wrapper for login/signup
  - `LoginForm.tsx` – Login form (glassmorphism)
  - `SignUpForm.tsx` – Registration form
  - `ForgotPasswordModal.tsx` – Password reset modal
  - `ResetPasswordPage.tsx` – Reset password page
- **admin/** – Admin portal (platform admin)
  - `AdminLoginPage.tsx`
  - `AdminDashboard.tsx`
  - `PaymentManagementPage.tsx`
- **dashboard/** – Main dashboard UI
  - `Dashboard.tsx`
  - `MuiDashboard.tsx`
- **landing/** – Landing page & animations
  - `LandingPageNew.tsx`
  - `AdvancedAnimations.css`
  - `HorizontalParallax.css`
  - `useScrollAnimations.ts`
- **legal/** – Legal pages
  - `TermsAndConditions.tsx`
  - `PrivacyPolicy.tsx`
  - `RefundPolicy.tsx`
- **pos/** – Point‑of‑sale
  - `POSPage.tsx`
  - `ModernPOSPage.tsx`
  - `POSPage.css`
  - `DualCopyInvoice.tsx`
  - `BatchSelectionDialog.tsx`
- **inventory/** – Stock management
  - `StockMovementsPage.tsx`
  - `StockTakePage.tsx`
  - `BatchManagementPage.tsx`
  - `ReorderAlertsPage.tsx`
- **products/** – Product catalog UI
- **categories/** – Category management UI
- **customers/** – Customer management UI
- **suppliers/** – Supplier management UI
- **sales/** – Sales history UI
- **purchases/** – Purchase order UI
- **reports/** – Analytics & reporting UI
- **settings/** – Business settings UI
- **einvoice/** – E‑invoicing UI
- **common/** – Shared components
  - `NotFoundPage.tsx` – 404 page
  - `FeatureAccessGuard.tsx`
  - `SubscriptionBanner.tsx`
- **hooks/** – Custom React hooks
  - `useFeatureFlags.ts`
  - `useSubscription.ts`
  - `useSubscriptionAccess.ts`
- **lib/** – Utility libraries
  - `supabase.ts` – Supabase client & types
  - `dashboardQueries.ts`
  - `einvoiceGenerator.ts`
  - `reactPdfGenerator.tsx`
  - `reportPdfGenerator.tsx`
  - `irpApiService.ts`
  - `phonePeService.ts`
  - `sentry.ts`
- **utils/** – Helper functions
  - `gstCalculations.ts`
  - `invoiceTitles.ts`
  - `securityValidation.ts`
  - `debugStorage.ts`
  - `supabaseDebug.ts`
- **contexts/** – React context providers
  - `AuthContext.tsx` – Auth state, profile, merchant loading
- **types/** – TypeScript type definitions
  - `database.ts` – Supabase generated types
  - `index.ts` – App‑wide interfaces
- `App.tsx` – Main router, theming, auth guard
- `main.tsx` – Application entry point
- `index.css` – Global Tailwind CSS imports

## 📂 supabase/
- `migrations/` – 45 SQL migration files (core schema, stock, subscription, GST, etc.)
  - `20250101000002_corrected_full_schema.sql`
  - `20250913000001-3_enhanced_stock_management.sql`
  - `20250920000002_add_state_code_gst_logic.sql`
  - `20251022000001_subscription_billing_system.sql`
  - `20251022000002_payment_management_system.sql`
  - `20251022000003_payment_storage_bucket.sql`
  - `20251022000004_create_subscription_tables.sql`
  - *(additional migrations for core tables, RLS policies, audit logs)*
- `seed.sql` – Optional seed data for dev

## 📂 docs/
- `ENHANCED_STOCK_MANAGEMENT_INTEGRATION.md`
- `PHONEPE_INTEGRATION_GUIDE.md`
- `ADMIN_ACCESS_GUIDE.md`
- `DEPLOYMENT_CHECKLIST.md`
- `PRODUCTION_FIXES_SUMMARY.md`
- *(many other markdown docs for features, guides, and fixes)*

## 📂 public/
- `Login_background.mp4` – Video background for auth pages
- `phonepe-qr.png` – QR code for PhonePe integration
- Other static assets (images, icons)

## 🗂️ Important Config Files
- `vercel.json` – SPA rewrite to `/index.html` for all routes (prevents 404 on refresh)
- `vite.config.ts` – Vite build optimizations, env variable handling
- `.env.example` – Template for environment variables (Supabase URL, keys, PhonePe credentials, etc.)
- `package.json` – Scripts: `dev`, `build`, `preview`, `test`
- `tsconfig.json` – Strict TypeScript settings
- `tailwind.config.js` – Tailwind CSS customizations

## 🛠️ Core Functionality
- **Authentication** – Supabase Auth (email/password, password reset)
- **Multi‑tenant RBAC** – `profiles.role` & `is_platform_admin` flags, Row‑Level Security policies
- **Inventory Management** – Batch tracking, FEFO allocation, stock reservations, reorder alerts
- **POS** – Real‑time stock updates, batch selection, GST‑compliant invoices, payment processing
- **Subscription Billing** – Plans, trial periods, payment submissions, admin verification
- **E‑invoicing** – IRP API integration, QR codes, digital signatures
- **Admin Portal** – Payment verification, merchant management (future), analytics
- **Feature Flags** – `useFeatureFlags` hook for controlled rollouts
- **Security** – Rate limiting, audit logs, security headers, input validation

## 📦 Dependencies (key)
- `react`, `react-dom`, `react-router-dom`
- `@supabase/supabase-js`
- `@mui/material`, `@mui/icons-material`
- `tailwindcss`, `postcss`, `autoprefixer`
- `react-hook-form`, `zod`
- `react-hot-toast`
- `crypto-js`, `axios` (PhonePe integration)
- `react-pdf`, `recharts`, `framer-motion`, `lottie-react`

---

# 📚 How to Navigate
1. **Start at `src/App.tsx`** – See routing and auth flow.
2. **Auth flow** – `AuthContext.tsx` provides `signIn`, `signUp`, `signOut`.
3. **Admin vs User** – Role‑based routes in `App.tsx`.
4. **Inventory** – Look at `src/components/inventory/` for batch & reorder logic.
5. **POS** – `POSPage.tsx` and `BatchSelectionDialog.tsx` for FEFO.
6. **Subscriptions** – `src/components/subscription/SubscriptionPage.tsx` and related hooks.
7. **PhonePe** – `src/lib/phonePeService.ts` (placeholder) + docs.

---

# 🛠️ Common Tasks
- **Add a new feature** – Create component under `src/components/`, add route in `App.tsx`.
- **Add DB table** – Write migration in `supabase/migrations/`, run via Supabase UI.
- **Add env var** – Update `.env.example` and Vercel project settings.
- **Run locally** – `npm run dev` → http://localhost:5173
- **Deploy** – Push to `main` → Vercel auto‑deploy.

---

# 📈 Project Health
- **Tests:** None yet – consider adding Jest + React Testing Library.
- **Linting:** ESLint + Prettier configured.
- **Performance:** Code‑splitting, lazy loading, optimized Vite build.
- **Security:** RLS, security headers, input sanitization.

---

# 🎯 Next Steps (Suggested)
- ✅ Add unit tests for critical components (Auth, POS, Subscription).
- ✅ Implement PhonePe full integration (replace placeholder).
- ✅ Create admin merchant management UI.
- ✅ Add CI pipeline for lint + type‑check.
- ✅ Write migration for future features (e.g., stock transfer).

---

# 📜 License & Credits
- MIT License (see LICENSE file)
- Built with open‑source libraries listed in `package.json`.

---

*Generated by Cascade – your AI pair‑programmer.*

**Generated:** October 22, 2025  
**Tech Stack:** React 18 + TypeScript + Vite + Supabase + Material-UI + Tailwind CSS  
**Architecture:** Multi-tenant SaaS for fertilizer retailers/distributors

---

## 📁 Project Structure Overview

```
multi-tenant_fertilizer_inventory_management_system/
├── src/                          # Source code
│   ├── components/               # React components (organized by feature)
│   ├── contexts/                 # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Libraries and utilities
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Helper utilities
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── supabase/                     # Database migrations and schema
│   └── migrations/               # 45 SQL migration files
├── dist/                         # Production build output
├── public/                       # Static assets
├── devadmin/                     # Admin panel (separate module)
├── LP/                           # Landing page assets
└── [config files]                # Various configuration files
```

---

## 🎯 Core Application Files

### Entry Points
- **`src/main.tsx`** - Application bootstrap, renders App component
- **`src/App.tsx`** - Main app with routing, theming, authentication wrapper
- **`index.html`** - HTML entry point

### Global Styles
- **`src/index.css`** - Global CSS and Tailwind imports

---

## 🔐 Authentication & Authorization

### Components (`src/components/auth/`)
- **`AuthPage.tsx`** - Main authentication page container
- **`AuthPageComponent.tsx`** - Alternative auth page implementation
- **`LoginForm.tsx`** - Login form with glassmorphism design
- **`SignUpForm.tsx`** - User registration form
- **`ForgotPasswordModal.tsx`** - Password reset modal
- **`ResetPasswordPage.tsx`** - Password reset from email links
- **`ProtectedRoute.tsx`** - Route guard for authenticated users

### Context
- **`src/contexts/AuthContext.tsx`** - Authentication state management
  - User session management
  - Merchant data loading
  - Profile management
  - Password reset functionality

---

## 📊 Dashboard & Analytics

### Components (`src/components/dashboard/`)
- **`Dashboard.tsx`** - Main dashboard with KPI metrics
- **`MuiDashboard.tsx`** - Material-UI version of dashboard

### Data Layer
- **`src/lib/dashboardQueries.ts`** - Dashboard data fetching functions
  - Sales metrics
  - Inventory statistics
  - Revenue analytics
  - Low stock alerts

---

## 📦 Product Management

### Components (`src/components/products/`)
- **`ProductsPage.tsx`** - Product catalog listing and management
- **`ProductForm.tsx`** - Create/edit product form with:
  - Basic product information
  - Pricing and inventory
  - Fertilizer-specific fields (NPK, license numbers)
  - Batch tracking configuration
  - Reorder point settings
  - Product images

### Related Components
- **`src/components/categories/`**
  - `CategoriesPage.tsx` - Category management
  - `CategoryForm.tsx` - Category creation/editing

---

## 🏪 Point of Sale (POS)

### Components (`src/components/pos/`)
- **`POSPage.tsx`** - Complete POS system (96KB+ comprehensive)
  - Product search and selection
  - Cart management
  - Customer selection
  - Payment processing
  - Invoice generation
  - Real-time inventory updates
  - GST calculations (CGST+SGST vs IGST)
  - Batch selection for fertilizers

- **`ModernPOSPage.tsx`** - Alternative modern POS interface

- **`BatchSelectionDialog.tsx`** - FEFO batch selection dialog
  - First Expired, First Out allocation
  - Expiry date tracking
  - Batch quantity management

- **`DualCopyInvoice.tsx`** - GST-compliant invoice generation
  - Merchant details with licenses
  - Customer information
  - Product details with GST breakdown
  - Dynamic invoice titles
  - QR code integration

---

## 🛒 Sales Management

### Components (`src/components/sales/`)
- **`SalesPage.tsx`** - Sales history and management
  - Sales listing with filters
  - Sale details view
  - Credit sales tracking
  - Payment status management

---

## 📥 Purchase Management

### Components (`src/components/purchases/`)
- **`PurchasesPage.tsx`** - Purchase history and GRN (Goods Receipt Note)
- **`PurchaseForm.tsx`** - Enhanced purchase order form
  - Supplier selection
  - Product line items
  - Automatic batch creation
  - Expiry date tracking
  - Payment terms

### Purchase Orders (`src/components/purchases/po/`)
- **`PurchaseOrdersPage.tsx`** - Purchase order management
  - PO creation and tracking
  - Order status workflow
  - GRN generation

---

## 📦 Inventory Management

### Components (`src/components/inventory/`)
- **`StockMovementsPage.tsx`** - Complete stock audit trail
  - Movement history
  - Manual adjustments
  - Movement types (sale, purchase, adjustment, transfer)

- **`StockTakePage.tsx`** - Physical inventory counting
  - Stock count entry
  - Variance calculation
  - Adjustment generation

- **`BatchManagementPage.tsx`** - Batch/lot tracking
  - Batch listing with expiry dates
  - Expiry status indicators
  - Batch history
  - FEFO allocation

- **`ReorderAlertsPage.tsx`** - Automated reorder alerts
  - Critical/low/out-of-stock alerts
  - Alert acknowledgment
  - Reorder recommendations

---

## 👥 Customer Management

### Components (`src/components/customers/`)
- **`CustomersPage.tsx`** - Customer listing and management
- **`CustomerForm.tsx`** - Customer creation/editing
  - Basic information
  - GST details (GSTIN)
  - Address with state code
  - Credit limit management
  - Contact information

---

## 🏭 Supplier Management

### Components (`src/components/suppliers/`)
- **`SuppliersPage.tsx`** - Supplier listing and management
- **`SupplierForm.tsx`** - Supplier creation/editing
- **`SupplierPaymentsPage.tsx`** - Supplier payment tracking
  - Payment history
  - Outstanding balances
  - Payment recording

---

## 📄 E-Invoicing

### Components (`src/components/einvoice/`)
- **`EInvoicePage.tsx`** - E-invoice management
  - Invoice generation
  - IRP API integration
  - QR code generation
  - Digital signature support

### Libraries (`src/lib/`)
- **`einvoiceGenerator.ts`** - E-invoice data generation
- **`irpApiService.ts`** - IRP (Invoice Registration Portal) API integration
- **`reactPdfGenerator.tsx`** - PDF invoice generation
- **`enhancedInvoicePdf.tsx`** - Enhanced PDF templates
- **`exactFormatEInvoicePdf.tsx`** - Exact format compliance
- **`simpleInvoicePdf.tsx`** - Simple invoice template
- **`reportPdfGenerator.tsx`** - Report PDF generation

---

## 📈 Reports & Analytics

### Components (`src/components/reports/`)
- **`ReportsPage.tsx`** - Comprehensive reporting
  - Sales reports
  - Inventory reports
  - Purchase reports
  - Financial reports
  - GST reports
  - Custom date ranges
  - Export to PDF/Excel

---

## ⚙️ Settings

### Components (`src/components/settings/`)
- **`SettingsPage.tsx`** - Business configuration
  - Merchant information
  - GST registration details
  - License information (fertilizer, seed, pesticide)
  - Business address
  - Logo upload
  - Theme preferences (dark mode, compact view)
  - GST registration type (Regular, Composition, Exempt, Unregistered)

---

## 🔔 Notifications

### Components (`src/components/notifications/`)
- **`NotificationsPage.tsx`** - Notification center
- **`NotificationsPageFixed.tsx`** - Fixed version
- **`NotificationTypes.tsx`** - Notification type definitions

---

## 🎨 Layout Components

### Components (`src/components/layout/`)
- **`Layout.tsx`** - Main application layout wrapper
- **`Navbar.tsx`** - Top navigation bar
  - User menu
  - Merchant switcher
  - Notifications
  - Theme toggle

- **`Sidebar.tsx`** - Side navigation menu
  - Feature navigation
  - Role-based menu items
  - Collapsible sections

---

## 🌐 Landing Page

### Components (`src/components/landing/`)
- **`LandingPage.tsx`** - Marketing landing page
- **`LandingPageNew.tsx`** - Updated landing page
- **`LottieAnimations.tsx`** - Animation components

### Assets (`LP/`)
- `LandingPage.js` - Alternative landing page
- `LandingPage.css` - Landing page styles

---

## 🔧 Utilities & Helpers

### GST Calculations (`src/utils/`)
- **`gstCalculations.ts`** - GST calculation logic
  - Inter-state vs intra-state detection
  - CGST+SGST vs IGST calculation
  - Complete Indian states mapping with GST codes
  - State validation

- **`invoiceTitles.ts`** - Dynamic invoice titles
  - TAX INVOICE
  - BILL OF SUPPLY
  - INVOICE (for unregistered)
  - Based on GST registration type

- **`debugStorage.ts`** - Storage debugging utilities
- **`supabaseDebug.ts`** - Database debugging tools

---

## 📚 Libraries & Services

### Supabase (`src/lib/`)
- **`supabase.ts`** - Supabase client configuration
  - Client initialization
  - Type definitions
  - Helper functions

- **`supabaseClient.ts`** - Alternative client setup

### Other Libraries
- **`numberToWords.ts`** - Number to words conversion (for invoices)
- **`sentry.ts`** - Error tracking configuration

---

## 🎣 Custom Hooks

### Hooks (`src/hooks/`)
- **`useFeatureFlags.ts`** - Feature flag management
  - Enable/disable features
  - Role-based feature access

---

## 📝 Type Definitions

### Types (`src/types/`)
- **`database.ts`** - Generated Supabase types (27KB+)
  - All database table types
  - Relationship types
  - Enum types

- **`index.ts`** - Application-specific types
  - Business logic types
  - Component prop types
  - Form types

---

## 🗄️ Database Schema

### Migrations (`supabase/migrations/`) - 45 Files

#### Core Schema
- **`20250101000002_corrected_full_schema.sql`** - Complete schema reset and rebuild
  - Multi-tenant architecture
  - Row Level Security (RLS) policies
  - Core tables: merchants, profiles, products, categories, customers, suppliers

#### Enhanced Features
- **`20250913000001_enhanced_stock_management.sql`** - Advanced inventory
  - product_batches table
  - stock_reservations table
  - reorder_alerts table
  - stock_movements enhancements

- **`20250913000002_enhanced_stock_functions.sql`** - Stock functions
  - FEFO allocation logic
  - Reservation management
  - Automated triggers

- **`20250913000003_scheduled_reorder_alerts.sql`** - Automated alerts
  - Scheduled job system
  - Alert generation logic

#### GST Compliance
- **`20250920000002_add_state_code_gst_logic.sql`** - State codes and GST
  - State code columns
  - GST breakdown (CGST, SGST, IGST)
  - Indian states mapping
  - Automatic triggers

- **`20250920000003_add_dynamic_invoice_titles.sql`** - Invoice titles
- **`20250920114356_add_gst_registration_fields_to_merchants.sql`** - GST types

#### E-Invoicing
- **`20250908000000_add_e_invoicing.sql`** - E-invoice tables
- **`20250910_einvoice_schema.sql`** - Enhanced e-invoice schema
- **`20250910_einvoice_additional_fields.sql`** - Additional fields

#### Purchase Management
- **`20250908145500_purchase_orders_grn.sql`** - Purchase orders
- **`20250908151200_supplier_payments.sql`** - Supplier payments

#### Storage & Media
- **`20250909000000_merchant_logo_storage.sql`** - Logo storage
- **`20250909000001_storage_policies.sql`** - Storage policies
- **`20250911000001_add_product_images.sql`** - Product images

#### Admin & DevAdmin
- **`20250910105936_devadmin_schema_fixed.sql`** - Admin schema
- **`20250910105937_create_super_admin.sql`** - Super admin creation

#### Fixes & Enhancements
- Multiple RLS policy fixes
- Stock movement triggers
- User creation fixes
- Dashboard query optimizations

### Key Database Tables

#### Core Tables
- **merchants** - Business entities (multi-tenant)
- **profiles** - User profiles linked to merchants
- **products** - Product catalog with fertilizer fields
- **categories** - Product categorization
- **customers** - Customer management with GST
- **suppliers** - Supplier information

#### Transaction Tables
- **sales** / **sale_items** - Sales transactions
- **purchases** / **purchase_items** - Purchase transactions
- **purchase_orders** / **purchase_order_items** - PO management

#### Inventory Tables
- **product_batches** - Batch/lot tracking with expiry
- **stock_movements** - Complete audit trail
- **stock_reservations** - Prevent overselling
- **reorder_alerts** - Automated stock alerts

#### E-Invoice Tables
- **einvoice_documents** - E-invoice records
- **einvoice_items** - Invoice line items
- **einvoice_logs** - API logs

---

## ⚙️ Configuration Files

### Build & Development
- **`vite.config.ts`** - Vite configuration
  - React plugin
  - Build optimizations
  - Code splitting (react, supabase, mui, pdf, charts, animations)
  - Environment variable handling

- **`package.json`** - Dependencies and scripts
  - 30+ production dependencies
  - 14+ dev dependencies
  - Build, lint, format scripts

- **`tsconfig.json`** - TypeScript configuration
- **`tsconfig.app.json`** - App-specific TS config
- **`tsconfig.node.json`** - Node-specific TS config

### Code Quality
- **`eslint.config.js`** - ESLint configuration
- **`.prettierrc`** - Prettier formatting rules

### Styling
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration

### Deployment
- **`vercel.json`** - Vercel deployment config
  - Framework: Vite
  - Region: Mumbai (bom1)
  - SPA routing configuration

- **`.env.example`** - Environment variables template
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

### Git
- **`.gitignore`** - Git ignore patterns

---

## 📖 Documentation Files

### Deployment Guides
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`DEPLOYMENT_CHECKLIST.md`** - Pre-deployment checklist
- **`DEPLOYMENT_SUMMARY.md`** - Deployment summary
- **`DEPLOYMENT_WORKFLOW.md`** - Git + Vercel workflow
- **`AUTOMATIC_DEPLOYMENT_CHECKLIST.md`** - Automated deployment
- **`VERCEL_DEPLOYMENT.md`** - Vercel-specific guide
- **`ROLLBACK_PROCEDURE.md`** - Rollback procedures

### Feature Documentation
- **`ENHANCED_STOCK_MANAGEMENT_INTEGRATION.md`** - Stock management guide
- **`PRODUCT_CARD_UI_FIXES.md`** - UI fix documentation

### Project Documentation
- **`README.md`** - Main project README
- **`CHANGELOG.md`** - Version history
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`LICENSE`** - MIT License
- **`SECURITY.md`** - Security policies

---

## 🔍 Common Patterns & Conventions

### Component Structure
```typescript
// Standard component pattern
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function ComponentName() {
  const { user, merchant } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [merchant?.id]);

  const fetchData = async () => {
    // Fetch logic with RLS
  };

  return (
    // JSX
  );
}
```

### Database Queries
```typescript
// Multi-tenant query pattern
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('merchant_id', merchantId)
  .order('created_at', { ascending: false });
```

### Form Handling
- React Hook Form for form state
- Material-UI components
- Validation with error messages
- Toast notifications for feedback

### Styling Approach
- Tailwind CSS for utility classes
- Material-UI for component library
- Custom CSS for specific animations
- Responsive design (mobile-first)

---

## 🔐 Security Features

### Authentication
- JWT-based authentication via Supabase
- Session management
- Password reset functionality
- Protected routes

### Authorization
- Row Level Security (RLS) on all tables
- Multi-tenant data isolation
- Role-based access control (admin, staff, cashier)
- Merchant-based permissions

### Data Security
- Secure file storage with access policies
- Input validation and sanitization
- SQL injection prevention (Supabase)
- XSS protection

---

## 🚀 Performance Optimizations

### Build Optimizations
- Code splitting by feature
- Lazy loading for routes
- Tree shaking
- Minification with Terser
- Source maps for debugging

### Runtime Optimizations
- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Efficient re-renders
- Database indexes on frequently queried columns

### Asset Optimization
- Image optimization
- Font loading strategies
- CSS purging (Tailwind)

---

## 🧪 Testing & Quality

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript checking
```

### Code Quality Tools
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Sentry for error tracking

---

## 📦 Key Dependencies

### Core Framework
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^6.25.1
- typescript: ^5.5.4
- vite: ^5.3.5

### UI Framework
- @mui/material: ^5.16.5
- @mui/icons-material: ^5.16.5
- @mui/x-data-grid: ^7.11.0
- tailwindcss: ^4.1.13
- framer-motion: ^12.23.12
- lottie-react: ^2.4.1

### Backend & Database
- @supabase/supabase-js: ^2.39.1
- react-hook-form: ^7.52.1
- date-fns: ^3.6.0

### Business Features
- @react-pdf/renderer: ^4.3.0
- qrcode.react: ^4.2.0
- recharts: ^2.12.7
- react-hot-toast: ^2.4.1

### Monitoring
- @sentry/react: ^10.11.0

---

## 🌟 Key Features Summary

### Multi-Tenant Architecture
- Complete data isolation per merchant
- Shared infrastructure
- RLS policies for security

### Inventory Management
- Real-time stock tracking
- Batch/lot management with expiry
- FEFO allocation for fertilizers
- Automated reorder alerts
- Stock reservations
- Complete audit trail

### GST Compliance
- Inter-state vs intra-state detection
- CGST+SGST vs IGST calculation
- Complete Indian states mapping
- Dynamic invoice titles
- GST registration types

### Point of Sale
- Fast product search
- Cart management
- Customer selection
- Multiple payment methods
- Real-time inventory updates
- GST-compliant invoices

### E-Invoicing
- IRP API integration
- QR code generation
- Digital signatures
- Compliance with Indian standards

### Purchase Management
- Purchase orders
- GRN (Goods Receipt Note)
- Automatic batch creation
- Supplier payment tracking

### Reporting
- Sales reports
- Inventory reports
- Financial reports
- GST reports
- PDF export

---

## 📞 Support & Resources

### Documentation
- README.md for quick start
- Deployment guides for production
- Feature-specific documentation
- API documentation (Supabase)

### Development
- GitHub repository
- Issue tracking
- Pull request workflow
- Code review process

---

## 🗺️ Roadmap

### Completed Features ✅
- Multi-tenant architecture
- Complete inventory management
- POS system with batch selection
- GST compliance
- E-invoicing
- Purchase management
- Supplier payments
- Advanced reporting
- Dark mode & themes

### In Progress 🚧
- Enhanced purchase forms
- Advanced analytics dashboard

### Planned Features 📋
- Mobile app (React Native)
- Multi-language support
- Accounting software integration
- Advanced analytics
- Barcode scanning
- Warehouse management
- Multi-location support

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Maintained By:** D4rkC0m3t

---

*This index provides a comprehensive overview of the codebase structure, components, and features. For specific implementation details, refer to individual files and their inline documentation.*
