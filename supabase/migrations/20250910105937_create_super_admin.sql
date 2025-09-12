-- Create Sample Super Admin User and Demo Data
-- This migration creates a super admin user for testing DevAdmin dashboard

-- 1. Create sample super admin user (will be created via Supabase Auth)
-- Email: admin@krishisethu.com
-- Password: SuperAdmin123!
-- Note: This user needs to be created manually via Supabase Auth UI or API

-- 2. Create demo merchant for testing
INSERT INTO merchants (id, name, business_type, address, phone, email, gst_number, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Demo Fertilizer Store', 'retailer', '123 Main Street, Demo City, Demo State', '+91-9876543210', 'demo@fertilizer.com', '27ABCDE1234F1Z5', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Assign demo merchant to free plan
INSERT INTO merchant_subscriptions (merchant_id, plan_id, status, billing_cycle, current_period_start, current_period_end) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    sp.id,
    'active',
    'monthly',
    NOW(),
    NOW() + INTERVAL '1 month'
FROM subscription_plans sp 
WHERE sp.name = 'free'
ON CONFLICT (merchant_id) DO NOTHING;

-- 4. Create sample audit logs
INSERT INTO audit_logs (merchant_id, action, resource_type, resource_id, new_values, severity, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'product', gen_random_uuid(), '{"name": "NPK Fertilizer", "price": 500}', 'info', '{"source": "demo_data"}'),
('550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'customer', gen_random_uuid(), '{"name": "Updated Customer", "phone": "+91-9876543211"}', 'info', '{"source": "demo_data"}'),
('550e8400-e29b-41d4-a716-446655440001', 'DELETE', 'sale', gen_random_uuid(), '{"amount": 1500, "status": "cancelled"}', 'warning', '{"source": "demo_data"}'),
(NULL, 'LOGIN', 'system', NULL, '{"user_agent": "Mozilla/5.0", "ip": "192.168.1.100"}', 'info', '{"source": "demo_data", "login_type": "admin"}');

-- 5. Create sample system metrics
INSERT INTO system_metrics (metric_type, metric_name, value, unit, labels) VALUES
('performance', 'cpu_usage', 45.2, 'percentage', '{"server": "web-1", "region": "asia"}'),
('performance', 'memory_usage', 68.7, 'percentage', '{"server": "web-1", "region": "asia"}'),
('performance', 'disk_usage', 34.1, 'percentage', '{"server": "web-1", "region": "asia"}'),
('database', 'active_connections', 23, 'count', '{"database": "main"}'),
('database', 'query_time_avg', 125.5, 'ms', '{"database": "main"}'),
('application', 'active_users', 156, 'count', '{"period": "last_hour"}'),
('application', 'api_calls', 2847, 'count', '{"period": "last_hour"}'),
('application', 'error_rate', 0.8, 'percentage', '{"period": "last_hour"}'),
('storage', 'total_size', 2.4, 'gb', '{"type": "database"}'),
('storage', 'backup_size', 1.8, 'gb', '{"type": "backup"}');

-- 6. Create sample platform notifications
INSERT INTO platform_notifications (title, message, type, target_audience, is_active, show_until) VALUES
('Welcome to KrishiSethu DevAdmin', 'Welcome to the KrishiSethu platform administration dashboard. Monitor your system health, manage merchants, and track usage from here.', 'info', 'admins', true, NOW() + INTERVAL '30 days'),
('System Maintenance Scheduled', 'Scheduled maintenance window on Sunday 2AM-4AM IST. Expect brief service interruptions.', 'warning', 'all', true, NOW() + INTERVAL '7 days'),
('New Feature: Advanced Analytics', 'We have launched advanced analytics for merchant usage tracking. Check it out in the monitoring section.', 'success', 'admins', true, NOW() + INTERVAL '14 days');

-- 7. Create sample usage statistics for demo merchant
INSERT INTO usage_statistics (merchant_id, period_start, period_end, users_count, products_count, invoices_count, customers_count, sales_amount, storage_used_mb, api_calls_count, login_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', date_trunc('month', NOW() - INTERVAL '1 month'), date_trunc('month', NOW()), 3, 45, 128, 67, 125000.00, 45, 1250, 89),
('550e8400-e29b-41d4-a716-446655440001', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month', 3, 48, 89, 71, 89500.00, 52, 890, 67);

-- 8. Function to create super admin profile (to be called after user signup)
CREATE OR REPLACE FUNCTION create_super_admin_profile(user_id UUID, email TEXT)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Insert or update the profile with super admin privileges
    INSERT INTO profiles (id, full_name, role, is_platform_admin, admin_permissions, merchant_id)
    VALUES (
        user_id,
        'Platform Administrator',
        'super_admin',
        TRUE,
        ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        NULL  -- Super admin is not tied to any specific merchant
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_platform_admin = TRUE,
        admin_permissions = ARRAY['all_merchants', 'system_metrics', 'audit_logs', 'user_management', 'subscription_management'],
        merchant_id = NULL,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    -- Log the super admin creation
    PERFORM log_audit_event(
        NULL, -- No specific merchant
        'CREATE',
        'super_admin',
        profile_id,
        NULL,
        jsonb_build_object('email', email, 'role', 'super_admin'),
        'info',
        jsonb_build_object('action', 'super_admin_created', 'email', email)
    );
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Instructions for manual setup
/*
MANUAL SETUP REQUIRED:

1. Create Super Admin User via Supabase Auth:
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Add User"
   - Email: admin@krishisethu.com
   - Password: SuperAdmin123!
   - Email Confirm: true
   - After creation, note the user UUID

2. Create Super Admin Profile:
   - Run this SQL with the actual user UUID:
   
   SELECT create_super_admin_profile(
       'YOUR_USER_UUID_HERE', 
       'admin@krishisethu.com'
   );

3. Test Access:
   - Login with admin@krishisethu.com / SuperAdmin123!
   - Navigate to /devadmin in your application
   - Verify access to all DevAdmin features

4. Security Reminder:
   - Change the default password immediately after first login
   - Consider enabling 2FA for the super admin account
   - Regularly review admin permissions and access logs
*/

-- Comments
COMMENT ON FUNCTION create_super_admin_profile IS 'Creates or updates a user profile with super admin privileges';
