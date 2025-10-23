-- Add comprehensive audit trail for subscription management
-- This provides complete visibility into all subscription changes

-- Step 1: Create subscription history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    
    -- Action details
    action TEXT NOT NULL CHECK (action IN (
        'created',
        'extended',
        'cancelled',
        'expired',
        'reactivated',
        'plan_changed',
        'payment_verified'
    )),
    
    -- Change tracking
    old_status TEXT,
    new_status TEXT,
    old_end_date TIMESTAMPTZ,
    new_end_date TIMESTAMPTZ,
    old_plan_type TEXT,
    new_plan_type TEXT,
    
    -- Audit metadata
    performed_by UUID REFERENCES auth.users(id),
    performed_by_role TEXT, -- admin, service_role, system
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_subscription_history_subscription ON public.subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_merchant ON public.subscription_history(merchant_id);
CREATE INDEX idx_subscription_history_action ON public.subscription_history(action);
CREATE INDEX idx_subscription_history_created ON public.subscription_history(created_at DESC);
CREATE INDEX idx_subscription_history_performed_by ON public.subscription_history(performed_by);

-- Step 2: Create audit logging function
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_performed_by UUID;
    v_role TEXT;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            IF NEW.status = 'cancelled' THEN
                v_action := 'cancelled';
            ELSIF NEW.status = 'expired' THEN
                v_action := 'expired';
            ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
                v_action := 'reactivated';
            END IF;
        ELSIF OLD.end_date != NEW.end_date THEN
            v_action := 'extended';
        ELSIF OLD.plan_type != NEW.plan_type THEN
            v_action := 'plan_changed';
        ELSE
            v_action := 'updated';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'deleted';
    END IF;
    
    -- Get current user
    v_performed_by := auth.uid();
    
    -- Determine role
    IF auth.jwt()->>'role' = 'service_role' THEN
        v_role := 'service_role';
    ELSIF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = v_performed_by AND role = 'admin'
    ) THEN
        v_role := 'admin';
    ELSE
        v_role := 'user';
    END IF;
    
    -- Log the change
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.subscription_history (
            subscription_id,
            merchant_id,
            action,
            old_status,
            old_end_date,
            old_plan_type,
            performed_by,
            performed_by_role
        ) VALUES (
            OLD.id,
            OLD.merchant_id,
            v_action,
            OLD.status,
            OLD.end_date,
            OLD.plan_type,
            v_performed_by,
            v_role
        );
        RETURN OLD;
    ELSE
        INSERT INTO public.subscription_history (
            subscription_id,
            merchant_id,
            action,
            old_status,
            new_status,
            old_end_date,
            new_end_date,
            old_plan_type,
            new_plan_type,
            performed_by,
            performed_by_role
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            COALESCE(NEW.merchant_id, OLD.merchant_id),
            v_action,
            OLD.status,
            NEW.status,
            OLD.end_date,
            NEW.end_date,
            OLD.plan_type,
            NEW.plan_type,
            v_performed_by,
            v_role
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger for automatic audit logging
DROP TRIGGER IF EXISTS audit_subscription_changes ON public.user_subscriptions;

CREATE TRIGGER audit_subscription_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_change();

-- Step 4: RLS Policies for subscription_history
CREATE POLICY "Users can view their own subscription history"
    ON public.subscription_history FOR SELECT
    USING (
        merchant_id IN (
            SELECT merchant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all subscription history"
    ON public.subscription_history FOR SELECT
    USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Step 5: Create view for merchant-facing subscription status
CREATE OR REPLACE VIEW public.merchant_subscription_status AS
SELECT 
    m.id as merchant_id,
    m.business_name,
    m.email,
    us.id as subscription_id,
    us.plan_type,
    us.status,
    us.start_date,
    us.end_date,
    CASE 
        WHEN us.status = 'active' AND us.end_date > NOW() THEN 
            EXTRACT(DAY FROM (us.end_date - NOW()))::INTEGER
        ELSE 0
    END as days_remaining,
    CASE
        WHEN us.status = 'active' AND us.end_date > NOW() THEN true
        ELSE false
    END as has_access,
    us.features_enabled,
    us.max_users,
    us.max_products,
    (
        SELECT COUNT(*) 
        FROM public.subscription_history sh 
        WHERE sh.subscription_id = us.id
    ) as total_changes,
    (
        SELECT action 
        FROM public.subscription_history sh 
        WHERE sh.subscription_id = us.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_action,
    us.created_at,
    us.updated_at
FROM public.merchants m
LEFT JOIN public.user_subscriptions us ON m.id = us.merchant_id AND us.status = 'active'
ORDER BY m.created_at DESC;

-- RLS for the view
ALTER VIEW public.merchant_subscription_status SET (security_invoker = true);

-- Step 6: Helper function to get subscription history
CREATE OR REPLACE FUNCTION get_subscription_history(
    p_merchant_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    action TEXT,
    old_status TEXT,
    new_status TEXT,
    old_end_date TIMESTAMPTZ,
    new_end_date TIMESTAMPTZ,
    performed_by_email TEXT,
    performed_by_role TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.id,
        sh.action,
        sh.old_status,
        sh.new_status,
        sh.old_end_date,
        sh.new_end_date,
        p.email as performed_by_email,
        sh.performed_by_role,
        sh.notes,
        sh.created_at
    FROM public.subscription_history sh
    LEFT JOIN public.profiles p ON sh.performed_by = p.id
    WHERE (p_merchant_id IS NULL OR sh.merchant_id = p_merchant_id)
    ORDER BY sh.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add comments for documentation
COMMENT ON TABLE public.subscription_history IS 
    'Complete audit trail of all subscription changes with who, what, when details';

COMMENT ON FUNCTION log_subscription_change() IS 
    'Automatically logs all subscription changes to subscription_history table';

COMMENT ON VIEW public.merchant_subscription_status IS 
    'Read-only view for merchants to see their subscription status and access rights';

COMMENT ON FUNCTION get_subscription_history(UUID, INTEGER) IS 
    'Retrieves formatted subscription history with user details';
