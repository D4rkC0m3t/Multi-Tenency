-- PhonePe Subscription Billing System Migration
-- Implements 15-day free trial with monthly/yearly plans

-- =====================================================
-- 1. TENANT SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    
    -- Plan Details
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    plan_amount INTEGER NOT NULL, -- Amount in paise (₹3,999 = 399900)
    
    -- Trial Period
    trial_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
    is_trial_active BOOLEAN GENERATED ALWAYS AS (
        NOW() BETWEEN trial_start_date AND trial_end_date
    ) STORED,
    
    -- Subscription Status
    subscription_status TEXT NOT NULL DEFAULT 'trial' 
        CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled', 'payment_failed')),
    
    -- PhonePe Integration
    phonepe_mandate_id TEXT UNIQUE,
    phonepe_customer_ref TEXT UNIQUE,
    phonepe_subscription_id TEXT UNIQUE,
    
    -- Billing Cycle
    next_billing_date TIMESTAMPTZ,
    last_payment_date TIMESTAMPTZ,
    billing_cycle_day INTEGER, -- Day of month for billing (1-28)
    
    -- Payment Details
    total_payments_made INTEGER DEFAULT 0,
    total_amount_paid BIGINT DEFAULT 0, -- In paise
    failed_payment_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Constraints
    CONSTRAINT unique_active_subscription_per_merchant 
        UNIQUE (merchant_id) WHERE subscription_status IN ('trial', 'active')
);

-- Indexes for performance
CREATE INDEX idx_tenant_subscriptions_merchant ON public.tenant_subscriptions(merchant_id);
CREATE INDEX idx_tenant_subscriptions_status ON public.tenant_subscriptions(subscription_status);
CREATE INDEX idx_tenant_subscriptions_next_billing ON public.tenant_subscriptions(next_billing_date) 
    WHERE subscription_status = 'active';
CREATE INDEX idx_tenant_subscriptions_trial_end ON public.tenant_subscriptions(trial_end_date) 
    WHERE subscription_status = 'trial';

-- =====================================================
-- 2. SUBSCRIPTION AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.tenant_subscriptions(id) ON DELETE SET NULL,
    
    -- Event Details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'trial_started',
        'trial_ending_soon',
        'trial_expired',
        'mandate_initiated',
        'mandate_approved',
        'mandate_rejected',
        'subscription_activated',
        'payment_initiated',
        'payment_success',
        'payment_failed',
        'subscription_renewed',
        'subscription_cancelled',
        'subscription_expired',
        'plan_upgraded',
        'plan_downgraded'
    )),
    
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Event Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- PhonePe Response
    phonepe_transaction_id TEXT,
    phonepe_response JSONB,
    
    -- User Context
    triggered_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_audit_merchant ON public.subscription_audit_log(merchant_id);
CREATE INDEX idx_subscription_audit_subscription ON public.subscription_audit_log(subscription_id);
CREATE INDEX idx_subscription_audit_event_type ON public.subscription_audit_log(event_type);
CREATE INDEX idx_subscription_audit_timestamp ON public.subscription_audit_log(event_timestamp DESC);

-- =====================================================
-- 3. PAYMENT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.tenant_subscriptions(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'renewal', 'upgrade', 'refund')),
    amount INTEGER NOT NULL, -- In paise
    currency TEXT NOT NULL DEFAULT 'INR',
    
    -- PhonePe Details
    phonepe_transaction_id TEXT UNIQUE,
    phonepe_merchant_transaction_id TEXT UNIQUE NOT NULL,
    phonepe_payment_instrument JSONB,
    
    -- Status
    payment_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
    
    -- Timestamps
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Response Data
    phonepe_response JSONB,
    error_code TEXT,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_transactions_merchant ON public.payment_transactions(merchant_id);
CREATE INDEX idx_payment_transactions_subscription ON public.payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(payment_status);
CREATE INDEX idx_payment_transactions_phonepe_txn ON public.payment_transactions(phonepe_transaction_id);

-- =====================================================
-- 4. SUBSCRIPTION NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscription_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.tenant_subscriptions(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'trial_ending_3days',
        'trial_ending_1day',
        'trial_expired',
        'payment_upcoming',
        'payment_success',
        'payment_failed',
        'subscription_cancelled',
        'subscription_renewed'
    )),
    
    -- Delivery
    sent_at TIMESTAMPTZ,
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
    delivery_channel TEXT CHECK (delivery_channel IN ('email', 'sms', 'in_app', 'webhook')),
    
    -- Content
    subject TEXT,
    message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_notifications_merchant ON public.subscription_notifications(merchant_id);
CREATE INDEX idx_subscription_notifications_status ON public.subscription_notifications(delivery_status);

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function to initialize trial subscription on merchant creation
CREATE OR REPLACE FUNCTION initialize_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tenant_subscriptions (
        merchant_id,
        plan_type,
        plan_amount,
        trial_start_date,
        trial_end_date,
        subscription_status,
        phonepe_customer_ref
    ) VALUES (
        NEW.id,
        'monthly',
        399900, -- ₹3,999 in paise
        NOW(),
        NOW() + INTERVAL '15 days',
        'trial',
        'KRISHI_' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8))
    );
    
    -- Log trial start
    INSERT INTO public.subscription_audit_log (
        merchant_id,
        subscription_id,
        event_type,
        metadata
    ) SELECT 
        NEW.id,
        id,
        'trial_started',
        jsonb_build_object(
            'trial_days', 15,
            'trial_end_date', NOW() + INTERVAL '15 days'
        )
    FROM public.tenant_subscriptions
    WHERE merchant_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create trial subscription
DROP TRIGGER IF EXISTS trigger_initialize_trial_subscription ON public.merchants;
CREATE TRIGGER trigger_initialize_trial_subscription
    AFTER INSERT ON public.merchants
    FOR EACH ROW
    EXECUTE FUNCTION initialize_trial_subscription();

-- Function to check and update expired trials
CREATE OR REPLACE FUNCTION check_expired_trials()
RETURNS void AS $$
BEGIN
    -- Update expired trials
    UPDATE public.tenant_subscriptions
    SET 
        subscription_status = 'expired',
        updated_at = NOW()
    WHERE 
        subscription_status = 'trial'
        AND trial_end_date < NOW();
    
    -- Log expired trials
    INSERT INTO public.subscription_audit_log (
        merchant_id,
        subscription_id,
        event_type,
        metadata
    )
    SELECT 
        merchant_id,
        id,
        'trial_expired',
        jsonb_build_object(
            'expired_at', NOW(),
            'trial_duration_days', EXTRACT(DAY FROM (trial_end_date - trial_start_date))
        )
    FROM public.tenant_subscriptions
    WHERE 
        subscription_status = 'expired'
        AND updated_at > NOW() - INTERVAL '1 minute'; -- Only recently expired
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription status for a merchant
CREATE OR REPLACE FUNCTION get_merchant_subscription_status(p_merchant_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_type TEXT,
    subscription_status TEXT,
    is_trial_active BOOLEAN,
    days_remaining INTEGER,
    next_billing_date TIMESTAMPTZ,
    can_access_system BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id,
        ts.plan_type,
        ts.subscription_status,
        ts.is_trial_active,
        CASE 
            WHEN ts.subscription_status = 'trial' THEN 
                GREATEST(0, EXTRACT(DAY FROM (ts.trial_end_date - NOW()))::INTEGER)
            ELSE 0
        END as days_remaining,
        ts.next_billing_date,
        CASE 
            WHEN ts.subscription_status IN ('trial', 'active') THEN TRUE
            ELSE FALSE
        END as can_access_system
    FROM public.tenant_subscriptions ts
    WHERE ts.merchant_id = p_merchant_id
    ORDER BY ts.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription timestamps
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_timestamp ON public.tenant_subscriptions;
CREATE TRIGGER trigger_update_subscription_timestamp
    BEFORE UPDATE ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_timestamp();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for tenant_subscriptions
CREATE POLICY "Users can view their merchant subscription"
    ON public.tenant_subscriptions FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all subscriptions"
    ON public.tenant_subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Policies for subscription_audit_log
CREATE POLICY "Users can view their merchant audit logs"
    ON public.subscription_audit_log FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Policies for payment_transactions
CREATE POLICY "Users can view their merchant transactions"
    ON public.payment_transactions FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Policies for subscription_notifications
CREATE POLICY "Users can view their merchant notifications"
    ON public.subscription_notifications FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.tenant_subscriptions IS 'Stores subscription details for each tenant with 15-day trial period';
COMMENT ON TABLE public.subscription_audit_log IS 'Complete audit trail of all subscription events';
COMMENT ON TABLE public.payment_transactions IS 'Records all PhonePe payment transactions';
COMMENT ON TABLE public.subscription_notifications IS 'Tracks subscription-related notifications sent to users';

COMMENT ON FUNCTION initialize_trial_subscription() IS 'Automatically creates 15-day trial subscription when merchant is created';
COMMENT ON FUNCTION check_expired_trials() IS 'Scheduled function to check and update expired trial subscriptions';
COMMENT ON FUNCTION get_merchant_subscription_status(UUID) IS 'Returns current subscription status and access permissions for a merchant';

-- =====================================================
-- 8. INITIAL DATA / SEED (Optional)
-- =====================================================

-- Update existing merchants to have trial subscriptions
INSERT INTO public.tenant_subscriptions (
    merchant_id,
    plan_type,
    plan_amount,
    trial_start_date,
    trial_end_date,
    subscription_status,
    phonepe_customer_ref
)
SELECT 
    m.id,
    'monthly',
    399900,
    NOW(),
    NOW() + INTERVAL '15 days',
    'trial',
    'KRISHI_' || UPPER(SUBSTRING(m.id::TEXT, 1, 8))
FROM public.merchants m
WHERE NOT EXISTS (
    SELECT 1 FROM public.tenant_subscriptions ts 
    WHERE ts.merchant_id = m.id
)
ON CONFLICT DO NOTHING;

-- Log the initialization
INSERT INTO public.subscription_audit_log (
    merchant_id,
    subscription_id,
    event_type,
    metadata
)
SELECT 
    ts.merchant_id,
    ts.id,
    'trial_started',
    jsonb_build_object(
        'trial_days', 15,
        'trial_end_date', ts.trial_end_date,
        'migration', true
    )
FROM public.tenant_subscriptions ts
WHERE ts.created_at > NOW() - INTERVAL '1 minute';
