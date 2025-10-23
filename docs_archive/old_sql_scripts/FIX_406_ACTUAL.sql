-- =====================================================
-- ACTUAL FIX FOR 406 ERROR
-- The 406 error means the table exists but API can't serve it
-- This is usually due to missing GRANT permissions
-- =====================================================

-- 1. Grant explicit table-level permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on subscription tables
GRANT SELECT ON public.user_subscriptions TO anon, authenticated;
GRANT SELECT ON public.payment_submissions TO authenticated;
GRANT SELECT ON public.payment_audit_log TO authenticated;

-- Grant INSERT on payment submissions (for users to submit payments)
GRANT INSERT ON public.payment_submissions TO authenticated;

-- Grant ALL to service_role
GRANT ALL ON public.user_subscriptions TO service_role;
GRANT ALL ON public.payment_submissions TO service_role;
GRANT ALL ON public.payment_audit_log TO service_role;

-- 2. Ensure RLS is enabled (it should be from migration)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- 3. Recreate policies with proper permissions
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own payment submissions" ON payment_submissions;
DROP POLICY IF EXISTS "Users can create payment submissions" ON payment_submissions;
DROP POLICY IF EXISTS "Service role can manage all payment submissions" ON payment_submissions;

-- Recreate with explicit role grants
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role full access subscriptions"
  ON user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own payments"
  ON payment_submissions
  FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can submit payments"
  ON payment_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role full access payments"
  ON payment_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- 5. Verify setup
SELECT 
  'Table: ' || tablename as info,
  'RLS: ' || CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE tablename IN ('user_subscriptions', 'payment_submissions')
AND schemaname = 'public';

SELECT 'Fix applied! Wait 30 seconds then refresh your browser.' as status;
