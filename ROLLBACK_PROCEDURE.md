# Rollback Procedure

This document outlines the steps to rollback to a previous version of the application in case of critical issues in production.

## Automated Rollback (Recommended)

### For Vercel Deployments

1. **Access Vercel Dashboard**
   - Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to the "Deployments" tab

2. **Locate the Previous Deployment**
   - Find the deployment you want to roll back to (marked as "Production")
   - Click on the three dots (`...`) next to the deployment
   - Select "Redeploy"

3. **Confirm Rollback**
   - Vercel will ask for confirmation
   - The rollback typically completes within seconds

## Manual Rollback

### Using Git

1. **Revert to Previous Commit**
   ```bash
   # Find the commit hash you want to rollback to
   git log --oneline -n 5
   
   # Create a new branch from the previous commit
   git checkout -b rollback-<date> <commit-hash>
   
   # Force push to main (requires force push permissions)
   git push -f origin rollback-<date>:main
   ```

### Database Rollback

If database changes were made that need to be reverted:

1. **For Supabase Migrations**
   ```sql
   -- Find the migration to rollback to
   SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;
   
   -- Rollback to a specific migration
   npx supabase migration down --db-url postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
   ```

## Post-Rollback Verification

1. **Verify Application**
   - Check the main application URL
   - Test critical user flows
   - Verify all services are running

2. **Monitor Logs**
   - Check Vercel logs for errors
   - Monitor Supabase logs for database issues
   - Set up alerts for any new errors

## Rollback Best Practices

1. **Before Rolling Back**
   - Document the current state
   - Take database backups if needed
   - Notify your team

2. **After Rolling Back**
   - Document the reason for rollback
   - Create a post-mortem if needed
   - Update your deployment process to prevent similar issues

## Emergency Contacts

- **Vercel Support**: [Vercel Support](https://vercel.com/support)
- **Supabase Support**: [Supabase Support](https://supabase.com/support)
- **Team Lead**: [Your Contact Information]
