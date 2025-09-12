-- DevAdmin Dashboard Database Schema (CORRECTED)
-- This migration adds tables and functions for platform administration
-- Fixed to match existing profiles table structure

-- 1. Extend profiles table to support super_admin role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Add platform admin fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMPTZ;

-- Create index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_platform_admin ON profiles(is_platform_admin) WHERE is_platform_admin = TRUE;

-- 2. Audit Logs Table - Track all system activities
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Fixed: references profiles(id)
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    resource_type VARCHAR(50) NOT NULL, -- 'product', 'sale', 'customer', 'user', etc.
    resource_id UUID, -- ID of the affected resource
    old_values JSONB, -- Previous state (for updates/deletes)
    new_values JSONB, -- New state (for creates/updates)
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
    metadata JSONB DEFAULT '{}', -- Additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_merchant ON audit_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- 3. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    features JSONB DEFAULT '{}', -- Feature limits and permissions
    max_users INTEGER DEFAULT 5,
    max_products INTEGER DEFAULT 1000,
    max_invoices_per_month INTEGER DEFAULT 500,
    max_storage_mb INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, max_users, max_products, max_invoices_per_month, max_storage_mb) VALUES
('free', 'Free Plan', 'Basic plan for small businesses', 0, 0, '{"support": "email", "reports": "basic"}', 2, 100, 50, 100),
('starter', 'Starter Plan', 'Perfect for growing businesses', 999, 9999, '{"support": "priority", "reports": "advanced", "api_access": true}', 5, 1000, 500, 1000),
('professional', 'Professional Plan', 'For established businesses', 2999, 29999, '{"support": "phone", "reports": "premium", "api_access": true, "custom_fields": true}', 15, 5000, 2000, 5000),
('enterprise', 'Enterprise Plan', 'For large organizations', 9999, 99999, '{"support": "dedicated", "reports": "enterprise", "api_access": true, "custom_fields": true, "white_label": true}', -1, -1, -1, -1)
ON CONFLICT (name) DO NOTHING;

-- 4. Merchant Subscriptions Table
CREATE TABLE IF NOT EXISTS merchant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE UNIQUE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
    trial_end TIMESTAMPTZ,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    razorpay_customer_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    last_payment_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    payment_method VARCHAR(50), -- 'stripe', 'razorpay', 'manual'
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_merchant_subscriptions_merchant ON merchant_subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_subscriptions_status ON merchant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_merchant_subscriptions_expiry ON merchant_subscriptions(current_period_end);

-- 5. System Metrics Table - Store system health data
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(50) NOT NULL, -- 'db_size', 'active_users', 'api_calls', 'error_rate'
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20), -- 'bytes', 'count', 'percentage', 'ms'
    labels JSONB DEFAULT '{}', -- Additional metadata
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded ON system_metrics(recorded_at DESC);

-- 6. Platform Notifications Table - Global announcements
CREATE TABLE IF NOT EXISTS platform_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    target_audience VARCHAR(20) DEFAULT 'all', -- 'all', 'merchants', 'admins'
    target_plan VARCHAR(50), -- Optional: target specific subscription plan
    is_active BOOLEAN DEFAULT TRUE,
    show_until TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id), -- Fixed: references profiles(id)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Usage Statistics Table - Track feature usage per merchant
CREATE TABLE IF NOT EXISTS usage_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    users_count INTEGER DEFAULT 0,
    products_count INTEGER DEFAULT 0,
    invoices_count INTEGER DEFAULT 0,
    customers_count INTEGER DEFAULT 0,
    sales_amount DECIMAL(15,2) DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for usage statistics
CREATE INDEX IF NOT EXISTS idx_usage_stats_merchant ON usage_statistics(merchant_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_period ON usage_statistics(period_start, period_end);

-- 8. RLS Policies for DevAdmin

-- Audit logs - Only super admins can see all, merchants see only their own
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() -- Fixed: use profiles.id
            AND profiles.is_platform_admin = TRUE
        )
    );

CREATE POLICY "Merchants can view their own audit logs" ON audit_logs
    FOR SELECT USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles 
            WHERE id = auth.uid() -- Fixed: use profiles.id
        )
    );

-- Subscription plans - Read-only for all authenticated users
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view subscription plans" ON subscription_plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- Merchant subscriptions - Super admins see all, merchants see their own
ALTER TABLE merchant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all subscriptions" ON merchant_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() -- Fixed: use profiles.id
            AND profiles.is_platform_admin = TRUE
        )
    );

CREATE POLICY "Merchants can view their own subscription" ON merchant_subscriptions
    FOR SELECT USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles 
            WHERE id = auth.uid() -- Fixed: use profiles.id
        )
    );

-- System metrics - Only super admins
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only super admins can access system metrics" ON system_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() -- Fixed: use profiles.id
            AND profiles.is_platform_admin = TRUE
        )
    );

-- Platform notifications - Super admins manage, all can read active ones
ALTER TABLE platform_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage platform notifications" ON platform_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() -- Fixed: use profiles.id
            AND profiles.is_platform_admin = TRUE
        )
    );

CREATE POLICY "Users can view active platform notifications" ON platform_notifications
    FOR SELECT USING (
        is_active = TRUE 
        AND (show_until IS NULL OR show_until > NOW())
        AND auth.role() = 'authenticated'
    );

-- Usage statistics - Super admins see all, merchants see their own
ALTER TABLE usage_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all usage statistics" ON usage_statistics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() -- Fixed: use profiles.id
            AND profiles.is_platform_admin = TRUE
        )
    );

CREATE POLICY "Merchants can view their own usage statistics" ON usage_statistics
    FOR SELECT USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles 
            WHERE id = auth.uid() -- Fixed: use profiles.id
        )
    );

-- 9. Functions for DevAdmin

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_merchant_id UUID,
    p_action VARCHAR(100),
    p_resource_type VARCHAR(50),
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'info',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        merchant_id, user_id, action, resource_type, resource_id,
        old_values, new_values, severity, metadata
    ) VALUES (
        p_merchant_id, auth.uid(), p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_severity, p_metadata
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get merchant usage for current period
CREATE OR REPLACE FUNCTION get_merchant_current_usage(p_merchant_id UUID)
RETURNS TABLE (
    users_count BIGINT,
    products_count BIGINT,
    invoices_count BIGINT,
    customers_count BIGINT,
    storage_used_mb BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM profiles WHERE merchant_id = p_merchant_id),
        (SELECT COUNT(*) FROM products WHERE merchant_id = p_merchant_id),
        (SELECT COUNT(*) FROM sales WHERE merchant_id = p_merchant_id AND created_at >= date_trunc('month', NOW())),
        (SELECT COUNT(*) FROM customers WHERE merchant_id = p_merchant_id),
        0::BIGINT -- Placeholder for storage calculation
    ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if merchant exceeds plan limits
CREATE OR REPLACE FUNCTION check_plan_limits(p_merchant_id UUID)
RETURNS TABLE (
    limit_type TEXT,
    current_usage BIGINT,
    plan_limit BIGINT,
    is_exceeded BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH merchant_plan AS (
        SELECT sp.* FROM subscription_plans sp
        JOIN merchant_subscriptions ms ON sp.id = ms.plan_id
        WHERE ms.merchant_id = p_merchant_id AND ms.status = 'active'
    ),
    current_usage AS (
        SELECT * FROM get_merchant_current_usage(p_merchant_id)
    )
    SELECT 'users'::TEXT, cu.users_count, mp.max_users::BIGINT, 
           (mp.max_users > 0 AND cu.users_count > mp.max_users) as is_exceeded
    FROM merchant_plan mp, current_usage cu
    UNION ALL
    SELECT 'products'::TEXT, cu.products_count, mp.max_products::BIGINT,
           (mp.max_products > 0 AND cu.products_count > mp.max_products) as is_exceeded
    FROM merchant_plan mp, current_usage cu
    UNION ALL
    SELECT 'invoices'::TEXT, cu.invoices_count, mp.max_invoices_per_month::BIGINT,
           (mp.max_invoices_per_month > 0 AND cu.invoices_count > mp.max_invoices_per_month) as is_exceeded
    FROM merchant_plan mp, current_usage cu;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Triggers for automatic audit logging

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    merchant_id_val UUID;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Get merchant_id from the record
    IF TG_OP = 'DELETE' THEN
        merchant_id_val := OLD.merchant_id;
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSE
        merchant_id_val := NEW.merchant_id;
        new_data := to_jsonb(NEW);
        IF TG_OP = 'UPDATE' THEN
            old_data := to_jsonb(OLD);
        ELSE
            old_data := NULL;
        END IF;
    END IF;

    -- Log the audit event
    PERFORM log_audit_event(
        merchant_id_val,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data,
        'info',
        jsonb_build_object('table', TG_TABLE_NAME, 'schema', TG_TABLE_SCHEMA)
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for key tables
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_sales_trigger ON sales;
CREATE TRIGGER audit_sales_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_customers_trigger ON customers;
CREATE TRIGGER audit_customers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Update timestamps trigger for subscription tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_merchant_subscriptions_updated_at ON merchant_subscriptions;
CREATE TRIGGER update_merchant_subscriptions_updated_at
    BEFORE UPDATE ON merchant_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system activities';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans with features and limits';
COMMENT ON TABLE merchant_subscriptions IS 'Active subscriptions for each merchant';
COMMENT ON TABLE system_metrics IS 'System health and performance metrics';
COMMENT ON TABLE platform_notifications IS 'Global notifications and announcements';
COMMENT ON TABLE usage_statistics IS 'Monthly usage statistics per merchant';

COMMENT ON FUNCTION log_audit_event IS 'Centralized function to log audit events with context';
COMMENT ON FUNCTION get_merchant_current_usage IS 'Get current usage statistics for a merchant';
COMMENT ON FUNCTION check_plan_limits IS 'Check if merchant usage exceeds their plan limits';