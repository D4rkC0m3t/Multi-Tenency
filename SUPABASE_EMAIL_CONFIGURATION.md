# Supabase Email Configuration for Password Reset

## 🔧 Issue: Password Reset Email Not Sending

The password reset functionality is properly coded, but the email might not be sending due to Supabase configuration.

## ✅ Current Implementation Status

### Code is Correct:
1. ✅ **AuthContext.tsx** - `resetPassword()` function implemented
2. ✅ **ForgotPasswordModal.tsx** - UI component working
3. ✅ **ResetPasswordPage.tsx** - Reset page created
4. ✅ **App.tsx** - Route `/reset-password` configured
5. ✅ **Toast notifications** - Success messages added

## 🔍 Root Cause

The issue is likely in **Supabase Dashboard Email Settings**:

### Common Problems:
1. **Email confirmation disabled** in Supabase Auth settings
2. **Custom SMTP not configured** (using default Supabase emails)
3. **Email template not customized** with correct redirect URL
4. **Site URL not configured** properly

---

## 🛠️ **SOLUTION: Configure Supabase Dashboard**

### Step 1: Enable Email Confirmation

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth**
4. Ensure **Enable email confirmations** is **ON**

### Step 2: Configure Site URL

1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

### Step 3: Configure Redirect URLs

1. In **Authentication** → **URL Configuration**
2. Add **Redirect URLs**:
   ```
   http://localhost:5173/reset-password
   https://yourdomain.com/reset-password
   ```

### Step 4: Customize Email Template

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Update the template with this content:

```html
<h2>Reset Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password for KrishiSethu.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 24 hours.</p>
<p>Thanks,<br>KrishiSethu Team</p>
```

### Step 5: Update Confirmation URL Template

Make sure the **Confirmation URL** in the template uses:
```
{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
```

Or use the default:
```
{{ .ConfirmationURL }}
```

---

## 🧪 **Testing the Fix**

### Test in Development:

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Go to login page** → Click "Forgot Password"

3. **Enter your email** → Click "Send Reset Link"

4. **Check your email inbox** (including spam folder)

5. **Click the reset link** in the email

6. **You should be redirected** to `/reset-password` page

7. **Enter new password** → Submit

8. **Success!** Password should be updated

---

## 🔐 **Alternative: Use Custom SMTP (Recommended for Production)**

### Why Custom SMTP?
- Better deliverability
- No rate limits
- Professional email address
- Better spam score

### Setup Custom SMTP:

1. Go to **Authentication** → **Settings** → **SMTP Settings**

2. Configure your SMTP provider (Gmail, SendGrid, AWS SES, etc.):
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-password
   Sender Email: noreply@krishisethu.in
   Sender Name: KrishiSethu
   ```

3. **For Gmail**:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the app password in SMTP settings

4. **For SendGrid** (Recommended):
   - Sign up at sendgrid.com
   - Create API key
   - Use SMTP credentials
   - Better deliverability

---

## 📧 **Email Template Best Practices**

### Subject Line:
```
Reset your KrishiSethu password
```

### Email Body Template:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background: #10B981; 
      color: white; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 20px 0;
    }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password</h2>
    <p>Hi there,</p>
    <p>We received a request to reset your password for your KrishiSethu account.</p>
    <p>Click the button below to reset your password:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #10B981;">{{ .ConfirmationURL }}</p>
    <p><strong>This link will expire in 24 hours.</strong></p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <div class="footer">
      <p>Thanks,<br>The KrishiSethu Team</p>
      <p>Contact: support@krishisethu.in | +91 9963600975</p>
      <p>www.krishisethu.in</p>
    </div>
  </div>
</body>
</html>
```

---

## 🐛 **Troubleshooting**

### Issue: Email not received

**Check:**
1. ✅ Spam/Junk folder
2. ✅ Email address is correct
3. ✅ Supabase email quota not exceeded
4. ✅ SMTP settings are correct
5. ✅ Site URL matches your app URL

### Issue: Invalid reset link

**Check:**
1. ✅ Redirect URL includes `/reset-password`
2. ✅ Token hasn't expired (24 hours)
3. ✅ Link hasn't been used already
4. ✅ URL parameters are intact

### Issue: Reset page not loading

**Check:**
1. ✅ Route is defined in App.tsx
2. ✅ ResetPasswordPage component is imported
3. ✅ URL matches exactly `/reset-password`

---

## 📝 **Quick Fix Checklist**

- [ ] Enable email confirmations in Supabase
- [ ] Set correct Site URL
- [ ] Add redirect URLs
- [ ] Customize email template
- [ ] Test with your email
- [ ] Check spam folder
- [ ] Verify link works
- [ ] Test password update
- [ ] Configure custom SMTP (optional)

---

## 🚀 **Production Deployment**

### Before Going Live:

1. **Update Site URL** to production domain
2. **Update Redirect URLs** to production URLs
3. **Configure Custom SMTP** for better deliverability
4. **Test thoroughly** with multiple email providers
5. **Monitor email delivery** rates
6. **Set up email logging** for debugging

---

## 💡 **Additional Improvements**

### Rate Limiting:
Add rate limiting to prevent abuse:
```typescript
// In AuthContext.tsx
const resetPassword = async (email: string) => {
  // Check if email was sent recently
  const lastSent = localStorage.getItem(`reset_${email}`);
  if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
    throw new Error('Please wait 1 minute before requesting another reset');
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  
  // Store timestamp
  localStorage.setItem(`reset_${email}`, Date.now().toString());
  
  toast.success('Password reset email sent! Check your inbox.');
};
```

### Email Verification:
Ensure email exists before sending:
```typescript
const resetPassword = async (email: string) => {
  // Check if user exists
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
    
  if (!data) {
    // Don't reveal if email exists for security
    toast.success('If this email exists, you will receive a reset link.');
    return;
  }
  
  // Send reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  
  toast.success('Password reset email sent! Check your inbox.');
};
```

---

## 📞 **Support**

If issues persist after following this guide:

1. Check Supabase Dashboard → Logs → Auth Logs
2. Check browser console for errors
3. Verify Supabase project is not paused
4. Contact Supabase support if needed

---

**Status**: ✅ Code Implementation Complete  
**Next Step**: Configure Supabase Dashboard Settings  
**Priority**: High - Required for password reset functionality  

---

*Follow the steps above to enable password reset emails in your KrishiSethu application.*
