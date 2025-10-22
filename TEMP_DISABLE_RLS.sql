-- =====================================================
-- TEMPORARY: Disable RLS for Testing
-- This will help identify if RLS is causing the 406 error
-- =====================================================

-- Temporarily disable RLS (FOR TESTING ONLY)
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log DISABLE ROW LEVEL SECURITY;

-- Grant broad permissions for testing
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON payment_submissions TO authenticated;
GRANT ALL ON payment_audit_log TO authenticated;

SELECT 'RLS temporarily disabled for testing. Re-enable after testing!' as warning;

-- =====================================================
-- TO RE-ENABLE RLS AFTER TESTING (RUN THIS AFTER):
-- =====================================================
-- ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;
