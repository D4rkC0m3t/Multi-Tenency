-- Migration: Create merchant_actions view and log_merchant_action RPC
-- ------------------------------------------------------------
-- 1. merchant_actions view (aggregated counts for dashboard)
CREATE OR REPLACE VIEW merchant_actions AS
SELECT
  (SELECT COUNT(*) FROM merchants) AS total_merchants,
  (SELECT COUNT(*) FROM merchants WHERE kyc_status = 'pending') AS kyc_pending,
  (SELECT COUNT(*) FROM payment_submissions WHERE status = 'pending') AS payments_pending,
  (SELECT COUNT(*) FROM merchants WHERE kyc_status = 'rejected') AS merchants_rejected;

-- 2. RPC to log merchant actions (audit ready)
CREATE OR REPLACE FUNCTION public.log_merchant_action(
  p_merchant_id uuid,
  p_type text,
  p_description text,
  p_status text DEFAULT 'info'
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO merchant_activity (
    merchant_id,
    type,
    description,
    status,
    created_at
  ) VALUES (
    p_merchant_id,
    p_type,
    p_description,
    p_status,
    now()
  );
END;
$$;

-- Grant RLS policies for the view (read) and function (execute) to admin role
GRANT SELECT ON merchant_actions TO anon; -- optional, adjust as needed
GRANT EXECUTE ON FUNCTION public.log_merchant_action(uuid, text, text, text) TO anon; -- optional

-- End of migration
