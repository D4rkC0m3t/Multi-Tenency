# 📚 Complete Codebase Index - Multi-Tenant Fertilizer Inventory Management System

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Tech Stack:** React 18 + TypeScript + Vite + Supabase + Material-UI + Tailwind CSS

---

## 🎯 Project Overview

A comprehensive multi-tenant SaaS application designed for fertilizer retailers and distributors in India. Features include inventory management, POS system, GST compliance, e-invoicing, subscription management, and advanced stock tracking with FEFO (First Expired, First Out) logic.

**Repository:** https://github.com/D4rkC0m3t/Multi-Tenency  
**Deployment:** Vercel (Production-ready)

---

## 📁 Project Structure

```
multi-tenant_fertilizer_inventory_management_system/
├── src/                          # Source code
│   ├── components/               # React components (64 items)
│   ├── contexts/                 # State management (1 item)
│   ├── hooks/                    # Custom hooks (2 items)
│   ├── lib/                      # Libraries & utilities (13 items)
│   ├── types/                    # TypeScript definitions (2 items)
│   ├── utils/                    # Helper functions (4 items)
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── supabase/                     # Database migrations
│   └── migrations/               # 31+ SQL migration files
├── dist/                         # Production build
├── LP/                           # Landing page assets
├── devadmin/                     # Admin panel
└── [config files]                # Build & deployment configs
```

---

## 🧩 Core Components Architecture

### 1. **Authentication System** (`src/components/auth/`)
- **AuthPage.tsx** - Main authentication page with routing
- **LoginForm.tsx** - Login with glassmorphism design & animations
- **SignUpForm.tsx** - Registration with merchant onboarding
- **ForgotPasswordModal.tsx** - Password reset modal
- **ResetPasswordPage.tsx** - Password reset from email links
- **ProtectedRoute.tsx** - Route protection wrapper
- **AuthPageComponent.tsx** - Alternative auth component

**Features:**
- Supabase authentication integration
- Multi-tenant user management
- Role-based access (admin/staff/cashier)
- Password reset functionality
- Session management

---

### 2. **Dashboard & Analytics** (`src/components/dashboard/`)
- **Dashboard.tsx** - Main dashboard with metrics & charts
- **MuiDashboard.tsx** - Material-UI version of dashboard

**Key Metrics:**
- Total sales & revenue
- Stock levels & alerts
- Purchase orders status
- Customer analytics
- Real-time inventory updates

---

### 3. **Point of Sale (POS) System** (`src/components/pos/`)
- **POSPage.tsx** (96KB+) - Comprehensive POS system
- **ModernPOSPage.tsx** - Alternative modern UI
- **POSPage_backup.tsx** - Backup version
- **DualCopyInvoice.tsx** - GST-compliant invoice generation
- **BatchSelectionDialog.tsx** - FEFO batch selection
- **InvoicePreview.tsx** - Invoice preview component
- **POSInvoice.tsx** - Invoice template

**Features:**
- Real-time inventory updates
- Batch/lot selection with expiry tracking
- GST calculation (CGST+SGST vs IGST)
- Multiple payment methods
- Customer credit management
- Barcode scanning support
- Invoice generation & printing
- Walk-in customer support

---

### 4. **Inventory Management** (`src/components/inventory/`)
- **StockMovementsPage.tsx** - Complete audit trail
- **StockTakePage.tsx** - Physical inventory counting
- **BatchManagementPage.tsx** - Batch/lot tracking with expiry
- **ReorderAlertsPage.tsx** - Automated reorder alerts

**Advanced Features:**
- FEFO (First Expired, First Out) allocation
- Stock reservation system
- Real-time stock movements
- Expiry date tracking
- Automated reorder alerts (critical/low/out-of-stock)
- Batch-wise inventory management
- Stock adjustment with reasons

---

### 5. **Product Management** (`src/components/products/`)
- **ProductsPage.tsx** - Product catalog management
- **ProductForm.tsx** - Product creation/editing with validation

**Product Fields:**
- Basic info (name, SKU, category)
- Pricing (MRP, selling price, purchase price)
- Stock management (quantity, reorder level)
- Batch tracking (enable/disable)
- GST rates & HSN codes
- Fertilizer-specific fields (license numbers)
- Product images with Supabase storage

---

### 6. **Customer Management** (`src/components/customers/`)
- **CustomersPage.tsx** - Customer database
- **CustomerForm.tsx** - Customer creation/editing

**Customer Features:**
- Complete address with GST state codes
- GSTIN validation
- Credit limit management
- Payment terms
- Transaction history
- Outstanding balance tracking

---

### 7. **Supplier Management** (`src/components/suppliers/`)
- **SuppliersPage.tsx** - Supplier database
- **SupplierForm.tsx** - Supplier creation/editing
- **SupplierPaymentsPage.tsx** - Payment tracking

**Features:**
- Supplier contact information
- Payment terms & credit limits
- Purchase history
- Outstanding payments
- Payment reconciliation

---

### 8. **Purchase Management** (`src/components/purchases/`)
- **PurchasesPage.tsx** - Purchase order management
- **PurchaseForm.tsx** - Enhanced purchase order creation
- **PurchaseOrdersPage.tsx** - PO tracking
- **GoodsReceiptPage.tsx** - GRN (Goods Receipt Note)
- **PurchaseInvoicePage.tsx** - Purchase invoice management

**Features:**
- Purchase order creation & approval
- Automatic batch creation from orders
- GRN with quality checks
- Invoice matching
- Supplier payment tracking
- Stock updates on receipt

---

### 9. **Sales Management** (`src/components/sales/`)
- **SalesPage.tsx** - Sales history & management
- **SalesForm.tsx** - Manual sales entry
- **EInvoiceManager.tsx** - E-invoice management
- **SalesReturnsPage.tsx** - Return management

**Features:**
- Sales history with filters
- Credit sales tracking
- Payment collection
- Sales returns & refunds
- E-invoice generation
- GST reports

---

### 10. **E-Invoicing System** (`src/components/einvoice/`)
- **EInvoicePage.tsx** - E-invoice dashboard

**Integration:**
- IRP (Invoice Registration Portal) API
- QR code generation
- Digital signature support
- GST compliance
- IRN (Invoice Reference Number) generation
- E-way bill integration

---

### 11. **Reports & Analytics** (`src/components/reports/`)
- **ReportsPage.tsx** - Comprehensive reporting dashboard

**Available Reports:**
- Sales reports (daily/monthly/yearly)
- Purchase reports
- Stock reports
- GST reports (GSTR-1, GSTR-3B)
- Profit & loss statements
- Customer ledger
- Supplier ledger
- Inventory valuation
- Expiry reports

---

### 12. **Settings & Configuration** (`src/components/settings/`)
- **SettingsPage.tsx** - Business settings
- **EInvoiceSettings.tsx** - E-invoice configuration

**Configuration Options:**
- Business information
- GST registration details
- License numbers (fertilizer, seed, pesticide)
- Invoice templates
- Payment methods
- Tax settings
- User management
- Role permissions

---

### 13. **Subscription Management** (`src/components/subscription/`)
- **SubscriptionPage.tsx** - Subscription plans & billing

**Features:**
- Multiple subscription tiers
- PhonePe payment integration
- Automatic renewal
- Usage tracking
- Feature flags based on plan
- Payment history

---

### 14. **Admin Panel** (`src/components/admin/`)
- **PaymentManagementPage.tsx** - Payment tracking & reconciliation

**Admin Features:**
- Merchant management
- Subscription management
- Payment reconciliation
- System analytics
- User activity logs

---

### 15. **Landing Page** (`src/components/landing/`)
- **LandingPage.tsx** - Main landing page
- **LandingPageNew.tsx** - Alternative design
- **LottieAnimations.tsx** - Animation components
- **Features.tsx** - Feature showcase
- **Pricing.tsx** - Pricing plans
- **Testimonials.tsx** - Customer testimonials
- **ContactForm.tsx** - Contact form

**Design Features:**
- Glassmorphism effects
- Framer Motion animations
- Lottie animations
- Parallax scrolling
- Responsive design
- Dark/light theme

---

### 16. **Layout Components** (`src/components/layout/`)
- **Layout.tsx** - Main layout wrapper
- **Navbar.tsx** - Top navigation bar
- **Sidebar.tsx** - Side navigation menu

**Features:**
- Responsive navigation
- Theme switcher
- User profile menu
- Notification center
- Quick actions

---

### 17. **Notifications System** (`src/components/notifications/`)
- **NotificationsPage.tsx** - Notification center
- **NotificationsPageFixed.tsx** - Fixed version
- **NotificationTypes.tsx** - Type definitions

**Notification Types:**
- Low stock alerts
- Expiry warnings
- Payment reminders
- Order updates
- System notifications

---

### 18. **Common Components** (`src/components/common/`)
- **InvoiceQRCode.tsx** - QR code generator
- **LoadingStates.tsx** - Loading indicators
- **QRCodeGenerator.tsx** - Generic QR generator

---

### 19. **Categories Management** (`src/components/categories/`)
- **CategoriesPage.tsx** - Category management
- **CategoryForm.tsx** - Category creation/editing

---

### 20. **Error Handling** (`src/components/`)
- **ErrorBoundary.tsx** - Global error boundary

---

## 🔧 Core Libraries & Utilities

### State Management (`src/contexts/`)
- **AuthContext.tsx** (6KB) - Authentication & user state
  - User authentication
  - Session management
  - Role-based permissions
  - Merchant context

### Custom Hooks (`src/hooks/`)
- **useFeatureFlags.ts** - Feature flag management
- **useSubscription.ts** - Subscription state & validation

### Libraries (`src/lib/`)
1. **supabase.ts** (9KB) - Supabase client & type definitions
2. **supabaseClient.ts** (3KB) - Alternative client
3. **dashboardQueries.ts** (5KB) - Dashboard data queries
4. **einvoiceGenerator.ts** (14KB) - E-invoice generation logic
5. **irpApiService.ts** (15KB) - IRP API integration
6. **phonePeService.ts** (9KB) - PhonePe payment integration
7. **reactPdfGenerator.tsx** (16KB) - PDF invoice generation
8. **reportPdfGenerator.tsx** (26KB) - Report PDF generation
9. **enhancedInvoicePdf.tsx** (20KB) - Enhanced invoice template
10. **exactFormatEInvoicePdf.tsx** (31KB) - Exact format e-invoice
11. **simpleInvoicePdf.tsx** (11KB) - Simple invoice template
12. **numberToWords.ts** (2KB) - Number to words converter
13. **sentry.ts** (1.5KB) - Error tracking configuration

### Utilities (`src/utils/`)
1. **gstCalculations.ts** (7KB) - GST logic for inter-state/intra-state
2. **invoiceTitles.ts** (7KB) - Dynamic invoice titles
3. **debugStorage.ts** (2KB) - Storage debugging
4. **supabaseDebug.ts** (2KB) - Database debugging

### Type Definitions (`src/types/`)
1. **database.ts** (27KB+) - Generated Supabase types
2. **index.ts** - Application-specific types

---

## 🗄️ Database Architecture

### Migration Files (31+ migrations in `supabase/migrations/`)

**Core Schema Migrations:**
1. `20250101000002_corrected_full_schema.sql` - Complete schema reset
2. `20250125_fertilizer_inventory_schema.sql` - Initial schema
3. `20250716120000_comprehensive_schema_update.sql` - Major update
4. `20250720120100_fixed_full_schema.sql` - Schema fixes
5. `20250728120000_fix_schema_dependencies.sql` - Dependency fixes

**Feature Migrations:**
6. `20250908000000_add_e_invoicing.sql` - E-invoicing tables
7. `20250908113000_inventory_triggers.sql` - Stock triggers
8. `20250908142000_credit_sales_columns.sql` - Credit sales
9. `20250908145500_purchase_orders_grn.sql` - Purchase orders
10. `20250908151200_supplier_payments.sql` - Payment tracking
11. `20250909000000_merchant_logo_storage.sql` - Logo storage
12. `20250909000001_storage_policies.sql` - Storage RLS
13. `20250909164500_add_comprehensive_merchant_fields.sql` - Merchant fields
14. `20250909165000_add_product_compliance_fields.sql` - Compliance fields

**Admin & Auth Migrations:**
15. `20250910105936_devadmin_schema_fixed.sql` - Admin schema
16. `20250910105937_create_super_admin.sql` - Super admin
17. `20250910110000_fix_user_creation_issue.sql` - User creation fix
18. `20250910120000_fix_rls_recursion.sql` - RLS fixes
19. `20250910180000_fix_admin_login_comprehensive.sql` - Admin login

**Enhanced Stock Management:**
20. `20250913000001_enhanced_stock_management.sql` - Batch tracking
21. `20250913000002_advanced_stock_functions.sql` - FEFO logic
22. `20250913000003_stock_scheduled_jobs.sql` - Automated jobs

**GST & Compliance:**
23. `20250920000002_add_state_code_gst_logic.sql` - State codes & GST

**Subscription System:**
24. `20251021000001_subscription_system.sql` - Subscription tables
25. `20251021000002_phonepe_integration.sql` - Payment integration

**Additional Migrations:**
26-31. Various fixes for notifications, storage, RLS policies, and product images

### Database Tables

**Core Entities:**
- `merchants` - Business entities (multi-tenant)
- `profiles` - User profiles linked to merchants
- `products` - Product catalog
- `categories` - Product categorization
- `customers` - Customer database
- `suppliers` - Supplier information

**Transactions:**
- `sales` / `sale_items` - Sales transactions
- `purchases` / `purchase_items` - Purchase transactions
- `purchase_orders` / `purchase_order_items` - PO management
- `goods_receipts` / `goods_receipt_items` - GRN

**Inventory:**
- `product_batches` - Batch/lot tracking
- `stock_movements` - Audit trail
- `stock_reservations` - Prevent overselling
- `reorder_alerts` - Automated alerts
- `inventory_adjustments` - Stock adjustments

**E-Invoicing:**
- `einvoice_credentials` - API credentials
- `einvoice_logs` - Transaction logs
- `einvoice_irn` - IRN tracking

**Payments:**
- `supplier_payments` - Supplier payments
- `customer_payments` - Customer payments
- `payment_transactions` - PhonePe transactions

**Subscription:**
- `subscription_plans` - Plan definitions
- `merchant_subscriptions` - Active subscriptions
- `subscription_payments` - Payment history

**Notifications:**
- `notifications` - User notifications
- `notification_templates` - Email templates

**Admin:**
- `admin_users` - Super admin users
- `system_logs` - Activity logs

---

## 📦 Dependencies

### Core Framework
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.5.4",
  "vite": "^5.3.5"
}
```

### UI Framework
```json
{
  "@mui/material": "^5.16.5",
  "@mui/icons-material": "^5.16.5",
  "@mui/x-data-grid": "^7.11.0",
  "@mui/x-date-pickers": "^8.11.1",
  "tailwindcss": "^4.1.13",
  "framer-motion": "^12.23.12",
  "lottie-react": "^2.4.1",
  "lucide-react": "^0.544.0"
}
```

### Backend & Database
```json
{
  "@supabase/supabase-js": "^2.39.1",
  "react-hook-form": "^7.52.1",
  "date-fns": "^3.6.0"
}
```

### Business Features
```json
{
  "@react-pdf/renderer": "^4.3.0",
  "qrcode.react": "^4.2.0",
  "recharts": "^2.12.7",
  "react-hot-toast": "^2.4.1",
  "@sentry/react": "^10.11.0"
}
```

### Animations & Effects
```json
{
  "gsap": "^3.13.0",
  "three": "^0.180.0",
  "react-parallax-tilt": "^1.7.308",
  "react-intersection-observer": "^9.16.0"
}
```

---

## 🎨 Design System

### Color Palette
- **Primary:** Green (#16A34A) - Growth & Agriculture
- **Secondary:** Blue (#06B6D4) - Trust & Technology
- **Accent:** Orange (#F59E0B) - Energy & Action
- **Dark Theme:** Navy/Black (#0A0F19, #0D131D)
- **Light Theme:** White & Grays

### Design Patterns
1. **Glassmorphism** - Semi-transparent backgrounds with blur
2. **Gradient Overlays** - Depth and visual hierarchy
3. **Card-based Layout** - Organized information display
4. **Responsive Grid** - Mobile-first approach
5. **Smooth Animations** - Framer Motion transitions
6. **Loading States** - Skeleton screens & spinners

### Typography
- **Headings:** Bold, gradient text effects
- **Body:** Clean, readable fonts
- **Emphasis:** Italic for key terms
- **Hierarchy:** Proper h1-h6 scaling

---

## 🔐 Security Features

### Authentication
- JWT-based authentication via Supabase
- Session management
- Password reset functionality
- Multi-factor authentication ready

### Authorization
- Row Level Security (RLS) on all tables
- Multi-tenant data isolation
- Role-based access control (RBAC)
- Merchant-based data segregation

### Data Protection
- Input validation & sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure file storage with access policies

---

## 🚀 Deployment Configuration

### Vercel (`vercel.json`)
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables
```env
VITE_SUPABASE_URL=https://fdukxfwdlwskznyezgr.supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
VITE_PHONEPE_MERCHANT_ID=[merchant_id]
VITE_PHONEPE_SALT_KEY=[salt_key]
VITE_SENTRY_DSN=[sentry_dsn]
```

### Build Configuration (`vite.config.ts`)
- Code splitting for optimal loading
- Chunk optimization for libraries
- Asset optimization
- Source maps for debugging

---

## 📚 Documentation Files

### Deployment Guides
1. **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
2. **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
3. **DEPLOYMENT_WORKFLOW.md** - Git + Vercel workflow
4. **DEPLOYMENT_SUMMARY.md** - Deployment summary
5. **AUTOMATIC_DEPLOYMENT_CHECKLIST.md** - CI/CD checklist
6. **VERCEL_DEPLOYMENT.md** - Vercel-specific guide
7. **ROLLBACK_PROCEDURE.md** - Emergency rollback steps

### Feature Documentation
8. **ENHANCED_STOCK_MANAGEMENT_INTEGRATION.md** - Stock system guide
9. **PAYMENT_SYSTEM_GUIDE.md** - Payment integration guide
10. **PHONEPE_SUBSCRIPTION_IMPLEMENTATION.md** - PhonePe setup
11. **SUPABASE_EMAIL_CONFIGURATION.md** - Email setup

### Design Documentation
12. **ELEGANT_DESIGN_SUMMARY.md** - Design system overview
13. **DARK_THEME_ENHANCEMENTS.md** - Dark theme guide
14. **ADVANCED_ANIMATIONS_COMPLETE.md** - Animation patterns
15. **HORIZONTAL_PARALLAX_DESIGN.md** - Parallax effects
16. **LANDING_PAGE_ENHANCEMENTS.md** - Landing page features
17. **PRODUCT_CARD_UI_FIXES.md** - UI component fixes

### Project Management
18. **README.md** - Project overview & quick start
19. **CHANGELOG.md** - Version history
20. **CONTRIBUTING.md** - Contribution guidelines
21. **SECURITY.md** - Security policies
22. **LICENSE** - MIT License
23. **CODEBASE_INDEX.md** - Previous index (outdated)

---

## 🔄 Key Business Flows

### 1. Sales Flow (POS)
```
Customer Selection → Product Selection → Batch Selection (if enabled) 
→ Cart Management → Payment → Invoice Generation → Stock Update 
→ E-Invoice (if applicable)
```

### 2. Purchase Flow
```
Create PO → Supplier Approval → GRN → Quality Check 
→ Batch Creation → Stock Update → Invoice Matching → Payment
```

### 3. Inventory Flow
```
Stock Movement → Batch Allocation (FEFO) → Reservation 
→ Expiry Tracking → Reorder Alerts → Stock Take
```

### 4. GST Compliance Flow
```
Transaction → State Detection → GST Calculation 
(CGST+SGST vs IGST) → Invoice Generation → E-Invoice → GST Reports
```

---

## 🧪 Testing & Quality

### Code Quality Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Sentry** - Error tracking

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript checking
npm run prepare          # All quality checks
npm run build:analyze    # Bundle analysis
npm run audit:security   # Security audit
```

---

## 📊 Performance Optimizations

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- Efficient re-renders with React patterns
- Memoization for expensive computations

### Database
- Indexes on frequently queried columns
- Efficient RLS policies
- Optimized queries with proper joins
- Connection pooling

### Build
- Terser for minification
- Tree shaking for unused code
- Chunk optimization for libraries
- Asset compression

---

## 🎯 Feature Flags

Managed via `useFeatureFlags` hook:
- **Batch Management** - Enable/disable batch tracking
- **E-Invoicing** - E-invoice generation
- **Subscription Features** - Plan-based features
- **Advanced Reports** - Premium reporting
- **Multi-location** - Multiple warehouse support

---

## 🔮 Future Roadmap

### Planned Features
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support (i18n)
- [ ] Accounting Software Integration
- [ ] Barcode Scanner Integration
- [ ] WhatsApp Notifications
- [ ] Automated Backup System
- [ ] Multi-warehouse Management
- [ ] Advanced Pricing Rules
- [ ] Loyalty Program

### In Progress
- [x] Enhanced Stock Management (COMPLETED)
- [x] PhonePe Subscription System (COMPLETED)
- [x] E-Invoicing Integration (COMPLETED)
- [x] GST Compliance (COMPLETED)

---

## 📞 Support & Contact

- **Email:** support@example.com
- **GitHub Issues:** https://github.com/D4rkC0m3t/Multi-Tenency/issues
- **Documentation:** See markdown files in root directory

---

## 🙏 Acknowledgments

Built with:
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework
- [Supabase](https://supabase.com/) - Backend platform
- [Material-UI](https://mui.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

**Made with ❤️ for fertilizer retailers and distributors in India**

*This index was generated on October 22, 2025*
