# 🔗 URL Links Reference - KrishiSethu System

**Last Updated:** October 22, 2025  
**Domain:** Replace `yourdomain.com` with your actual domain

---

## 🌐 Production URLs

### **Base URL**
```
https://yourdomain.com
```

---

## 🔓 Public Pages (No Authentication Required)

### **Landing & Marketing**
| Page | URL | Description |
|------|-----|-------------|
| Landing Page | `https://yourdomain.com/` | Main landing page |
| Login | `https://yourdomain.com/login` | User login page |
| Auth | `https://yourdomain.com/auth` | Authentication page |

### **Legal Pages** (Required for PhonePe)
| Page | URL | Description |
|------|-----|-------------|
| Terms & Conditions | `https://yourdomain.com/terms` | T&C for PhonePe integration |
| Privacy Policy | `https://yourdomain.com/privacy` | Privacy policy for PhonePe |
| Refund Policy | `https://yourdomain.com/refund` | Refund policy for PhonePe |

### **Password Reset**
| Page | URL | Description |
|------|-----|-------------|
| Reset Password | `https://yourdomain.com/reset-password` | Password reset from email |

---

## 🔐 Authenticated Pages (Login Required)

### **Dashboard & Core**
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `https://yourdomain.com/` | Main dashboard |
| Dashboard Alt | `https://yourdomain.com/dashboard` | Alternative dashboard route |

### **Inventory Management**
| Page | URL | Description |
|------|-----|-------------|
| Products | `https://yourdomain.com/products` | Product catalog |
| Categories | `https://yourdomain.com/categories` | Product categories |
| Stock Movements | `https://yourdomain.com/inventory/movements` | Stock audit trail |
| Stock Take | `https://yourdomain.com/inventory/stock-take` | Physical inventory count |
| Batch Management | `https://yourdomain.com/inventory/batches` | Batch/lot tracking |
| Reorder Alerts | `https://yourdomain.com/inventory/reorder-alerts` | Low stock alerts |

### **Sales & POS**
| Page | URL | Description |
|------|-----|-------------|
| Point of Sale | `https://yourdomain.com/pos` | POS system |
| Sales History | `https://yourdomain.com/sales` | Sales records |

### **Purchases**
| Page | URL | Description |
|------|-----|-------------|
| Purchases | `https://yourdomain.com/purchases` | Purchase records |
| Purchase Orders | `https://yourdomain.com/purchases/orders` | PO management |

### **Customers & Suppliers**
| Page | URL | Description |
|------|-----|-------------|
| Customers | `https://yourdomain.com/customers` | Customer database |
| Suppliers | `https://yourdomain.com/suppliers` | Supplier database |
| Supplier Payments | `https://yourdomain.com/suppliers/payments` | Payment tracking |

### **E-Invoicing & Reports**
| Page | URL | Description |
|------|-----|-------------|
| E-Invoice | `https://yourdomain.com/einvoice` | E-invoice generation |
| Reports | `https://yourdomain.com/reports` | Analytics & reports |

### **System**
| Page | URL | Description |
|------|-----|-------------|
| Notifications | `https://yourdomain.com/notifications` | User notifications |
| Settings | `https://yourdomain.com/settings` | Business settings |

### **Subscription & Billing** ⭐
| Page | URL | Description |
|------|-----|-------------|
| Subscription | `https://yourdomain.com/subscription` | User subscription management |
| Admin Payments | `https://yourdomain.com/admin/payments` | Admin payment verification |

---

## 📱 API Endpoints (Supabase)

### **Base API URL**
```
https://fdukxfwdlwskznyezgr.supabase.co
```

### **Authentication**
```
POST https://fdukxfwdlwskznyezgr.supabase.co/auth/v1/signup
POST https://fdukxfwdlwskznyezgr.supabase.co/auth/v1/token
POST https://fdukxfwdlwskznyezgr.supabase.co/auth/v1/recover
```

### **Database Tables** (via REST API)
```
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/merchants
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/products
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/customers
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/sales
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/purchases
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/user_subscriptions
GET/POST https://fdukxfwdlwskznyezgr.supabase.co/rest/v1/payment_submissions
```

### **Storage**
```
https://fdukxfwdlwskznyezgr.supabase.co/storage/v1/object/public/payments/
https://fdukxfwdlwskznyezgr.supabase.co/storage/v1/object/public/product-images/
https://fdukxfwdlwskznyezgr.supabase.co/storage/v1/object/public/merchant-logos/
```

---

## 🔗 Deep Links for Mobile/Email

### **Direct Actions**
```
# Login with redirect
https://yourdomain.com/login?redirect=/dashboard

# Subscription page
https://yourdomain.com/subscription

# Payment submission
https://yourdomain.com/subscription?action=submit

# Admin payment verification
https://yourdomain.com/admin/payments?filter=pending

# Password reset
https://yourdomain.com/reset-password?token={reset_token}
```

---

## 📋 PhonePe Integration URLs

### **Required for PhonePe Merchant Dashboard**

When activating PhonePe Payment Gateway, provide these URLs:

1. **Terms and Conditions URL:**
   ```
   https://yourdomain.com/terms
   ```

2. **Privacy Policy URL:**
   ```
   https://yourdomain.com/privacy
   ```

3. **Refund Policy URL:**
   ```
   https://yourdomain.com/refund
   ```

4. **Website URL:**
   ```
   https://yourdomain.com
   ```

5. **Callback URL (if using API):**
   ```
   https://yourdomain.com/api/phonepe/callback
   ```

---

## 🌍 Environment-Specific URLs

### **Development (Local)**
```
Base: http://localhost:5173
Dashboard: http://localhost:5173/dashboard
Subscription: http://localhost:5173/subscription
Admin Payments: http://localhost:5173/admin/payments
Terms: http://localhost:5173/terms
Privacy: http://localhost:5173/privacy
Refund: http://localhost:5173/refund
```

### **Staging (Vercel Preview)**
```
Base: https://your-project-git-branch.vercel.app
Dashboard: https://your-project-git-branch.vercel.app/dashboard
Subscription: https://your-project-git-branch.vercel.app/subscription
```

### **Production (Vercel)**
```
Base: https://yourdomain.com (or your-project.vercel.app)
Dashboard: https://yourdomain.com/dashboard
Subscription: https://yourdomain.com/subscription
```

---

## 📧 Email Templates - URL Variables

### **For Automated Emails**
```javascript
// Password Reset
const resetUrl = `${process.env.VITE_APP_URL}/reset-password?token=${token}`;

// Subscription Activated
const subscriptionUrl = `${process.env.VITE_APP_URL}/subscription`;

// Payment Verified
const dashboardUrl = `${process.env.VITE_APP_URL}/dashboard`;

// Payment Rejected
const resubmitUrl = `${process.env.VITE_APP_URL}/subscription?resubmit=true`;
```

---

## 🔍 SEO & Social Media URLs

### **Open Graph / Social Sharing**
```html
<!-- Landing Page -->
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="og:image" content="https://yourdomain.com/og-image.png" />

<!-- Subscription Page -->
<meta property="og:url" content="https://yourdomain.com/subscription" />
```

---

## 🛠️ Admin & Developer URLs

### **Supabase Dashboard**
```
https://supabase.com/dashboard/project/fdukxfwdlwskznyezgr
```

### **Vercel Dashboard**
```
https://vercel.com/your-team/your-project
```

### **GitHub Repository**
```
https://github.com/D4rkC0m3t/Multi-Tenency
```

---

## 📱 QR Code URLs

### **For Payment QR Codes**
```
# PhonePe Payment Link (if using UPI)
upi://pay?pa=yourupi@phonepe&pn=KrishiSethu&am=3999&cu=INR

# Website QR Code
https://yourdomain.com

# Subscription Direct Link
https://yourdomain.com/subscription
```

---

## 🔐 Security URLs

### **CORS Allowed Origins**
```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:5173',
  'https://*.vercel.app'
];
```

### **Redirect URIs (Supabase Auth)**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/reset-password
http://localhost:5173/auth/callback (development)
```

---

## 📊 Analytics & Tracking URLs

### **Google Analytics**
```javascript
// Track page views
gtag('config', 'GA_MEASUREMENT_ID', {
  page_path: window.location.pathname
});

// Track subscription events
gtag('event', 'subscription_started', {
  plan_type: 'monthly',
  value: 3999
});
```

---

## 🚀 Deployment URLs

### **Vercel Deployment**
```bash
# Production
https://yourdomain.com

# Preview (per branch)
https://your-project-git-feature-branch.vercel.app

# Latest deployment
https://your-project.vercel.app
```

---

## 📋 Quick Reference Table

| Purpose | URL | Access Level |
|---------|-----|--------------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Dashboard | `/dashboard` | Authenticated |
| POS | `/pos` | Authenticated |
| Subscription | `/subscription` | Authenticated |
| Admin Payments | `/admin/payments` | Admin Only |
| Terms | `/terms` | Public |
| Privacy | `/privacy` | Public |
| Refund | `/refund` | Public |

---

## 🔄 URL Redirects

### **Implemented Redirects**
```javascript
// Unauthenticated users → Landing page
* → /

// Authenticated users → Dashboard
/ → /dashboard

// Invalid routes → Home
* → / (fallback)
```

---

## 📝 URL Naming Conventions

### **Best Practices Used**
- ✅ Lowercase URLs
- ✅ Hyphen-separated words
- ✅ RESTful structure
- ✅ Semantic naming
- ✅ Consistent patterns

### **Examples**
```
✅ /inventory/stock-take
✅ /purchases/orders
✅ /admin/payments
✅ /suppliers/payments

❌ /InventoryStockTake
❌ /purchases_orders
❌ /adminPayments
```

---

## 🔗 External Service URLs

### **PhonePe**
```
Production: https://api.phonepe.com/apis/hermes
Sandbox: https://api-preprod.phonepe.com/apis/pg-sandbox
```

### **Supabase**
```
Project: https://fdukxfwdlwskznyezgr.supabase.co
Dashboard: https://supabase.com/dashboard/project/fdukxfwdlwskznyezgr
```

### **Vercel**
```
Dashboard: https://vercel.com/dashboard
Deployments: https://vercel.com/your-team/your-project/deployments
```

---

## 📞 Support URLs

### **Contact & Help**
```
Support Email: support@krishisethu.in
Website: https://yourdomain.com
Documentation: https://yourdomain.com/docs (if created)
```

---

## ✅ URL Checklist for Launch

- [ ] Replace all `yourdomain.com` with actual domain
- [ ] Update PhonePe dashboard with legal page URLs
- [ ] Configure Supabase redirect URLs
- [ ] Set up Vercel custom domain
- [ ] Update environment variables with production URLs
- [ ] Test all public URLs
- [ ] Test all authenticated URLs
- [ ] Verify legal pages are accessible
- [ ] Check mobile responsiveness of all URLs
- [ ] Set up SSL certificates (auto via Vercel)
- [ ] Configure DNS records
- [ ] Test password reset flow
- [ ] Verify subscription page access
- [ ] Test admin payment page access

---

## 🎯 Priority URLs for PhonePe Activation

**MUST HAVE before PhonePe approval:**

1. ✅ `https://yourdomain.com/terms` - Terms & Conditions
2. ✅ `https://yourdomain.com/privacy` - Privacy Policy
3. ✅ `https://yourdomain.com/refund` - Refund Policy
4. ✅ `https://yourdomain.com/` - Working website
5. ✅ `https://yourdomain.com/subscription` - Subscription page

---

**Document Version:** 1.0  
**Last Updated:** October 22, 2025  
**Status:** Ready for Production

---

*Replace `yourdomain.com` with your actual domain before deployment*
