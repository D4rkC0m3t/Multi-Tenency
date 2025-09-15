# Deployment Checklist

## Pre-Deployment
- [ ] Code review completed and approved
- [ ] All tests passing in CI/CD pipeline
- [ ] Security scans completed with no critical issues
- [ ] Performance benchmarks within acceptable range
- [ ] Vercel preview deployment verified
- [ ] Database migrations tested (if any)

## Deployment
- [ ] Merge PR to `main` branch
- [ ] Verify Vercel production deployment starts automatically
- [ ] Monitor deployment logs for errors
- [ ] Verify build completes successfully

## Post-Deployment
- [ ] Smoke test production environment
- [ ] Verify error tracking is working (Sentry)
- [ ] Check application logs for any issues
- [ ] Monitor application performance
- [ ] Update deployment documentation if needed

## Rollback Plan
- [ ] Verify rollback procedure is documented in `ROLLBACK_PROCEDURE.md`
- [ ] Test rollback on staging if possible
- [ ] Ensure team knows how to initiate rollback if needed

## Communication
- [ ] Notify team of deployment
- [ ] Update changelog/release notes
- [ ] Inform stakeholders of successful deployment

## Monitoring
- [ ] Set up alerts for critical errors
- [ ] Monitor application metrics
- [ ] Schedule post-deployment review meeting if needed
