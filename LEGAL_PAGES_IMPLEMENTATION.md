# Legal Pages Implementation Guide

**Created:** October 22, 2025  
**Purpose:** Terms & Conditions, Privacy Policy, and Refund Policy for PhonePe Payment Gateway Integration

---

## 📄 Files Created

### 1. Terms and Conditions
**File:** `src/components/legal/TermsAndConditions.tsx`  
**Route:** `/terms`

**Sections Covered:**
- Introduction & Definitions
- Account Registration & Security
- Subscription Plans & Payments (PhonePe Integration)
- Use of Service & Prohibited Activities
- Data Ownership & Privacy
- Intellectual Property Rights
- Service Availability & Maintenance
- Cancellation & Termination
- Limitation of Liability & Indemnification
- GST & Fertilizer Compliance Requirements
- Dispute Resolution & Governing Law
- Contact Information

### 2. Privacy Policy
**File:** `src/components/legal/PrivacyPolicy.tsx`  
**Route:** `/privacy`

**Sections Covered:**
- Information Collection (User-provided, Automatic, Third-party)
- How We Use Your Information
- Data Storage & Security Measures
- Multi-Tenant Data Isolation
- Data Sharing & Disclosure
- User Data Rights (Access, Correction, Deletion, Export)
- Cookies & Tracking Technologies
- Third-Party Services (PhonePe, Supabase)
- Data Retention Policies
- Compliance with Indian IT Laws

### 3. Refund Policy
**File:** `src/components/legal/RefundPolicy.tsx`  
**Route:** `/refund`

**Sections Covered:**
- Subscription Cancellation Process
- 7-Day Money-Back Guarantee
- Refund Eligibility & Non-Refundable Situations
- Refund Process & Timeline
- Payment Failures & Duplicate Charges
- Chargebacks & Disputes
- Downgrade & Upgrade Policies
- Data Retention After Cancellation
- Contact Information for Refund Requests

---

## 🔗 URL Structure

### Public Access (No Authentication Required)
```
https://yourdomain.com/terms
https://yourdomain.com/privacy
https://yourdomain.com/refund
```

### Authenticated Access (Within App)
```
https://yourdomain.com/terms
https://yourdomain.com/privacy
https://yourdomain.com/refund
```

---

## 🎨 Design Features

All legal pages include:
- **Material-UI Components** - Professional, consistent styling
- **Responsive Design** - Mobile-friendly layout
- **Back Navigation** - Arrow icon to return to previous page
- **Last Updated Date** - Transparency on policy changes
- **Structured Content** - Clear headings, bullet points, numbered sections
- **Dividers** - Visual separation of sections
- **Glassmorphism** - Consistent with app design

---

## 🔧 Integration Steps Completed

### 1. Component Creation ✅
- Created `TermsAndConditions.tsx`
- Created `PrivacyPolicy.tsx`
- Created `RefundPolicy.tsx`

### 2. Routing Configuration ✅
Updated `src/App.tsx`:
- Added imports for all three legal components
- Added routes for unauthenticated users (public access)
- Added routes for authenticated users (in-app access)

### 3. Routes Added
```typescript
// For non-authenticated users
<Route path="/terms" element={<TermsAndConditions />} />
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/refund" element={<RefundPolicy />} />

// For authenticated users (within Layout)
<Route path="terms" element={<TermsAndConditions />} />
<Route path="privacy" element={<PrivacyPolicy />} />
<Route path="refund" element={<RefundPolicy />} />
```

---

## 📋 PhonePe Payment Gateway Requirements

### Required Policy URLs for PhonePe Activation

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

### Compliance Checklist ✅
- [x] Terms & Conditions page created
- [x] Privacy Policy page created
- [x] Refund Policy page created
- [x] All pages publicly accessible
- [x] Last updated dates included
- [x] Contact information provided
- [x] PhonePe integration mentioned
- [x] Indian compliance (IT Act, GST) covered
- [x] Data protection measures documented
- [x] Refund timelines specified

---

## 🔄 Customization Required

Before deploying, update the following placeholders:

### Contact Information
Replace in all three files:
- `support@krishisethu.com` → Your actual support email
- `privacy@krishisethu.com` → Your actual privacy email
- `+91 [Your Phone Number]` → Your actual phone number
- `[Your Business Address]` → Your actual business address
- `[Your City]` → Your city for jurisdiction

### Business Details
- Company name (currently "KrishiSethu")
- Domain name (currently "yourdomain.com")
- Supabase data center location
- Specific GST compliance details

### Policy Specifics
- Subscription pricing tiers
- Exact refund timelines (if different)
- Data retention periods (if different)
- Service uptime guarantees

---

## 🚀 Deployment Steps

### 1. Update Placeholders
```bash
# Search for placeholders in legal files
grep -r "\[Your" src/components/legal/
grep -r "krishisethu.com" src/components/legal/
```

### 2. Test Routes Locally
```bash
npm run dev

# Visit these URLs:
http://localhost:5173/terms
http://localhost:5173/privacy
http://localhost:5173/refund
```

### 3. Deploy to Production
```bash
git add src/components/legal/
git add src/App.tsx
git commit -m "feat: add legal pages for PhonePe integration"
git push origin main
```

### 4. Verify Production URLs
After deployment, verify:
- https://yourdomain.com/terms
- https://yourdomain.com/privacy
- https://yourdomain.com/refund

### 5. Update PhonePe Dashboard
1. Log in to PhonePe Business Dashboard
2. Navigate to "Activate Payment Gateway"
3. Under "Policies" section, enter:
   - Terms and Conditions URL
   - Privacy Policy URL
   - Refund Policy URL
4. Save and submit for approval

---

## 📱 Mobile Responsiveness

All pages are fully responsive:
- **Desktop:** Full-width container with proper spacing
- **Tablet:** Adjusted padding and font sizes
- **Mobile:** Single-column layout, touch-friendly navigation

---

## ♿ Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Readable font sizes
- Sufficient color contrast
- Keyboard navigation support
- Screen reader friendly

---

## 🔒 Security & Privacy

### Data Protection Measures Documented
- Row-Level Security (RLS)
- SSL/TLS encryption
- JWT authentication
- Multi-tenant isolation
- Secure password hashing
- Regular security audits

### User Rights Documented
- Right to access data
- Right to correction
- Right to deletion
- Right to data export
- Right to restrict processing
- Right to withdraw consent

---

## 📊 Analytics & Tracking

Consider adding analytics to track:
- Page views on legal pages
- Time spent reading policies
- Bounce rates
- User journey from legal pages

---

## 🔄 Maintenance

### Regular Updates Required
- Review policies quarterly
- Update "Last Updated" dates when changed
- Notify users of significant changes via email
- Keep compliance with changing regulations

### Version Control
- Maintain policy version history
- Document major changes in CHANGELOG.md
- Archive old versions for legal compliance

---

## 📞 Support

For questions about legal pages:
- **Email:** support@krishisethu.com
- **Documentation:** This file
- **Legal Review:** Consult with legal counsel before finalizing

---

## ✅ Implementation Complete

All legal pages are now:
- ✅ Created with comprehensive content
- ✅ Integrated into routing system
- ✅ Accessible to all users (authenticated & public)
- ✅ Mobile responsive
- ✅ Compliant with PhonePe requirements
- ✅ Ready for customization and deployment

**Next Steps:**
1. Customize contact information and business details
2. Review with legal counsel
3. Test all routes locally
4. Deploy to production
5. Update PhonePe dashboard with URLs
6. Monitor for any issues

---

**Document Version:** 1.0  
**Last Updated:** October 22, 2025
