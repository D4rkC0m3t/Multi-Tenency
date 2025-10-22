-- Payment Management System Migration
-- Admin control for payment verification and subscription management

-- =====================================================
-- 1. PAYMENT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    
    -- Payment Details
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    -- Payment Method
    payment_method TEXT DEFAULT 'phonepe' CHECK (payment_method IN ('phonepe', 'bank_transfer', 'other')),
    transaction_id TEXT,
    payment_screenshot_url TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
    
    -- Verification
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Subscription Period
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_submissions_merchant ON public.payment_submissions(merchant_id);
CREATE INDEX idx_payment_submissions_status ON public.payment_submissions(status);
CREATE INDEX idx_payment_submissions_created ON public.payment_submissions(created_at DESC);

-- =====================================================
-- 2. USER SUBSCRIPTIONS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    
    -- Subscription Details
    plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'monthly', 'yearly', 'lifetime')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    
    -- Dates
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    trial_end_date TIMESTAMPTZ,
    
    -- Payment Reference
    payment_submission_id UUID REFERENCES public.payment_submissions(id),
    
    -- Auto-renewal
    auto_renew BOOLEAN DEFAULT false,
    
    -- Access Control
    features_enabled JSONB DEFAULT '{"pos": true, "inventory": true, "reports": true, "einvoice": true}'::jsonb,
    max_users INTEGER DEFAULT 5,
    max_products INTEGER DEFAULT 1000,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT unique_active_subscription UNIQUE (merchant_id) WHERE status = 'active'
);

-- Indexes
CREATE INDEX idx_user_subscriptions_merchant ON public.user_subscriptions(merchant_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_end_date ON public.user_subscriptions(end_date);

-- =====================================================
-- 3. PAYMENT AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_submission_id UUID REFERENCES public.payment_submissions(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'submission_created',
        'payment_verified',
        'payment_rejected',
        'subscription_activated',
        'subscription_renewed',
        'subscription_cancelled',
        'subscription_expired',
        'access_granted',
        'access_revoked'
    )),
    
    -- Actor
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Details
    old_status TEXT,
    new_status TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_audit_merchant ON public.payment_audit_log(merchant_id);
CREATE INDEX idx_payment_audit_submission ON public.payment_audit_log(payment_submission_id);
CREATE INDEX idx_payment_audit_performed_at ON public.payment_audit_log(performed_at DESC);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_access(p_merchant_id UUID)
RETURNS TABLE (
    has_access BOOLEAN,
    subscription_status TEXT,
    days_remaining INTEGER,
    plan_type TEXT,
    features_enabled JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN us.status = 'active' AND us.end_date > NOW() THEN TRUE
            ELSE FALSE
        END as has_access,
        us.status as subscription_status,
        GREATEST(0, EXTRACT(DAY FROM (us.end_date - NOW()))::INTEGER) as days_remaining,
        us.plan_type,
        us.features_enabled
    FROM public.user_subscriptions us
    WHERE us.merchant_id = p_merchant_id
    AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;
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
    v_merchant_id UUID;
    v_plan_type TEXT;
    v_amount DECIMAL;
    v_subscription_end TIMESTAMPTZ;
BEGIN
    -- Get payment details
    SELECT merchant_id, plan_type, amount
    INTO v_merchant_id, v_plan_type, v_amount
    FROM public.payment_submissions
    WHERE id = p_payment_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment submission not found';
    END IF;
    
    -- Calculate subscription end date
    IF v_plan_type = 'monthly' THEN
        v_subscription_end := NOW() + INTERVAL '1 month';
    ELSIF v_plan_type = 'yearly' THEN
        v_subscription_end := NOW() + INTERVAL '1 year';
    END IF;
    
    -- Update payment submission
    UPDATE public.payment_submissions
    SET 
        status = 'verified',
        verified_by = p_verified_by,
        verified_at = NOW(),
        subscription_start_date = NOW(),
        subscription_end_date = v_subscription_end,
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    -- Create or update subscription
    INSERT INTO public.user_subscriptions (
        merchant_id,
        plan_type,
        status,
        start_date,
        end_date,
        payment_submission_id
    ) VALUES (
        v_merchant_id,
        v_plan_type,
        'active',
        NOW(),
        v_subscription_end,
        p_payment_id
    )
    ON CONFLICT (merchant_id) WHERE status = 'active'
    DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        end_date = EXCLUDED.end_date,
        payment_submission_id = EXCLUDED.payment_submission_id,
        updated_at = NOW();
    
    -- Log the event
    INSERT INTO public.payment_audit_log (
        payment_submission_id,
        merchant_id,
        event_type,
        performed_by,
        new_status,
        notes
    ) VALUES (
        p_payment_id,
        v_merchant_id,
        'payment_verified',
        p_verified_by,
        'verified',
        p_notes
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject payment
CREATE OR REPLACE FUNCTION reject_payment(
    p_payment_id UUID,
    p_rejected_by UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_merchant_id UUID;
BEGIN
    -- Get merchant_id
    SELECT merchant_id INTO v_merchant_id
    FROM public.payment_submissions
    WHERE id = p_payment_id;
    
    -- Update payment submission
    UPDATE public.payment_submissions
    SET 
        status = 'rejected',
        verified_by = p_rejected_by,
        verified_at = NOW(),
        rejection_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    -- Log the event
    INSERT INTO public.payment_audit_log (
        payment_submission_id,
        merchant_id,
        event_type,
        performed_by,
        new_status,
        notes
    ) VALUES (
        p_payment_id,
        v_merchant_id,
        'payment_rejected',
        p_rejected_by,
        'rejected',
        p_reason
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and expire subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    -- Update expired subscriptions
    UPDATE public.user_subscriptions
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE 
        status = 'active'
        AND end_date < NOW();
    
    -- Log expired subscriptions
    INSERT INTO public.payment_audit_log (
        merchant_id,
        event_type,
        new_status
    )
    SELECT 
        merchant_id,
        'subscription_expired',
        'expired'
    FROM public.user_subscriptions
    WHERE 
        status = 'expired'
        AND updated_at > NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_payment_timestamp ON public.payment_submissions;
CREATE TRIGGER trigger_update_payment_timestamp
    BEFORE UPDATE ON public.payment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_timestamp();

DROP TRIGGER IF EXISTS trigger_update_subscription_timestamp ON public.user_subscriptions;
CREATE TRIGGER trigger_update_subscription_timestamp
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_timestamp();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for payment_submissions
CREATE POLICY "Users can view their own payment submissions"
    ON public.payment_submissions FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create payment submissions"
    ON public.payment_submissions FOR INSERT
    WITH CHECK (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Admin policies (service role only)
CREATE POLICY "Service role can manage all payments"
    ON public.payment_submissions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all subscriptions"
    ON public.user_subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Policies for payment_audit_log
CREATE POLICY "Users can view their own audit logs"
    ON public.payment_audit_log FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON TABLE public.payment_submissions IS 'Stores payment submissions from users for verification';
COMMENT ON TABLE public.user_subscriptions IS 'Manages active subscriptions and access control';
COMMENT ON TABLE public.payment_audit_log IS 'Audit trail for all payment and subscription events';

COMMENT ON FUNCTION verify_payment_and_activate(UUID, UUID, TEXT) IS 'Verifies payment and activates subscription';
COMMENT ON FUNCTION reject_payment(UUID, UUID, TEXT) IS 'Rejects payment submission with reason';
COMMENT ON FUNCTION check_subscription_access(UUID) IS 'Checks if merchant has active subscription access';
COMMENT ON FUNCTION check_expired_subscriptions() IS 'Scheduled function to expire old subscriptions';
