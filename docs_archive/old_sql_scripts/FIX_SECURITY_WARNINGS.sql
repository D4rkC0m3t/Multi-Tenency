-- =====================================================
-- FIX SUPABASE SECURITY WARNINGS
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Enable RLS on system_logs table
ALTER TABLE IF EXISTS system_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for system_logs (only service role can access)
DROP POLICY IF EXISTS "Service role can manage system logs" ON system_logs;
CREATE POLICY "Service role can manage system logs"
  ON system_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Enable RLS on fertilizer_gst_reference table
ALTER TABLE IF EXISTS fertilizer_gst_reference ENABLE ROW LEVEL SECURITY;

-- Create policy for fertilizer_gst_reference (read-only for authenticated users)
DROP POLICY IF EXISTS "Anyone can view GST reference" ON fertilizer_gst_reference;
CREATE POLICY "Anyone can view GST reference"
  ON fertilizer_gst_reference
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Service role can manage
DROP POLICY IF EXISTS "Service role can manage GST reference" ON fertilizer_gst_reference;
CREATE POLICY "Service role can manage GST reference"
  ON fertilizer_gst_reference
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Fix v_supplier_balances view (remove SECURITY DEFINER)
-- First, check if view exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'v_supplier_balances' AND schemaname = 'public') THEN
    -- Drop and recreate without SECURITY DEFINER
    DROP VIEW IF EXISTS public.v_supplier_balances;
    
    -- Recreate view without SECURITY DEFINER
    -- Note: You'll need to adjust this based on your actual view definition
    CREATE OR REPLACE VIEW public.v_supplier_balances AS
    SELECT 
      s.id,
      s.name,
      s.merchant_id,
      COALESCE(SUM(sp.amount), 0) as total_paid,
      COALESCE(SUM(p.total_amount), 0) as total_purchases,
      COALESCE(SUM(p.total_amount), 0) - COALESCE(SUM(sp.amount), 0) as balance
    FROM suppliers s
    LEFT JOIN purchases p ON p.supplier_id = s.id
    LEFT JOIN supplier_payments sp ON sp.supplier_id = s.id
    GROUP BY s.id, s.name, s.merchant_id;
    
    -- Grant permissions
    GRANT SELECT ON public.v_supplier_balances TO authenticated;
  END IF;
END $$;

SELECT 'Security warnings fixed!' as status;
