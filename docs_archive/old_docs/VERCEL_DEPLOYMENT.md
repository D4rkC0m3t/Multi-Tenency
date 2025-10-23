# Vercel Deployment Guide for Fertilizer Inventory Management System

## Prerequisites
1. Supabase project with production database
2. Vercel account
3. GitHub repository (recommended for automatic deployments)

## Environment Variables Setup

### Required Environment Variables for Vercel:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Steps to Configure in Vercel:

1. **Login to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Login with your account

2. **Import/Create Project**
   - Click "New Project"
   - Import from GitHub repository or upload project files
   - Select the fertilizer inventory system project

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - Set these for all environments (Production, Preview, Development)

4. **Deployment Configuration**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Database Setup

### Apply Migrations to Production Database:
1. In your Supabase dashboard, go to SQL Editor
2. Run the migration files in order from `/supabase/migrations/`
3. Key migrations to ensure are applied:
   - Enhanced stock management schema
   - Stock functions and triggers
   - RLS policies
   - Admin user setup

### Important Database Configurations:
- Ensure RLS (Row Level Security) is enabled
- Verify all policies are correctly applied
- Test admin user creation and permissions
- Confirm storage policies for file uploads

## Security Checklist

- [ ] Environment variables are set in Vercel (not in code)
- [ ] RLS policies are enabled and tested
- [ ] Admin user is created with proper permissions
- [ ] Storage policies are configured
- [ ] CORS settings are configured in Supabase

## Post-Deployment Testing

1. **Authentication Flow**
   - Test user registration
   - Test user login
   - Test admin login
   - Verify role-based access

2. **Core Functionality**
   - Product management
   - Inventory operations
   - POS system
   - Purchase orders
   - Stock management

3. **Multi-tenant Features**
   - Merchant isolation
   - Data segregation
   - User permissions

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check TypeScript errors and dependencies
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify Supabase URL and keys
4. **CORS Issues**: Configure allowed origins in Supabase

### Performance Optimization:
- Enable Vercel Analytics
- Configure caching headers
- Optimize bundle size
- Use Vercel Edge Functions if needed

## Monitoring

- Set up Vercel Analytics
- Monitor Supabase usage and performance
- Configure error tracking (Sentry recommended)
- Set up uptime monitoring

## Backup Strategy

- Regular database backups via Supabase
- Code backups via Git
- Environment variables documentation
- Migration scripts backup
