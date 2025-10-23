-- Migration: Add investors, payment_gateways tables and extend merchants
-- ------------------------------------------------------------
-- 1. investors table
CREATE TABLE IF NOT EXISTS investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text
);

-- 2. payment_gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  enabled boolean DEFAULT false,
  trial_active boolean DEFAULT false,
  webhook_url text,
  webhook_status varchar(10) DEFAULT 'unknown',
  token_expires_at timestamp
);

-- 3. Extend merchants table
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS investor_id uuid REFERENCES investors(id),
  ADD COLUMN IF NOT EXISTS kyc_status varchar(20) DEFAULT 'pending';

-- Grant RLS policies for new tables (admin only)
-- Assuming an admin role exists in the auth schema
CREATE POLICY "admin_select_investors" ON investors
  FOR SELECT USING (auth.role() = 'admin');
CREATE POLICY "admin_insert_investors" ON investors
  FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "admin_update_investors" ON investors
  FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "admin_delete_investors" ON investors
  FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "admin_select_gateways" ON payment_gateways
  FOR SELECT USING (auth.role() = 'admin');
CREATE POLICY "admin_insert_gateways" ON payment_gateways
  FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "admin_update_gateways" ON payment_gateways
  FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "admin_delete_gateways" ON payment_gateways
  FOR DELETE USING (auth.role() = 'admin');

-- Enable row level security if not already enabled
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- End of migration
