# 🔑 How to Get PhonePe API Credentials

**Status:** ✅ Registered & KYC Complete  
**Next Step:** Get API Credentials

---

## 📋 Step-by-Step Guide

### **Step 1: Login to PhonePe Business Dashboard**

1. Go to: https://business.phonepe.com
2. Login with your credentials
3. You should see your business dashboard

---

### **Step 2: Navigate to Developer Section**

**Option A: Look for "Developers" or "API" Menu**
- Check top navigation menu
- Look for "Developers" or "API Keys" or "Integration"
- Click on it

**Option B: Look for "Payment Gateway" Section**
- Go to "Payment Gateway" menu
- Look for "API Credentials" or "Integration"
- Click on it

**Option C: Settings Menu**
- Go to "Settings" (usually gear icon)
- Look for "API Keys" or "Developer Settings"
- Click on it

---

### **Step 3: Find API Credentials Section**

You should see a section with:
- **Merchant ID** (Also called: Merchant Key, Business ID)
- **Salt Key** (Also called: Secret Key, API Secret)
- **Salt Index** (Usually a number like 1 or 2)

---

### **Step 4: Generate/View Credentials**

#### **If Credentials Already Exist:**
- Click "View" or "Show" button
- Copy the credentials
- Save them securely

#### **If No Credentials Exist:**
- Look for "Generate API Keys" button
- Click it
- Select environment:
  - **UAT/Sandbox** - For testing
  - **Production** - For live payments
- Click "Generate"
- Copy and save credentials immediately
- **Important:** Salt Key is shown only once!

---

## 🎯 What You Need to Copy

### **1. Merchant ID**
```
Example: M12345678901234
Format: Usually starts with 'M' followed by numbers
```

### **2. Salt Key**
```
Example: 099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
Format: UUID or long alphanumeric string
```

### **3. Salt Index**
```
Example: 1
Format: Usually 1 or 2
```

### **4. API Endpoint**
```
UAT: https://api-preprod.phonepe.com/apis/pg-sandbox
Production: https://api.phonepe.com/apis/hermes
```

---

## 📝 Common Menu Locations

### **Dashboard Layout 1:**
```
Dashboard
├── Home
├── Transactions
├── Payment Gateway
│   ├── Overview
│   ├── API Credentials ← HERE
│   └── Webhooks
├── Reports
└── Settings
```

### **Dashboard Layout 2:**
```
Dashboard
├── Home
├── Developers ← HERE
│   ├── API Keys
│   ├── Webhooks
│   └── Documentation
├── Transactions
└── Settings
```

### **Dashboard Layout 3:**
```
Dashboard
├── Home
├── Settings
│   ├── Business Details
│   ├── API & Integration ← HERE
│   └── Security
└── Transactions
```

---

## 🔍 If You Can't Find It

### **Try These Steps:**

#### **1. Search Function**
- Look for search icon (🔍) in dashboard
- Search for: "API", "Credentials", "Integration", "Developer"

#### **2. Help/Support**
- Look for "Help" or "?" icon
- Search for "API credentials"
- Follow the guide

#### **3. Profile/Account Menu**
- Click your profile icon (usually top-right)
- Look for "Developer Settings" or "API Keys"

#### **4. Contact PhonePe Support**
- Email: merchantsupport@phonepe.com
- Phone: Check dashboard for support number
- Ask: "How do I get my Payment Gateway API credentials?"

---

## 📸 What to Look For

### **API Credentials Page Usually Shows:**

```
┌─────────────────────────────────────────┐
│  Payment Gateway API Credentials        │
├─────────────────────────────────────────┤
│                                         │
│  Environment: [Production ▼]           │
│                                         │
│  Merchant ID:                           │
│  M12345678901234                        │
│  [Copy]                                 │
│                                         │
│  Salt Key:                              │
│  ••••••••••••••••••••                  │
│  [Show] [Copy]                          │
│                                         │
│  Salt Index: 1                          │
│                                         │
│  API Endpoint:                          │
│  https://api.phonepe.com/apis/hermes   │
│  [Copy]                                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚠️ Important Security Notes

### **1. Keep Salt Key Secret**
- ❌ Never share in emails
- ❌ Never commit to Git
- ❌ Never expose in frontend code
- ✅ Store in environment variables only

### **2. Save Credentials Immediately**
- Salt Key is shown only once
- If you lose it, you'll need to regenerate
- Save in password manager or secure location

### **3. Use UAT First**
- Test with UAT/Sandbox credentials first
- Switch to Production only when ready

---

## 🧪 Testing Your Credentials

### **Once You Have Credentials:**

1. **Add to .env file:**
```env
VITE_PHONEPE_MERCHANT_ID=M12345678901234
VITE_PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
VITE_PHONEPE_SALT_INDEX=1
VITE_PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

2. **Test API Connection:**
```bash
# We'll create a test script to verify credentials work
```

---

## 📞 PhonePe Support Contacts

### **Merchant Support:**
- **Email:** merchantsupport@phonepe.com
- **Phone:** 080-68727374 (Check dashboard for updated number)
- **Hours:** Monday to Friday, 10 AM to 6 PM IST

### **Technical Support:**
- **Email:** developers@phonepe.com
- **Documentation:** https://developer.phonepe.com

### **What to Say:**
```
"Hi, I have completed KYC for my PhonePe Business account.
I need to integrate Payment Gateway API for my website.
Can you guide me on how to access my API credentials
(Merchant ID, Salt Key, Salt Index)?

My registered business: [Your Business Name]
My registered email: [Your Email]
My registered phone: [Your Phone]"
```

---

## 🎯 Quick Checklist

After getting credentials, verify you have:

- [ ] Merchant ID (starts with M)
- [ ] Salt Key (long alphanumeric string)
- [ ] Salt Index (usually 1)
- [ ] API Endpoint URL
- [ ] Saved credentials securely
- [ ] Added to .env file
- [ ] NOT committed to Git

---

## 🔄 Alternative: Check Email

### **PhonePe Usually Sends:**
- Welcome email with credentials
- API activation email
- Check your registered email inbox
- Search for: "PhonePe API", "Credentials", "Merchant ID"

---

## 📱 Mobile App

### **If Using PhonePe Business App:**
1. Open PhonePe Business app
2. Go to "More" or "Menu"
3. Look for "Developer" or "API"
4. View credentials

---

## 🎓 Common Issues

### **Issue 1: "API Section Not Visible"**
**Solution:**
- Payment Gateway might not be activated yet
- Contact support to activate Payment Gateway
- May take 24-48 hours after KYC

### **Issue 2: "Generate Button Disabled"**
**Solution:**
- Business verification might be pending
- Check verification status in dashboard
- Contact support if stuck

### **Issue 3: "Lost Salt Key"**
**Solution:**
- You'll need to regenerate
- Old key will be invalidated
- Update your application with new key

---

## 📊 Typical Timeline

```
Day 1: Register → Complete KYC
Day 2-3: KYC Verification
Day 3-4: Payment Gateway Activation
Day 4: API Credentials Available ← You are here
Day 5: Integration & Testing
Day 6: Go Live
```

---

## 🚀 Next Steps After Getting Credentials

1. **Save credentials securely**
2. **Add to .env file**
3. **Test with UAT environment**
4. **Implement integration** (use PHONEPE_INTEGRATION_GUIDE.md)
5. **Test thoroughly**
6. **Switch to Production**
7. **Go Live!**

---

## 💡 Pro Tips

### **Tip 1: Use UAT First**
Always test with UAT/Sandbox credentials before using Production

### **Tip 2: Keep Backup**
Save credentials in multiple secure locations

### **Tip 3: Document**
Note down when credentials were generated and for which environment

### **Tip 4: Monitor**
Check dashboard regularly for any security alerts

---

## 📞 Still Can't Find?

### **Send This to PhonePe Support:**

```
Subject: Need Help Accessing Payment Gateway API Credentials

Hi PhonePe Team,

I have successfully registered and completed KYC for my PhonePe 
Business account. I need to integrate the Payment Gateway API 
for my website (www.krishisethu.in).

I cannot find where to access my API credentials (Merchant ID, 
Salt Key, Salt Index) in the dashboard.

Can you please guide me on:
1. Where to find API credentials in the dashboard
2. If Payment Gateway is activated for my account
3. Steps to generate credentials if not available

My Details:
- Business Name: [Your Business Name]
- Registered Email: [Your Email]
- Registered Phone: [Your Phone]
- Website: www.krishisethu.in

Thank you!
```

---

## ✅ Summary

**You Need:**
1. Merchant ID
2. Salt Key
3. Salt Index
4. API Endpoint URL

**Where to Find:**
- Dashboard → Developers/API section
- Dashboard → Payment Gateway → API Credentials
- Dashboard → Settings → API & Integration

**If Not Found:**
- Contact: merchantsupport@phonepe.com
- Phone: 080-68727374

---

**Once you get the credentials, we'll proceed with the integration!** 🚀

**Let me know when you have them, and I'll help you set them up!**
