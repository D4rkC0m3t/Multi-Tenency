-- =====================================================
-- FIX 406 ERROR - Diagnostic and Fix
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check if tables exist
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename IN ('user_subscriptions', 'payment_submissions', 'payment_audit_log');

-- 2. Check RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_subscriptions', 'payment_submissions');

-- 3. Check existing policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_subscriptions', 'payment_submissions');

-- 4. Grant explicit permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON user_subscriptions TO authenticated;
GRANT SELECT ON payment_submissions TO authenticated;
GRANT INSERT ON payment_submissions TO authenticated;
GRANT SELECT ON payment_audit_log TO authenticated;

-- 5. Grant sequence permissions (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- 6. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Verify the table is accessible
SELECT COUNT(*) as table_exists FROM user_subscriptions;

SELECT 'Permissions granted and schema reloaded!' as status;
