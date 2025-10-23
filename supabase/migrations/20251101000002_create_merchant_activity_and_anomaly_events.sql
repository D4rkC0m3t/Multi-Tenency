-- Migration: Create merchant_activity and anomaly_events tables
-- ------------------------------------------------------------
-- 1. merchant_activity table (audit‑ready log of merchant actions)
CREATE TABLE IF NOT EXISTS merchant_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  type varchar(30) NOT NULL,               -- e.g. 'onboard', 'payment_verified', 'kyc_rejected'
  description text,
  status varchar(10) DEFAULT 'info',       -- success, warning, error
  created_at timestamp DEFAULT now()
);

-- 2. anomaly_events table (pattern‑detection alerts)
CREATE TABLE IF NOT EXISTS anomaly_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  severity varchar(10) DEFAULT 'info',      -- urgent, warning, info
  detected_at timestamp DEFAULT now()
);

-- Grant RLS policies for admin access (read/write)
CREATE POLICY "admin_select_merchant_activity" ON merchant_activity
  FOR SELECT USING (auth.role() = 'admin');
CREATE POLICY "admin_insert_merchant_activity" ON merchant_activity
  FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "admin_update_merchant_activity" ON merchant_activity
  FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "admin_delete_merchant_activity" ON merchant_activity
  FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "admin_select_anomaly_events" ON anomaly_events
  FOR SELECT USING (auth.role() = 'admin');
CREATE POLICY "admin_insert_anomaly_events" ON anomaly_events
  FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "admin_update_anomaly_events" ON anomaly_events
  FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "admin_delete_anomaly_events" ON anomaly_events
  FOR DELETE USING (auth.role() = 'admin');

-- Enable row level security if not already enabled
ALTER TABLE merchant_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;

-- End of migration
