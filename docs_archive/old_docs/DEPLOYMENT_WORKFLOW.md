# Safe Production Deployment Workflow

This guide sets up a zero-downtime deployment workflow using Git branches and Vercel preview deployments.

## 🚀 Quick Setup

### 1. Vercel Configuration
Your project is already connected to Vercel. Ensure these settings:

**In Vercel Dashboard:**
- ✅ Auto-deploy from `main` branch (Production)
- ✅ Auto-deploy from all branches (Preview)
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

### 2. Environment Variables Setup
Create environment-specific configs:

**Production (.env.production):**
```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_ENABLE_ENHANCED_CUSTOMER_SEARCH=true
VITE_ENABLE_BATCH_TRACKING=true
```

**Preview (.env.preview):**
```bash
VITE_SUPABASE_URL=your_staging_supabase_url
VITE_SUPABASE_ANON_KEY=your_staging_key
VITE_ENABLE_ENHANCED_CUSTOMER_SEARCH=true
VITE_ENABLE_BATCH_TRACKING=true
```

## 📋 Step-by-Step Workflow

### For Bug Fixes (like POS customer search, invoice logo)

```bash
# 1. Create feature branch
git checkout -b fix/pos-customer-search

# 2. Make your changes
# Edit files, test locally

# 3. Commit changes
git add .
git commit -m "fix: customer search dropdown in POS system"

# 4. Push to create preview deployment
git push origin fix/pos-customer-search
```

**Result:** Vercel automatically creates preview at `https://fix-pos-customer-search-yourproject.vercel.app`

### For New Features

```bash
# 1. Create feature branch
git checkout -b feature/enhanced-reporting

# 2. Develop feature with feature flag
# Add feature flag check in code

# 3. Test and commit
git add .
git commit -m "feat: add enhanced reporting with feature flag"

# 4. Push for preview
git push origin feature/enhanced-reporting
```

### Production Release

```bash
# 1. Test preview thoroughly
# Visit preview URL, test all functionality

# 2. Merge to main (triggers production deploy)
git checkout main
git merge fix/pos-customer-search

# 3. Push to production
git push origin main

# 4. Clean up
git branch -d fix/pos-customer-search
git push origin --delete fix/pos-customer-search
```

## 🎛️ Feature Flags Implementation

### 1. Environment Variables
Add to your `.env` files:
```bash
VITE_ENABLE_ENHANCED_CUSTOMER_SEARCH=true
VITE_ENABLE_BATCH_TRACKING=true
VITE_ENABLE_ADVANCED_REPORTING=false
```

### 2. Feature Flag Hook
Create `src/hooks/useFeatureFlags.ts`:
```typescript
export const useFeatureFlags = () => {
  return {
    enhancedCustomerSearch: import.meta.env.VITE_ENABLE_ENHANCED_CUSTOMER_SEARCH === 'true',
    batchTracking: import.meta.env.VITE_ENABLE_BATCH_TRACKING === 'true',
    advancedReporting: import.meta.env.VITE_ENABLE_ADVANCED_REPORTING === 'true',
  };
};
```

### 3. Usage in Components
```typescript
import { useFeatureFlags } from '../hooks/useFeatureFlags';

const POSPage = () => {
  const { enhancedCustomerSearch } = useFeatureFlags();
  
  return (
    <div>
      {enhancedCustomerSearch && (
        <EnhancedCustomerSearch />
      )}
      {/* Fallback to basic search */}
      {!enhancedCustomerSearch && (
        <BasicCustomerSearch />
      )}
    </div>
  );
};
```

## 🔄 Automated Workflow

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🛡️ Safety Checklist

### Before Merging to Main:
- [ ] Preview deployment works correctly
- [ ] All critical features tested
- [ ] Database migrations (if any) are backward compatible
- [ ] Environment variables updated in Vercel
- [ ] No console errors in browser
- [ ] Mobile responsiveness checked

### Emergency Rollback:
```bash
# Quick rollback to previous commit
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main
```

## 📊 Monitoring

### Vercel Analytics
- Monitor deployment success/failure
- Track performance metrics
- Set up alerts for errors

### Database Monitoring
- Monitor Supabase for query performance
- Check for migration issues
- Verify RLS policies work correctly

## 🎯 Best Practices

1. **Branch Naming:**
   - `fix/` - Bug fixes
   - `feature/` - New features  
   - `hotfix/` - Critical production fixes
   - `chore/` - Maintenance tasks

2. **Commit Messages:**
   - `fix:` - Bug fixes
   - `feat:` - New features
   - `chore:` - Maintenance
   - `docs:` - Documentation
   - `refactor:` - Code refactoring

3. **Testing Strategy:**
   - Test locally first
   - Use preview deployments for stakeholder review
   - Test with real data in staging environment
   - Gradual rollout with feature flags

## 🚨 Emergency Procedures

### Critical Bug in Production:
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-pos-fix

# 2. Fix the issue
# Make minimal changes

# 3. Test in preview
git push origin hotfix/critical-pos-fix

# 4. Fast-track to production
git checkout main
git merge hotfix/critical-pos-fix
git push origin main
```

### Database Issues:
1. Check Supabase dashboard for errors
2. Verify RLS policies
3. Check migration logs
4. Rollback database if needed

This workflow ensures your production system stays stable while allowing rapid development and testing of new features.
