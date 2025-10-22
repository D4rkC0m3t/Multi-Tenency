-- Create subscription tables for trial and payment management
-- Migration: 20251022000004_create_subscription_tables.sql

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'monthly', 'yearly', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  trial_end_date TIMESTAMPTZ,
  payment_submission_id UUID,
  auto_renew BOOLEAN DEFAULT false,
  features_enabled JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 5,
  max_products INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(merchant_id, status) WHERE status = 'active'
);

-- Payment Submissions Table
CREATE TABLE IF NOT EXISTS payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'phonepe',
  transaction_id TEXT,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Audit Log Table
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_submission_id UUID REFERENCES payment_submissions(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_merchant ON user_subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_payment_submissions_merchant ON payment_submissions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON payment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_created ON payment_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_audit_merchant ON payment_audit_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_payment ON payment_audit_log(payment_submission_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- User Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all subscriptions"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Payment Submissions Policies
CREATE POLICY "Users can view their own payment submissions"
  ON payment_submissions FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create payment submissions"
  ON payment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all payment submissions"
  ON payment_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Payment Audit Log Policies
CREATE POLICY "Users can view their own audit logs"
  ON payment_audit_log FOR SELECT
  TO authenticated
  USING (
    merchant_id IN (
      SELECT merchant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all audit logs"
  ON payment_audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to check subscription access
CREATE OR REPLACE FUNCTION check_subscription_access(p_merchant_id UUID)
RETURNS TABLE (
  has_access BOOLEAN,
  subscription_status TEXT,
  days_remaining INTEGER,
  plan_type TEXT,
  features_enabled JSONB
) AS $$
DECLARE
  v_subscription RECORD;
  v_merchant_created_at TIMESTAMPTZ;
  v_trial_days INTEGER;
BEGIN
  -- Check for active subscription
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE merchant_id = p_merchant_id
    AND status = 'active'
    AND end_date > NOW()
  ORDER BY end_date DESC
  LIMIT 1;

  IF FOUND THEN
    -- Has active subscription
    RETURN QUERY SELECT
      true AS has_access,
      v_subscription.status AS subscription_status,
      GREATEST(0, EXTRACT(DAY FROM v_subscription.end_date - NOW())::INTEGER) AS days_remaining,
      v_subscription.plan_type AS plan_type,
      v_subscription.features_enabled AS features_enabled;
    RETURN;
  END IF;

  -- No active subscription - check trial period
  SELECT created_at INTO v_merchant_created_at
  FROM merchants
  WHERE id = p_merchant_id;

  IF v_merchant_created_at IS NULL THEN
    -- Merchant not found
    RETURN QUERY SELECT
      false AS has_access,
      'none'::TEXT AS subscription_status,
      0 AS days_remaining,
      NULL::TEXT AS plan_type,
      '{}'::JSONB AS features_enabled;
    RETURN;
  END IF;

  -- Calculate trial days
  v_trial_days := GREATEST(0, 15 - EXTRACT(DAY FROM NOW() - v_merchant_created_at)::INTEGER);

  IF v_trial_days > 0 THEN
    -- Trial active
    RETURN QUERY SELECT
      true AS has_access,
      'trial'::TEXT AS subscription_status,
      v_trial_days AS days_remaining,
      'trial'::TEXT AS plan_type,
      '{}'::JSONB AS features_enabled;
  ELSE
    -- Trial expired
    RETURN QUERY SELECT
      false AS has_access,
      'trial_expired'::TEXT AS subscription_status,
      0 AS days_remaining,
      NULL::TEXT AS plan_type,
      '{}'::JSONB AS features_enabled;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify payment and activate subscription
CREATE OR REPLACE FUNCTION verify_payment_and_activate(
  p_payment_id UUID,
  p_verified_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payment RECORD;
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_subscription_id UUID;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment
  FROM payment_submissions
  WHERE id = p_payment_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or already processed';
  END IF;

  -- Calculate subscription dates
  v_start_date := NOW();
  IF v_payment.plan_type = 'monthly' THEN
    v_end_date := v_start_date + INTERVAL '30 days';
  ELSIF v_payment.plan_type = 'yearly' THEN
    v_end_date := v_start_date + INTERVAL '365 days';
  ELSE
    RAISE EXCEPTION 'Invalid plan type';
  END IF;

  -- Update payment submission
  UPDATE payment_submissions
  SET
    status = 'verified',
    verified_by = p_verified_by,
    verified_at = NOW(),
    subscription_start_date = v_start_date,
    subscription_end_date = v_end_date,
    notes = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_payment_id;

  -- Deactivate any existing active subscriptions
  UPDATE user_subscriptions
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE merchant_id = v_payment.merchant_id
    AND status = 'active';

  -- Create new subscription
  INSERT INTO user_subscriptions (
    merchant_id,
    plan_type,
    status,
    start_date,
    end_date,
    payment_submission_id,
    auto_renew,
    features_enabled
  ) VALUES (
    v_payment.merchant_id,
    v_payment.plan_type,
    'active',
    v_start_date,
    v_end_date,
    p_payment_id,
    false,
    '{}'::JSONB
  )
  RETURNING id INTO v_subscription_id;

  -- Log audit event
  INSERT INTO payment_audit_log (
    payment_submission_id,
    merchant_id,
    event_type,
    performed_by,
    old_status,
    new_status,
    notes
  ) VALUES (
    p_payment_id,
    v_payment.merchant_id,
    'payment_verified',
    p_verified_by,
    'pending',
    'verified',
    p_notes
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject payment
CREATE OR REPLACE FUNCTION reject_payment(
  p_payment_id UUID,
  p_rejected_by UUID,
  p_rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_merchant_id UUID;
BEGIN
  -- Update payment submission
  UPDATE payment_submissions
  SET
    status = 'rejected',
    verified_by = p_rejected_by,
    verified_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_payment_id
    AND status = 'pending'
  RETURNING merchant_id INTO v_merchant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or already processed';
  END IF;

  -- Log audit event
  INSERT INTO payment_audit_log (
    payment_submission_id,
    merchant_id,
    event_type,
    performed_by,
    old_status,
    new_status,
    notes
  ) VALUES (
    p_payment_id,
    v_merchant_id,
    'payment_rejected',
    p_rejected_by,
    'pending',
    'rejected',
    p_rejection_reason
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and expire subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_subscription RECORD;
BEGIN
  FOR v_subscription IN
    SELECT id, merchant_id
    FROM user_subscriptions
    WHERE status = 'active'
      AND end_date < NOW()
  LOOP
    -- Update subscription status
    UPDATE user_subscriptions
    SET
      status = 'expired',
      updated_at = NOW()
    WHERE id = v_subscription.id;

    -- Log audit event
    INSERT INTO payment_audit_log (
      merchant_id,
      event_type,
      old_status,
      new_status,
      notes
    ) VALUES (
      v_subscription.merchant_id,
      'subscription_expired',
      'active',
      'expired',
      'Subscription expired automatically'
    );

    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_submissions_updated_at
  BEFORE UPDATE ON payment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE user_subscriptions IS 'Stores active and historical subscriptions for merchants';
COMMENT ON TABLE payment_submissions IS 'Stores payment submissions from merchants for manual verification';
COMMENT ON TABLE payment_audit_log IS 'Audit trail for all payment and subscription events';
