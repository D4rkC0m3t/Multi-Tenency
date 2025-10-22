# 🌐 Admin Portal - Production URLs

**Domain:** www.krishisethu.in  
**Status:** Production Ready

---

## 🔗 Production URLs

### **Admin Portal URLs:**

```
Admin Login:     https://www.krishisethu.in/admin/login
Admin Dashboard: https://www.krishisethu.in/admin/dashboard
Payment Mgmt:    https://www.krishisethu.in/admin/payments
```

### **Regular User URLs:**

```
Landing Page:    https://www.krishisethu.in/
User Login:      https://www.krishisethu.in/auth
User Dashboard:  https://www.krishisethu.in/dashboard
```

---

## 🚀 Access Admin Portal

### **Step 1: Create Admin Account**

Run in Supabase SQL Editor:
```sql
UPDATE profiles 
SET 
  role = 'super_admin',
  is_platform_admin = true,
  admin_permissions = ARRAY['manage_payments', 'manage_merchants', 'view_all_data']
WHERE email = 'your-admin-email@example.com';
```

### **Step 2: Access Admin Login**

**Production URL:**
```
https://www.krishisethu.in/admin/login
```

**Development URL:**
```
http://localhost:5173/admin/login
```

### **Step 3: Login & Manage**

1. Enter admin credentials
2. System verifies admin privileges
3. Auto-redirects to dashboard
4. Manage platform from dashboard

---

## 📊 Admin Portal Structure

```
www.krishisethu.in/
├── admin/
│   ├── login          → Admin login page
│   ├── dashboard      → Admin dashboard
│   ├── payments       → Payment management
│   ├── merchants      → Merchant management (future)
│   └── reports        → Admin reports (future)
│
├── auth               → Regular user login
├── dashboard          → User dashboard
└── ...                → Other user routes
```

---

## 🔐 Security Configuration

### **Domain Setup:**
- ✅ HTTPS enforced (Strict-Transport-Security)
- ✅ Security headers configured
- ✅ Clean URLs enabled
- ✅ Trailing slash handling

### **Access Control:**
```typescript
// Admin routes protected by:
1. Authentication check
2. is_platform_admin = true
3. role = 'super_admin'
4. is_active = true
```

---

## 🎯 Route Configuration

### **Vercel Configuration (vercel.json):**
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**This means:**
- ✅ `/admin/login` works
- ✅ `/admin/dashboard` works
- ✅ `/admin/payments` works
- ✅ All admin routes accessible

---

## 📝 Environment Variables

### **Production (.env.production):**
```env
VITE_SUPABASE_URL=https://fdukxfwdlwskznyiezgr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_URL=https://www.krishisethu.in
```

### **Development (.env.local):**
```env
VITE_SUPABASE_URL=https://fdukxfwdlwskznyiezgr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_URL=http://localhost:5173
```

---

## 🧪 Testing Production URLs

### **Test 1: Admin Login**
```bash
# Open in browser:
https://www.krishisethu.in/admin/login

# Should show:
- Admin login page
- Dark theme
- Security warning
```

### **Test 2: Admin Dashboard**
```bash
# After login, should redirect to:
https://www.krishisethu.in/admin/dashboard

# Should show:
- Statistics
- Quick actions
- Recent activity
```

### **Test 3: Access Control**
```bash
# Try accessing as non-admin:
https://www.krishisethu.in/admin/dashboard

# Should:
- Show "Access denied"
- Redirect to /admin/login
```

---

## 🔧 DNS & Domain Setup

### **Vercel Domain Configuration:**

1. **Add Domain in Vercel:**
   - Go to Vercel Dashboard
   - Project Settings → Domains
   - Add: `www.krishisethu.in`

2. **DNS Records (at domain registrar):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate:**
   - ✅ Automatic via Vercel
   - ✅ HTTPS enforced
   - ✅ HTTP → HTTPS redirect

---

## 📊 URL Mapping

| Route | Development | Production |
|-------|------------|------------|
| Admin Login | `localhost:5173/admin/login` | `www.krishisethu.in/admin/login` |
| Admin Dashboard | `localhost:5173/admin/dashboard` | `www.krishisethu.in/admin/dashboard` |
| Payment Mgmt | `localhost:5173/admin/payments` | `www.krishisethu.in/admin/payments` |
| User Login | `localhost:5173/auth` | `www.krishisethu.in/auth` |
| User Dashboard | `localhost:5173/dashboard` | `www.krishisethu.in/dashboard` |

---

## 🚨 Important Notes

### **1. Admin Access:**
```
Only users with:
- is_platform_admin = true
- role = 'super_admin'
Can access: www.krishisethu.in/admin/*
```

### **2. Security:**
```
All admin routes:
- ✅ HTTPS only
- ✅ Security headers
- ✅ Activity logging
- ✅ Session management
```

### **3. Separation:**
```
Admin Portal:  www.krishisethu.in/admin/*
User Portal:   www.krishisethu.in/*
```

---

## 📞 Quick Reference

### **Admin Portal Access:**
```
URL:   https://www.krishisethu.in/admin/login
Email: your-admin-email@example.com
Pass:  your-secure-password
```

### **Create Admin:**
```sql
UPDATE profiles 
SET role = 'super_admin', is_platform_admin = true
WHERE email = 'admin@krishisethu.in';
```

### **Check Admin Status:**
```sql
SELECT email, role, is_platform_admin 
FROM profiles 
WHERE is_platform_admin = true;
```

---

## 🎯 Deployment Checklist

- [ ] Domain configured in Vercel
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] Admin account created
- [ ] Test admin login at production URL
- [ ] Verify dashboard loads
- [ ] Test payment management
- [ ] Check security headers

---

## 🔗 Links

**Production:**
- Admin Portal: https://www.krishisethu.in/admin/login
- User Portal: https://www.krishisethu.in/
- API: https://fdukxfwdlwskznyiezgr.supabase.co

**Documentation:**
- Setup Guide: `ADMIN_PORTAL_SETUP.md`
- Security: `SECURITY_IMPLEMENTATION_COMPLETE.md`
- Access Guide: `ADMIN_ACCESS_GUIDE.md`

---

## ✅ Summary

**Your admin portal is accessible at:**
```
https://www.krishisethu.in/admin/login
```

**After login, dashboard at:**
```
https://www.krishisethu.in/admin/dashboard
```

**All routes work with:**
- ✅ Clean URLs
- ✅ HTTPS enforced
- ✅ Security headers
- ✅ Admin access control

**Ready for production! 🚀**
