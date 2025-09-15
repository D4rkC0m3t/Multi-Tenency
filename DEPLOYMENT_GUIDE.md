# Deployment Guide

## Prerequisites
- Vercel account (vercel.com)
- GitHub/GitLab repository
- Supabase project

## Setup Instructions

### 1. Vercel Setup
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Set up environment variables:
   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add NEXT_PUBLIC_ENHANCED_CUSTOMER_SEARCH preview
   ```

### 2. Development Workflow

#### Feature Development
1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally

3. Deploy a preview:
   ```bash
   vercel --prod
   ```

4. Push changes:
   ```bash
   git push -u origin feature/your-feature-name
   ```

#### Production Deployment
1. Create a PR to `main` branch
2. After approval, merge to `main`
3. Vercel will automatically deploy to production

### 3. Feature Flags

#### Adding a New Feature Flag
1. Add to `.env.example`:
   ```
   NEXT_PUBLIC_FEATURE_NAME=false
   ```

2. Use in code:
   ```typescript
   const isFeatureEnabled = import.meta.env.VITE_FEATURE_NAME === 'true';
   ```

#### Managing Feature Flags
- Enable/disable via Vercel dashboard:
  1. Go to your project
  2. Navigate to Settings > Environment Variables
  3. Update the value and redeploy

## Best Practices
- Always test in preview before production
- Use feature flags for gradual rollouts
- Monitor after deployment
- Set up error tracking

## Rollback
To rollback to a previous version:
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Find the version you want to restore
5. Click "..." > "Redeploy"

## Support
For issues, contact your development team or refer to:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
